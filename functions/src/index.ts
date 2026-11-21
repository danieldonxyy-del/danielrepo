import { randomBytes, timingSafeEqual } from 'node:crypto';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type UserRecord } from 'firebase-admin/auth';
import { FieldValue, getFirestore, type DocumentData, type Transaction } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

if (getApps().length === 0) initializeApp();

const auth = getAuth();
const db = getFirestore();
const bootstrapKeySecret = defineSecret('SUPER_ADMIN_BOOTSTRAP_KEY');
const bootstrapMarker = db.collection('_system').doc('firstSuperAdminBootstrap');

const validRoles = [
  'super_admin',
  'campus_admin',
  'ormawa_admin',
  'organization_admin',
  'dormitory_admin',
  'spiritual_admin',
] as const;

type AdminRole = (typeof validRoles)[number];
type AdminStatus = 'active' | 'suspended' | 'revoked';

interface ProvisionAdminPayload {
  targetUid?: unknown;
  targetEmail?: unknown;
  role?: unknown;
  organizationId?: unknown;
  displayName?: unknown;
  permissionScope?: unknown;
  status?: unknown;
}

const scopedRoles: AdminRole[] = [
  'organization_admin',
  'ormawa_admin',
  'dormitory_admin',
  'spiritual_admin',
];

const isAdminRole = (value: unknown): value is AdminRole =>
  typeof value === 'string' && validRoles.includes(value as AdminRole);

const getCallerAdmin = async (uid: string): Promise<DocumentData | null> => {
  const snapshot = await db.collection('admins').doc(uid).get();
  return snapshot.exists ? snapshot.data() ?? null : null;
};

const assertSuperAdmin = async (uid: string): Promise<void> => {
  const caller = await getCallerAdmin(uid);
  if (!caller || caller.role !== 'super_admin' || caller.status !== 'active') {
    throw new HttpsError(
      'permission-denied',
      'Hanya Super Admin aktif yang dapat mengelola akses administrator.'
    );
  }
};

const requireCaller = (request: { auth?: { uid: string; token: Record<string, unknown> } }) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Silakan masuk terlebih dahulu.');
  }
  return request.auth;
};

const resolveTargetUser = async (payload: ProvisionAdminPayload): Promise<UserRecord> => {
  try {
    if (typeof payload.targetUid === 'string' && payload.targetUid.trim()) {
      return await auth.getUser(payload.targetUid.trim());
    }
    if (typeof payload.targetEmail === 'string' && payload.targetEmail.trim()) {
      return await auth.getUserByEmail(payload.targetEmail.trim().toLowerCase());
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-email')
    ) {
      throw new HttpsError(
        'failed-precondition',
        'Buat akun Firebase Authentication dan verifikasi emailnya sebelum menetapkan peran.'
      );
    }
    throw error;
  }
  throw new HttpsError('invalid-argument', 'targetUid atau targetEmail wajib diisi.');
};

const ensureActiveSuperAdminRemains = async (
  transaction: Transaction,
  targetUid: string,
  current: DocumentData | undefined,
  nextRole: AdminRole,
  nextStatus: AdminStatus
) => {
  if (current?.role !== 'super_admin' || current.status !== 'active') return;
  if (nextRole === 'super_admin' && nextStatus === 'active') return;
  const activeSuperAdmins = await transaction.get(
    db.collection('admins')
      .where('role', '==', 'super_admin')
      .where('status', '==', 'active')
  );
  if (activeSuperAdmins.size <= 1 && activeSuperAdmins.docs[0]?.id === targetUid) {
    throw new HttpsError(
      'failed-precondition',
      'Administrator Super Admin aktif terakhir tidak dapat dinonaktifkan atau diturunkan perannya.'
    );
  }
};

const setAdminClaims = async (user: UserRecord, role: AdminRole, organizationId: string | null, active: boolean) => {
  await auth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    role,
    organizationId,
    isAdmin: active,
  });
};

export const bootstrapFirstSuperAdmin = onCall(
  { secrets: [bootstrapKeySecret] },
  async (request) => {
    const caller = requireCaller(request);
    if (caller.token.email_verified !== true) {
      throw new HttpsError('permission-denied', 'Email akun bootstrap harus terverifikasi.');
    }

    const submittedKey = request.data?.bootstrapKey;
    const expectedKey = bootstrapKeySecret.value();
    if (typeof submittedKey !== 'string' || !expectedKey) {
      throw new HttpsError('permission-denied', 'Kunci bootstrap tidak valid atau belum dikonfigurasi.');
    }
    const submittedBuffer = Buffer.from(submittedKey);
    const expectedBuffer = Buffer.from(expectedKey);
    if (
      submittedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(submittedBuffer, expectedBuffer)
    ) {
      throw new HttpsError('permission-denied', 'Kunci bootstrap tidak valid.');
    }

    const user = await auth.getUser(caller.uid);
    const adminRef = db.collection('admins').doc(user.uid);
    await db.runTransaction(async (transaction) => {
      const markerSnapshot = await transaction.get(bootstrapMarker);
      const existingSuperAdmins = await transaction.get(
        db.collection('admins').where('role', '==', 'super_admin').limit(1)
      );
      if (markerSnapshot.exists || !existingSuperAdmins.empty) {
        throw new HttpsError('already-exists', 'Bootstrap Super Admin pertama sudah pernah digunakan.');
      }

      transaction.create(adminRef, {
        uid: user.uid,
        email: user.email ?? caller.token.email ?? '',
        name: user.displayName ?? user.email?.split('@')[0] ?? 'Super Admin',
        role: 'super_admin',
        organizationId: null,
        permissionScope: 'global',
        status: 'active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        createdBy: 'first-super-admin-bootstrap',
      });
      transaction.create(bootstrapMarker, {
        uid: user.uid,
        completedAt: FieldValue.serverTimestamp(),
      });
    });

    await setAdminClaims(user, 'super_admin', null, true);
    return { success: true, uid: user.uid };
  }
);

export const provisionAdminRole = onCall(async (request) => {
  const caller = requireCaller(request);
  await assertSuperAdmin(caller.uid);

  const payload = request.data as ProvisionAdminPayload;
  const role = isAdminRole(payload.role) ? payload.role : null;
  if (!role) throw new HttpsError('invalid-argument', 'Peran administrator tidak valid.');

  const organizationId =
    typeof payload.organizationId === 'string' && payload.organizationId.trim()
      ? payload.organizationId.trim()
      : null;
  if (scopedRoles.includes(role) && !organizationId) {
    throw new HttpsError('invalid-argument', 'Peran ini wajib memiliki organizationId.');
  }
  if (role === 'super_admin' && organizationId) {
    throw new HttpsError('invalid-argument', 'Super Admin tidak dapat dibatasi pada satu organisasi.');
  }
  if (!scopedRoles.includes(role) && organizationId) {
    throw new HttpsError('invalid-argument', 'Organization ID hanya berlaku untuk administrator berskala organisasi.');
  }

  const status =
    payload.status === undefined || payload.status === 'active'
      ? 'active'
      : payload.status === 'suspended'
        ? 'suspended'
        : null;
  if (!status) throw new HttpsError('invalid-argument', 'Status harus active atau suspended.');

  if (organizationId) {
    const organizationSnapshot = await db.collection('organizations').doc(organizationId).get();
    if (!organizationSnapshot.exists || organizationSnapshot.data()?.status !== 'active') {
      throw new HttpsError('failed-precondition', 'Organisasi tidak ditemukan atau tidak aktif.');
    }
  }

  const user = await resolveTargetUser(payload);
  if (!user.emailVerified || !user.email) {
    throw new HttpsError('failed-precondition', 'Email akun administrator harus terverifikasi.');
  }

  const adminRef = db.collection('admins').doc(user.uid);
  const callerRef = db.collection('admins').doc(caller.uid);
  const organizationRef = organizationId
    ? db.collection('organizations').doc(organizationId)
    : null;
  await db.runTransaction(async (transaction) => {
    const [callerSnapshot, currentSnapshot, organizationSnapshot] = await Promise.all([
      transaction.get(callerRef),
      transaction.get(adminRef),
      organizationRef ? transaction.get(organizationRef) : Promise.resolve(null),
    ]);
    const callerRecord = callerSnapshot.data();
    if (!callerRecord || callerRecord.role !== 'super_admin' || callerRecord.status !== 'active') {
      throw new HttpsError('permission-denied', 'Hak Super Admin tidak lagi aktif.');
    }
    if (organizationRef && (!organizationSnapshot?.exists || organizationSnapshot.data()?.status !== 'active')) {
      throw new HttpsError('failed-precondition', 'Organisasi tidak aktif saat provisioning berlangsung.');
    }
    const current = currentSnapshot.data();
    await ensureActiveSuperAdminRemains(transaction, user.uid, current, role, status);
    const displayName =
      typeof payload.displayName === 'string' && payload.displayName.trim()
        ? payload.displayName.trim().slice(0, 100)
        : typeof current?.name === 'string'
          ? current.name
          : user.displayName ?? user.email?.split('@')[0] ?? '';
    const permissionScope =
      typeof payload.permissionScope === 'string' && payload.permissionScope.trim()
        ? payload.permissionScope.trim().slice(0, 160)
        : scopedRoles.includes(role) ? `${role}:${organizationId}` : 'global';
    const record = {
      uid: user.uid,
      email: user.email,
      name: displayName,
      role,
      organizationId: scopedRoles.includes(role) ? organizationId : null,
      permissionScope,
      status,
      createdAt: current?.createdAt ?? FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: current?.createdBy ?? caller.uid,
    };
    transaction.set(adminRef, record);
  });

  await setAdminClaims(user, role, scopedRoles.includes(role) ? organizationId : null, status === 'active');
  return {
    success: true,
    uid: user.uid,
    email: user.email,
    role,
    organizationId: scopedRoles.includes(role) ? organizationId : null,
    status,
  };
});

export const revokeAdminAccess = onCall(async (request) => {
  const caller = requireCaller(request);
  await assertSuperAdmin(caller.uid);

  const targetUid = typeof request.data?.targetUid === 'string' ? request.data.targetUid.trim() : '';
  if (!targetUid) throw new HttpsError('invalid-argument', 'targetUid wajib diisi.');
  const target = await auth.getUser(targetUid);
  const adminRef = db.collection('admins').doc(targetUid);
  const callerRef = db.collection('admins').doc(caller.uid);

  const revokedScope = await db.runTransaction(async (transaction) => {
    const [callerSnapshot, snapshot] = await Promise.all([
      transaction.get(callerRef),
      transaction.get(adminRef),
    ]);
    const callerRecord = callerSnapshot.data();
    if (!callerRecord || callerRecord.role !== 'super_admin' || callerRecord.status !== 'active') {
      throw new HttpsError('permission-denied', 'Hak Super Admin tidak lagi aktif.');
    }
    if (!snapshot.exists) throw new HttpsError('not-found', 'Administrator tidak ditemukan.');
    const current = snapshot.data();
    if (!isAdminRole(current?.role)) {
      throw new HttpsError('failed-precondition', 'Peran administrator tersimpan tidak valid.');
    }
    await ensureActiveSuperAdminRemains(transaction, targetUid, current, current.role, 'revoked');
    transaction.update(adminRef, {
      status: 'revoked',
      updatedAt: FieldValue.serverTimestamp(),
      revokedBy: caller.uid,
    });
    return {
      role: current.role,
      organizationId: typeof current.organizationId === 'string' ? current.organizationId : null,
    };
  });
  await setAdminClaims(target, revokedScope.role, revokedScope.organizationId, false);
  return { success: true, uid: targetUid, status: 'revoked' };
});

export const createUserProfile = onCall(async (request) => {
  const caller = requireCaller(request);
  const email = typeof caller.token.email === 'string' ? caller.token.email.toLowerCase() : '';
  if (
    caller.token.email_verified !== true ||
    !email.endsWith('@student.unklab.ac.id')
  ) {
    throw new HttpsError(
      'permission-denied',
      'Profil mahasiswa hanya dapat dibuat untuk email @student.unklab.ac.id terverifikasi.'
    );
  }

  const userRef = db.collection('users').doc(caller.uid);
  const adminRef = db.collection('admins').doc(caller.uid);
  await db.runTransaction(async (transaction) => {
    const [adminSnapshot, snapshot] = await Promise.all([
      transaction.get(adminRef),
      transaction.get(userRef),
    ]);
    if (adminSnapshot.exists) {
      throw new HttpsError('permission-denied', 'Akun administrator tidak boleh dibuat sebagai profil mahasiswa.');
    }
    if (snapshot.exists) return;
    transaction.create(userRef, {
      id: caller.uid,
      email,
      fullName: typeof caller.token.name === 'string' ? caller.token.name : '',
      nim: '',
      faculty: '',
      batch: 0,
      residenceStatus: 'off_campus',
      studentStatus: 'active',
      avatarUrl: typeof caller.token.picture === 'string' ? caller.token.picture : null,
    });
  });
  return { success: true, uid: caller.uid };
});

export const setEventRSVP = onCall(async (request) => {
  const caller = requireCaller(request);
  const email = typeof caller.token.email === 'string' ? caller.token.email.toLowerCase() : '';
  if (caller.token.email_verified !== true || !email.endsWith('@student.unklab.ac.id')) {
    throw new HttpsError('permission-denied', 'RSVP hanya tersedia untuk mahasiswa terverifikasi.');
  }

  const eventId = typeof request.data?.eventId === 'string' ? request.data.eventId.trim() : '';
  const status = request.data?.status;
  if (!eventId || eventId.includes('/') || eventId.length > 128) {
    throw new HttpsError('invalid-argument', 'eventId tidak valid.');
  }
  if (status !== 'none' && status !== 'going' && status !== 'interested') {
    throw new HttpsError('invalid-argument', 'Status RSVP tidak valid.');
  }

  const userRef = db.collection('admins').doc(caller.uid);
  const eventRef = db.collection('events').doc(eventId);
  const registrationId = `${caller.uid}_${eventId}`;
  const registrationRef = db.collection('registrations').doc(registrationId);
  const result = await db.runTransaction(async (transaction) => {
    const [adminSnapshot, eventSnapshot, registrationSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(eventRef),
      transaction.get(registrationRef),
    ]);
    if (adminSnapshot.exists) {
      throw new HttpsError('permission-denied', 'Akun administrator tidak dapat membuat RSVP mahasiswa.');
    }

    const existing = registrationSnapshot.data();
    if (
      registrationSnapshot.exists &&
      (existing?.studentId !== caller.uid || existing?.eventId !== eventId)
    ) {
      throw new HttpsError('failed-precondition', 'Pendaftaran tidak cocok dengan akun atau acara yang diminta.');
    }
    if (status === 'none') {
      if (existing?.attendanceStatus === 'checked_in') {
        throw new HttpsError('failed-precondition', 'RSVP yang sudah memiliki kehadiran tidak dapat dihapus.');
      }
      if (registrationSnapshot.exists) transaction.delete(registrationRef);
      return null;
    }

    const event = eventSnapshot.data();
    if (
      !eventSnapshot.exists ||
      event?.status !== 'published' ||
      typeof event?.category !== 'string' ||
      !['spiritual', 'academic', 'ormawa', 'dormitory', 'seminar', 'competition'].includes(event.category)
    ) {
      throw new HttpsError('failed-precondition', 'Acara tidak tersedia untuk pendaftaran.');
    }
    if (
      existing &&
      (existing.category !== event.category ||
        existing.organizationId !== (typeof event.organizationId === 'string' ? event.organizationId : undefined))
    ) {
      throw new HttpsError('failed-precondition', 'Pendaftaran lama perlu dimigrasikan sebelum diubah.');
    }
    if (existing?.attendanceStatus === 'checked_in' && status !== existing.status) {
      throw new HttpsError('failed-precondition', 'RSVP dengan kehadiran tercatat tidak dapat diubah.');
    }

    const registration: DocumentData = {
      id: registrationId,
      eventId,
      studentId: caller.uid,
      category: event.category,
      status,
      attendanceStatus: existing?.attendanceStatus ?? 'not_checked_in',
      registeredAt: existing?.registeredAt ?? new Date().toISOString(),
    };
    if (typeof event?.organizationId === 'string') {
      registration.organizationId = event.organizationId;
    }
    if (status === 'going') {
      registration.registrationToken =
        existing?.status === 'going' && typeof existing.registrationToken === 'string'
          ? existing.registrationToken
          : `KLS-${eventId}-${randomBytes(16).toString('hex').toUpperCase()}`;
    }
    if (existing?.checkedInAt) registration.checkedInAt = existing.checkedInAt;

    transaction.set(registrationRef, registration);
    return registration;
  });
  return { success: true, registration: result };
});

export const checkInAttendance = onCall(async (request) => {
  const caller = requireCaller(request);
  const registrationToken =
    typeof request.data?.registrationToken === 'string' ? request.data.registrationToken.trim() : '';
  if (!registrationToken) throw new HttpsError('invalid-argument', 'Token kehadiran wajib diisi.');

  const adminRef = db.collection('admins').doc(caller.uid);
  const adminSnapshot = await adminRef.get();
  const adminRecord = adminSnapshot.data();
  if (!adminRecord || adminRecord.status !== 'active' || !isAdminRole(adminRecord.role)) {
    throw new HttpsError('permission-denied', 'Hanya administrator aktif yang dapat mencatat kehadiran.');
  }

  const registrations = await db
    .collection('registrations')
    .where('registrationToken', '==', registrationToken)
    .limit(1)
    .get();
  if (registrations.empty) throw new HttpsError('not-found', 'Token pendaftaran tidak ditemukan.');

  const registrationDoc = registrations.docs[0];
  const eventRef = db.collection('events').doc(String(registrationDoc.data().eventId ?? ''));
  const eventSnapshot = await eventRef.get();
  if (!eventSnapshot.exists) throw new HttpsError('not-found', 'Acara untuk pendaftaran ini tidak ditemukan.');
  const event = eventSnapshot.data();
  const registrationData = registrationDoc.data();
  if (
    !registrationData ||
    registrationData.status !== 'going' ||
    registrationData.category !== event?.category ||
    registrationData.organizationId !== (typeof event?.organizationId === 'string' ? event.organizationId : undefined)
  ) {
    throw new HttpsError('failed-precondition', 'Data pendaftaran tidak valid atau perlu dimigrasikan.');
  }
  const scoped = scopedRoles.includes(adminRecord.role);
  if (scoped && (!adminRecord.organizationId || event?.organizationId !== adminRecord.organizationId)) {
    throw new HttpsError('permission-denied', 'Acara berada di luar cakupan organisasi administrator.');
  }
  if (
    (adminRecord.role === 'dormitory_admin' && event?.category !== 'dormitory') ||
    (adminRecord.role === 'spiritual_admin' && event?.category !== 'spiritual') ||
    (adminRecord.role === 'ormawa_admin' && event?.category !== 'ormawa')
  ) {
    throw new HttpsError('permission-denied', 'Acara berada di luar cakupan kategori administrator.');
  }

  const checkedInAt = new Date().toISOString();
  const result = await db.runTransaction(async (transaction) => {
    const [currentAdmin, currentRegistration, currentEvent] = await Promise.all([
      transaction.get(adminRef),
      transaction.get(registrationDoc.ref),
      transaction.get(eventRef),
    ]);
    const currentAdminData = currentAdmin.data();
    const currentRegistrationData = currentRegistration.data();
    if (
      !currentAdminData ||
      currentAdminData.status !== 'active' ||
      !isAdminRole(currentAdminData.role)
    ) {
      throw new HttpsError('permission-denied', 'Akses administrator telah dicabut.');
    }
    if (!currentEvent.exists) throw new HttpsError('not-found', 'Acara tidak ditemukan.');
    if (
      scopedRoles.includes(currentAdminData.role) &&
      (!currentAdminData.organizationId ||
        currentEvent.data()?.organizationId !== currentAdminData.organizationId)
    ) {
      throw new HttpsError('permission-denied', 'Acara berada di luar cakupan organisasi administrator.');
    }
    if (
      (currentAdminData.role === 'dormitory_admin' && currentEvent.data()?.category !== 'dormitory') ||
      (currentAdminData.role === 'spiritual_admin' && currentEvent.data()?.category !== 'spiritual') ||
      (currentAdminData.role === 'ormawa_admin' && currentEvent.data()?.category !== 'ormawa')
    ) {
      throw new HttpsError('permission-denied', 'Acara berada di luar cakupan kategori administrator.');
    }
    if (
      !currentRegistrationData ||
      currentRegistrationData.status !== 'going' ||
      currentRegistrationData.registrationToken !== registrationToken ||
      currentRegistrationData.category !== currentEvent.data()?.category ||
      currentRegistrationData.organizationId !== (
        typeof currentEvent.data()?.organizationId === 'string'
          ? currentEvent.data()?.organizationId
          : undefined
      )
    ) {
      throw new HttpsError('failed-precondition', 'Data pendaftaran tidak valid atau perlu dimigrasikan.');
    }
    if (currentRegistrationData.attendanceStatus === 'checked_in') {
      throw new HttpsError('already-exists', 'Kehadiran sudah tercatat sebelumnya.');
    }
    transaction.update(registrationDoc.ref, {
      attendanceStatus: 'checked_in',
      checkedInAt: FieldValue.serverTimestamp(),
    });
    return {
      ...currentRegistrationData,
      id: registrationDoc.id,
      attendanceStatus: 'checked_in',
      checkedInAt,
    };
  });
  return { success: true, message: 'Kehadiran berhasil dicatat.', registration: result };
});
