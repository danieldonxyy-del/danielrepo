import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  CampusEvent,
  StudentProfile,
  AdminUser,
  CampusOrganization,
  CampusAnnouncement,
  EventRegistration,
  NotificationItem,
  AdminRole,
  RSVPStatus,
  DemoAuthSession,
} from '../types';
import { initialEvents } from '../data/mockEvents';
import { initialStudentProfile, initialAdminUsers } from '../data/mockUsers';
import { initialOrganizations } from '../data/mockOrganizations';
import { initialAnnouncements } from '../data/mockAnnouncements';
import { attendanceService } from '../services/attendanceService';
import { eventService } from '../services/eventService';
import { firebaseService } from '../services/firebase';
import { AppContext } from './AppContext';

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Midweek Chapel Tonight',
    message: 'Starts at 18:30 WITA in Pioneer Chapel. 1 Chapel Point awarded upon attendance scan.',
    category: 'reminder',
    timestamp: '2 hours ago',
    isRead: false,
    link: '/events',
  },
  {
    id: 'notif-2',
    title: 'FIK Hackathon Registration Closes Soon',
    message: 'Registration deadline is tonight at 23:59 WITA for teams of 3 students.',
    category: 'event',
    timestamp: '5 hours ago',
    isRead: false,
    link: '/events',
  },
  {
    id: 'notif-3',
    title: 'Midterm Exam Schedule Circular',
    message: 'Official exam schedule and dress code regulations released by BAA.',
    category: 'announcement',
    timestamp: '1 day ago',
    isRead: true,
    link: '/announcements',
  },
];

const readStoredValue = <T,>(key: string, fallback: T): T => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const emptyStudentProfile: StudentProfile = {
  id: '',
  fullName: '',
  nim: '',
  email: '',
  faculty: '',
  batch: 0,
  residenceStatus: 'off_campus',
  studentStatus: 'active',
};

const createId = (prefix: string) =>
  `${prefix}-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now()}`;

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Terjadi kesalahan saat menyinkronkan data.';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoAuthUser, setDemoAuthUser] = useState<DemoAuthSession | null>(() =>
    readStoredValue<DemoAuthSession | null>('klabatsync_demo_session', null)
  );
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('klabatsync_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const [activeRole, setActiveRoleState] = useState<AdminRole>(
    () => demoAuthUser?.role ?? 'student'
  );
  const [presentationMode, setPresentationMode] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isBootstrapCandidate, setIsBootstrapCandidate] = useState(false);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(firebaseService.isConfigured);
  const [isSessionValidated, setIsSessionValidated] = useState(false);
  const [dataStatus, setDataStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    demoAuthUser ? 'ready' : firebaseService.isConfigured ? 'loading' : 'idle'
  );
  const [dataError, setDataError] = useState<string | null>(null);
  const [isGlobalAIChatOpen, setIsGlobalAIChatOpen] = useState(false);
  const [globalAIChatContextEventId, setGlobalAIChatContextEventId] = useState<string | null>(null);

  const [events, setEvents] = useState<CampusEvent[]>(() =>
    demoAuthUser ? eventService.getAllEvents() : []
  );
  const [agendaEvents, setAgendaEvents] = useState<CampusEvent[]>([]);
  const [student, setStudent] = useState<StudentProfile>(() =>
    demoAuthUser ? readStoredValue('klabatsync_student', initialStudentProfile) : emptyStudentProfile
  );
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() =>
    demoAuthUser ? readStoredValue('klabatsync_admins', initialAdminUsers) : []
  );
  const [organizations, setOrganizations] = useState<CampusOrganization[]>(() =>
    demoAuthUser ? readStoredValue('klabatsync_orgs', initialOrganizations) : []
  );
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>(() =>
    demoAuthUser ? readStoredValue('klabatsync_announcements', initialAnnouncements) : []
  );
  const [registrations, setRegistrations] = useState<EventRegistration[]>(() =>
    demoAuthUser ? attendanceService.getRegistrations() : []
  );
  const [bookmarks, setBookmarks] = useState<string[]>(() =>
    demoAuthUser ? readStoredValue('klabatsync_bookmarks', ['evt-001', 'evt-002']) : []
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    demoAuthUser ? readStoredValue('klabatsync_notifications', initialNotifications) : []
  );
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(() => {
    if (!demoAuthUser || demoAuthUser.role === 'student') return null;
    return adminUsers.find(
      (admin) => admin.id === demoAuthUser.userId || admin.email.toLowerCase() === demoAuthUser.email.toLowerCase()
    ) ?? null;
  });
  const announcementReadIds = useRef<Set<string>>(new Set());
  const dataUnsubscribers = useRef<Array<() => void>>([]);
  const activeDataSession = useRef<string | null>(null);
  const suppressAuthResolution = useRef(false);

  const isDemoMode = Boolean(demoAuthUser && !firebaseUser);
  const isAuthenticated = isDemoMode || Boolean(firebaseUser && isSessionValidated);

  const clearProductionData = useCallback(() => {
    setEvents([]);
    setAgendaEvents([]);
    setStudent(emptyStudentProfile);
    setAdminUsers([]);
    setOrganizations([]);
    setAnnouncements([]);
    setRegistrations([]);
    setBookmarks([]);
    setNotifications([]);
    announcementReadIds.current.clear();
  }, []);

  const stopDataListeners = useCallback(() => {
    dataUnsubscribers.current.forEach((unsubscribe) => unsubscribe());
    dataUnsubscribers.current = [];
    activeDataSession.current = null;
  }, []);

  const reportDataError = useCallback((error: unknown) => {
    setDataError(getErrorMessage(error));
    setDataStatus('error');
  }, []);

  const trackWrite = useCallback(
    (operation: Promise<unknown>, rollback?: () => void) => {
      void operation.catch((error: unknown) => {
        rollback?.();
        reportDataError(error);
      });
    },
    [reportDataError]
  );

  const startProductionListeners = useCallback(
    (uid: string, role: AdminRole, organizationId?: string) => {
      const sessionKey = `${uid}:${role}:${organizationId ?? ''}`;
      if (activeDataSession.current === sessionKey) return;
      stopDataListeners();
      activeDataSession.current = sessionKey;
      setDataError(null);
      setDataStatus('loading');

      const onError = (error: Error) => reportDataError(error);
      const pendingSources = new Set(['events', 'organizations', 'announcements', 'registrations']);
      if (role === 'super_admin') pendingSources.add('admins');
      if (role === 'student') {
        pendingSources.add('bookmarks');
        pendingSources.add('agenda');
        pendingSources.add('announcementReads');
      }
      const onInitialData = <T,>(source: string, update: (items: T[]) => void) => (items: T[]) => {
        update(items);
        pendingSources.delete(source);
        if (pendingSources.size === 0) {
          setDataStatus((current) => current === 'error' ? current : 'ready');
        }
      };

      dataUnsubscribers.current = [
        firebaseService.watchEvents(role, organizationId, onInitialData('events', setEvents), onError),
        firebaseService.watchOrganizations(role, organizationId, onInitialData('organizations', setOrganizations), onError),
        firebaseService.watchAnnouncements(
          role,
          organizationId,
          onInitialData('announcements', (items: CampusAnnouncement[]) =>
            setAnnouncements(items.map((item) => ({
              ...item,
              isRead: announcementReadIds.current.has(item.id),
            })))),
          onError
        ),
        firebaseService.watchRegistrations(uid, role, organizationId, onInitialData('registrations', setRegistrations), onError),
      ];

      if (role === 'super_admin') {
        dataUnsubscribers.current.push(firebaseService.watchAdminUsers(onInitialData('admins', setAdminUsers), onError));
      } else {
        setAdminUsers([]);
      }

      if (role === 'student') {
        dataUnsubscribers.current.push(
          firebaseService.watchBookmarks(uid, onInitialData('bookmarks', setBookmarks), onError),
          firebaseService.watchAgenda(uid, onInitialData('agenda', setAgendaEvents), onError),
          firebaseService.watchAnnouncementReads(uid, onInitialData('announcementReads', (ids) => {
            announcementReadIds.current = new Set(ids);
            setAnnouncements((items) =>
              items.map((item) => ({ ...item, isRead: announcementReadIds.current.has(item.id) }))
            );
          }), onError)
        );
      } else {
        setBookmarks([]);
        setAgendaEvents([]);
      }
    },
    [reportDataError, stopDataListeners]
  );

  useEffect(() => {
    const unsubscribe = firebaseService.onAuthChange(
      (user) => {
        if (suppressAuthResolution.current) return;
        setFirebaseUser(user);
        if (user) {
          setDemoAuthUser(null);
          setIsBootstrapCandidate(false);
          localStorage.removeItem('klabatsync_demo_session');
          setIsSessionValidated(false);
          setIsFirebaseLoading(true);
          setDataStatus('loading');
          clearProductionData();
        } else {
          setIsSessionValidated(false);
          setIsFirebaseLoading(false);
          if (!demoAuthUser) {
            setActiveRoleState('student');
            setCurrentAdminUser(null);
            setDataStatus('idle');
          }
        }
      },
      (error) => {
        reportDataError(error);
        setIsFirebaseLoading(false);
      }
    );
    return () => unsubscribe();
  }, [clearProductionData, demoAuthUser, reportDataError]);

  useEffect(() => {
    if (!firebaseUser) {
      stopDataListeners();
      return;
    }

    let disposed = false;

    const rejectSession = (message: string) => {
      if (disposed) return;
      setDataError(message);
      setDataStatus('error');
      setIsFirebaseLoading(false);
      setIsSessionValidated(false);
      void firebaseService.logout();
    };

    const unsubscribeAdmin = firebaseService.watchAdminProfile(
      firebaseUser.uid,
      (admin) => {
        if (disposed) return;
        if (admin) {
          if (admin.status !== 'active') {
            rejectSession('Akses administrator sedang ditangguhkan atau telah dicabut.');
            return;
          }
          if (
            ['organization_admin', 'ormawa_admin', 'dormitory_admin', 'spiritual_admin'].includes(admin.role) &&
            !admin.organizationId
          ) {
            rejectSession('Profil administrator organisasi tidak memiliki organization ID yang valid.');
            return;
          }
          setActiveRoleState(admin.role);
          setCurrentAdminUser(admin);
          setIsSessionValidated(true);
          setIsFirebaseLoading(false);
          startProductionListeners(firebaseUser.uid, admin.role, admin.organizationId);
          return;
        }

        const verifiedStudent =
          firebaseUser.emailVerified &&
          Boolean(firebaseUser.email?.toLowerCase().endsWith('@student.unklab.ac.id'));
        if (!verifiedStudent) {
          if (firebaseUser.emailVerified) {
            setIsBootstrapCandidate(true);
            setDataError('Akun belum memiliki peran administrator aktif. Hanya lanjutkan bootstrap jika ini adalah akun Super Admin pertama.');
            setDataStatus('ready');
            setIsFirebaseLoading(false);
          } else {
            rejectSession('Email akun belum diverifikasi.');
          }
          return;
        }

        setActiveRoleState('student');
        setCurrentAdminUser(null);
        void firebaseService.ensureStudentProfile(firebaseUser).then((profile) => {
          if (disposed) return;
          setStudent(profile);
          setIsSessionValidated(true);
          setIsFirebaseLoading(false);
          startProductionListeners(firebaseUser.uid, 'student');
          const profileUnsubscribe = firebaseService.watchStudentProfile(
            firebaseUser.uid,
            (updatedProfile) => {
              if (updatedProfile) setStudent(updatedProfile);
            },
            (error) => {
              reportDataError(error);
              setIsFirebaseLoading(false);
              setIsSessionValidated(false);
              void firebaseService.logout();
            }
          );
          dataUnsubscribers.current.push(profileUnsubscribe);
        }).catch((error: unknown) => rejectSession(getErrorMessage(error)));
      },
      reportDataError
    );

    return () => {
      disposed = true;
      unsubscribeAdmin();
      stopDataListeners();
    };
  }, [firebaseUser, clearProductionData, reportDataError, startProductionListeners, stopDataListeners]);

  useEffect(() => {
    localStorage.setItem('klabatsync_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setTheme = (value: 'light' | 'dark') => setThemeState(value);
  const toggleTheme = () => setThemeState((previous) => previous === 'light' ? 'dark' : 'light');

  const activateDemoData = () => {
    const demoEvents = eventService.getAllEvents();
    setEvents(demoEvents);
    setStudent(readStoredValue('klabatsync_student', initialStudentProfile));
    setAdminUsers(readStoredValue('klabatsync_admins', initialAdminUsers));
    setOrganizations(readStoredValue('klabatsync_orgs', initialOrganizations));
    setAnnouncements(readStoredValue('klabatsync_announcements', initialAnnouncements));
    setRegistrations(attendanceService.getRegistrations());
    setBookmarks(readStoredValue('klabatsync_bookmarks', ['evt-001', 'evt-002']));
    setNotifications(readStoredValue('klabatsync_notifications', initialNotifications));
    setAgendaEvents([]);
    setDataError(null);
    setDataStatus('ready');
  };

  const setActiveRole = (role: AdminRole) => {
    if (!isDemoMode || !demoAuthUser) return;
    const updated = { ...demoAuthUser, role };
    setDemoAuthUser(updated);
    setActiveRoleState(role);
    localStorage.setItem('klabatsync_demo_session', JSON.stringify(updated));
  };

  const loginDemoStudent = (email: string, name?: string): DemoAuthSession => {
    void firebaseService.logout();
    stopDataListeners();
    setFirebaseUser(null);
    setIsSessionValidated(false);
    activateDemoData();
    const session: DemoAuthSession = {
      userId: student.id || initialStudentProfile.id,
      name: name || student.fullName || initialStudentProfile.fullName,
      email: email.trim().toLowerCase(),
      role: 'student',
      isDemo: true,
      loggedInAt: new Date().toISOString(),
    };
    setDemoAuthUser(session);
    setActiveRoleState('student');
    setCurrentAdminUser(null);
    localStorage.setItem('klabatsync_demo_session', JSON.stringify(session));
    return session;
  };

  const loginDemoAdmin = (admin: AdminUser): DemoAuthSession => {
    void firebaseService.logout();
    stopDataListeners();
    setFirebaseUser(null);
    setIsSessionValidated(false);
    activateDemoData();
    const session: DemoAuthSession = {
      userId: admin.id,
      name: admin.name,
      email: admin.email.toLowerCase(),
      role: admin.role,
      isDemo: true,
      loggedInAt: new Date().toISOString(),
    };
    setDemoAuthUser(session);
    setActiveRoleState(admin.role);
    setCurrentAdminUser(admin);
    localStorage.setItem('klabatsync_demo_session', JSON.stringify(session));
    return session;
  };

  const beginFirebaseSignIn = () => {
    setDemoAuthUser(null);
    setActiveRoleState('student');
    setCurrentAdminUser(null);
    setIsBootstrapCandidate(false);
    setIsSessionValidated(false);
    setIsFirebaseLoading(true);
    setDataStatus('loading');
    localStorage.removeItem('klabatsync_demo_session');
    clearProductionData();
    setDataError(null);
  };

  const loginWithGoogle = async () => {
    beginFirebaseSignIn();
    try {
      return await firebaseService.loginWithGoogle();
    } catch (error) {
      setIsFirebaseLoading(false);
      setDataStatus('idle');
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    beginFirebaseSignIn();
    try {
      return await firebaseService.loginWithEmail(email, password);
    } catch (error) {
      setIsFirebaseLoading(false);
      setDataStatus('idle');
      throw error;
    }
  };

  const loginAdminWithEmail = async (email: string, password: string) => {
    beginFirebaseSignIn();
    try {
      const { user, admin } = await firebaseService.loginAdminWithEmail(email, password);
      setFirebaseUser(user);
      setCurrentAdminUser(admin);
      setActiveRoleState(admin.role);
      return admin;
    } catch (error) {
      setIsFirebaseLoading(false);
      setDataStatus('idle');
      throw error;
    }
  };

  const bootstrapFirstSuperAdmin = async (email: string, password: string, bootstrapKey: string) => {
    beginFirebaseSignIn();
    try {
      const user = await firebaseService.signInForBootstrap(email, password);
      setFirebaseUser(user);
      await firebaseService.bootstrapFirstSuperAdmin(bootstrapKey);
      setIsBootstrapCandidate(false);
    } catch (error) {
      if (!firebaseUser) setIsFirebaseLoading(false);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    beginFirebaseSignIn();
    suppressAuthResolution.current = true;
    try {
      return await firebaseService.registerWithEmail(name, email, password);
    } finally {
      suppressAuthResolution.current = false;
      setFirebaseUser(null);
      setIsFirebaseLoading(false);
      setDataStatus('idle');
    }
  };

  const logout = async () => {
    localStorage.removeItem('klabatsync_demo_session');
    setDemoAuthUser(null);
    stopDataListeners();
    if (firebaseUser) await firebaseService.logout();
    setFirebaseUser(null);
    setIsSessionValidated(false);
    setIsFirebaseLoading(false);
    setActiveRoleState('student');
    setCurrentAdminUser(null);
    clearProductionData();
  };

  const createEvent = (data: Omit<CampusEvent, 'id' | 'createdAt'>): CampusEvent => {
    const event: CampusEvent = {
      ...data,
      organizationId: data.organizationId ?? currentAdminUser?.organizationId,
      id: createId('evt'),
      createdAt: new Date().toISOString().slice(0, 10),
      isDemo: isDemoMode,
    };
    const previous = events;
    const updated = [event, ...events];
    setEvents(updated);
    if (isDemoMode) {
      eventService.saveEvents(updated);
    } else if (firebaseUser) {
      trackWrite(firebaseService.saveEvent(event), () => setEvents(previous));
    } else {
      setEvents(previous);
    }
    return event;
  };

  const updateEvent = (updatedEvent: CampusEvent) => {
    const previous = events;
    setEvents(events.map((event) => event.id === updatedEvent.id ? updatedEvent : event));
    if (isDemoMode) eventService.saveEvents(events.map((event) => event.id === updatedEvent.id ? updatedEvent : event));
    else if (firebaseUser) trackWrite(firebaseService.saveEvent(updatedEvent), () => setEvents(previous));
  };

  const deleteEvent = (id: string) => {
    const previous = events;
    setEvents(events.filter((event) => event.id !== id));
    if (isDemoMode) eventService.saveEvents(events.filter((event) => event.id !== id));
    else if (firebaseUser) trackWrite(firebaseService.deleteEvent(id), () => setEvents(previous));
  };

  const publishEvent = (id: string) => {
    const event = events.find((item) => item.id === id);
    if (event) updateEvent({ ...event, status: 'published' });
  };

  const cancelEvent = (id: string) => {
    const event = events.find((item) => item.id === id);
    if (event) updateEvent({ ...event, status: 'cancelled' });
  };

  const setRSVP = (eventId: string, status: RSVPStatus): EventRegistration => {
    if (isDemoMode) {
      const registration = attendanceService.setRSVP(eventId, student.id, status);
      setRegistrations(attendanceService.getRegistrations());
      return registration;
    }
    if (!firebaseUser || activeRole !== 'student') {
      throw new Error('Pendaftaran acara hanya tersedia untuk mahasiswa yang masuk.');
    }
    const event = events.find((item) => item.id === eventId);
    if (status === 'none') {
      const previous = registrations;
      setRegistrations(registrations.filter((item) => item.eventId !== eventId));
      trackWrite(
        firebaseService.setEventRSVP(eventId, status).then(() => undefined),
        () => setRegistrations(previous)
      );
      return {
        id: `${firebaseUser.uid}_${eventId}`,
        eventId,
        studentId: firebaseUser.uid,
        status: 'none',
        attendanceStatus: 'not_checked_in',
        registeredAt: '',
      };
    }
    const existing = registrations.find((item) => item.eventId === eventId && item.studentId === firebaseUser.uid);
    const registration: EventRegistration = {
      id: `${firebaseUser.uid}_${eventId}`,
      eventId,
      studentId: firebaseUser.uid,
      organizationId: event?.organizationId,
      status,
      registrationToken: existing?.registrationToken,
      attendanceStatus: existing?.attendanceStatus ?? 'not_checked_in',
      registeredAt: existing?.registeredAt ?? new Date().toISOString(),
    };
    const previous = registrations;
    setRegistrations([...registrations.filter((item) => item.id !== registration.id), registration]);
    trackWrite(
      firebaseService.setEventRSVP(eventId, status).then((savedRegistration) => {
        if (savedRegistration) {
          setRegistrations((items) => [
            ...items.filter((item) => item.id !== savedRegistration.id),
            savedRegistration,
          ]);
        }
      }),
      () => setRegistrations(previous)
    );
    return registration;
  };

  const getEventRSVP = (eventId: string): RSVPStatus =>
    registrations.find((item) => item.eventId === eventId && item.studentId === (firebaseUser?.uid ?? student.id))?.status ?? 'none';

  const getEventRegistration = (eventId: string) =>
    registrations.find((item) => item.eventId === eventId && item.studentId === (firebaseUser?.uid ?? student.id));

  const checkInToken = async (token: string) => {
    if (isDemoMode) {
      const result = attendanceService.simulateCheckIn(token);
      if (result.success) setRegistrations(attendanceService.getRegistrations());
      return result;
    }
    if (!firebaseUser || activeRole === 'student') {
      return { success: false, message: 'Hanya administrator aktif yang dapat mencatat kehadiran.' };
    }
    try {
      const result = await firebaseService.checkInAttendance(token);
      if (result.registration) {
        setRegistrations((items) => items.map((item) =>
          item.id === result.registration?.id ? result.registration : item
        ));
      }
      return result;
    } catch (error) {
      reportDataError(error);
      return { success: false, message: getErrorMessage(error) };
    }
  };

  const toggleBookmark = (eventId: string) => {
    const nextEnabled = !bookmarks.includes(eventId);
    const previous = bookmarks;
    const next = nextEnabled ? [...bookmarks, eventId] : bookmarks.filter((item) => item !== eventId);
    setBookmarks(next);
    if (isDemoMode) localStorage.setItem('klabatsync_bookmarks', JSON.stringify(next));
    else if (firebaseUser && activeRole === 'student') {
      trackWrite(firebaseService.setBookmark(firebaseUser.uid, eventId, nextEnabled), () => setBookmarks(previous));
    }
  };

  const isBookmarked = (eventId: string) => bookmarks.includes(eventId);

  const createPersonalAgendaEvent = (data: Omit<CampusEvent, 'id' | 'createdAt'>): CampusEvent => {
    const event: CampusEvent = {
      ...data,
      id: createId('agenda'),
      createdAt: new Date().toISOString().slice(0, 10),
      isDemo: isDemoMode,
    };
    setAgendaEvents((items) => [event, ...items]);
    if (isDemoMode) {
      const updated = [event, ...events];
      setEvents(updated);
      eventService.saveEvents(updated);
    } else if (firebaseUser && activeRole === 'student') {
      trackWrite(firebaseService.saveAgendaEvent(firebaseUser.uid, event), () =>
        setAgendaEvents((items) => items.filter((item) => item.id !== event.id))
      );
    }
    return event;
  };

  const deletePersonalAgendaEvent = (eventId: string) => {
    const previous = agendaEvents;
    setAgendaEvents(agendaEvents.filter((item) => item.id !== eventId));
    if (isDemoMode) {
      const updated = events.filter((item) => item.id !== eventId);
      setEvents(updated);
      eventService.saveEvents(updated);
    } else if (firebaseUser) {
      trackWrite(firebaseService.deleteAgendaEvent(firebaseUser.uid, eventId), () => setAgendaEvents(previous));
    }
  };

  const createOrganization = (data: Omit<CampusOrganization, 'id' | 'createdAt' | 'updatedAt'>) => {
    const organization: CampusOrganization = {
      ...data,
      id: createId('org'),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    const previous = organizations;
    const updated = [...organizations, organization];
    setOrganizations(updated);
    if (isDemoMode) localStorage.setItem('klabatsync_orgs', JSON.stringify(updated));
    else if (firebaseUser) trackWrite(firebaseService.saveOrganization(organization), () => setOrganizations(previous));
    return organization;
  };

  const updateOrganization = (updatedOrganization: CampusOrganization) => {
    const previous = organizations;
    const updated = organizations.map((item) => item.id === updatedOrganization.id ? updatedOrganization : item);
    setOrganizations(updated);
    if (isDemoMode) localStorage.setItem('klabatsync_orgs', JSON.stringify(updated));
    else if (firebaseUser) trackWrite(firebaseService.saveOrganization(updatedOrganization), () => setOrganizations(previous));
  };

  const archiveOrganization = (id: string) => {
    const organization = organizations.find((item) => item.id === id);
    if (!organization) return;
    updateOrganization({ ...organization, status: 'archived' });
  };

  const inviteAdminUser = async (data: Omit<AdminUser, 'id' | 'createdAt'>): Promise<AdminUser> => {
    if (isDemoMode) {
      const admin: AdminUser = { ...data, id: createId('demo-admin'), createdAt: new Date().toISOString().slice(0, 10) };
      const updated = [...adminUsers, admin];
      setAdminUsers(updated);
      localStorage.setItem('klabatsync_admins', JSON.stringify(updated));
      return admin;
    }
    if (!firebaseUser || activeRole !== 'super_admin') {
      throw new Error('Hanya Super Admin terautentikasi yang dapat menetapkan peran administrator.');
    }
    const result = await firebaseService.provisionAdmin({
      targetEmail: data.email,
      role: data.role,
      organizationId: data.organizationId,
      displayName: data.name,
      permissionScope: data.permissionScope,
      status: 'active',
    });
    return {
      ...data,
      id: result.uid,
      email: result.email,
      role: result.role,
      status: result.status,
      organizationId: result.organizationId,
      createdAt: new Date().toISOString(),
    };
  };

  const updateAdminStatus = async (id: string, status: AdminUser['status']) => {
    if (isDemoMode) {
      const updated = adminUsers.map((admin) => admin.id === id ? { ...admin, status } : admin);
      setAdminUsers(updated);
      localStorage.setItem('klabatsync_admins', JSON.stringify(updated));
      return;
    }
    if (!firebaseUser || activeRole !== 'super_admin') {
      throw new Error('Hanya Super Admin terautentikasi yang dapat mengubah akses administrator.');
    }
    const target = adminUsers.find((admin) => admin.id === id);
    if (!target) throw new Error('Profil administrator tidak ditemukan.');
    if (status === 'revoked') {
      await firebaseService.revokeAdmin(id);
    } else {
      await firebaseService.updateProvisionedAdmin({
        targetUid: id,
        role: target.role,
        organizationId: target.organizationId,
        status: status === 'suspended' ? 'suspended' : 'active',
      });
    }
  };

  const createAnnouncement = (data: Omit<CampusAnnouncement, 'id'>) => {
    const announcement: CampusAnnouncement = {
      ...data,
      organizationId: data.organizationId ?? currentAdminUser?.organizationId,
      id: createId('announcement'),
      isDemo: isDemoMode,
    };
    const previous = announcements;
    const updated = [announcement, ...announcements];
    setAnnouncements(updated);
    if (isDemoMode) localStorage.setItem('klabatsync_announcements', JSON.stringify(updated));
    else if (firebaseUser) trackWrite(firebaseService.saveAnnouncement(announcement), () => setAnnouncements(previous));
    return announcement;
  };

  const toggleAnnouncementRead = (id: string) => {
    const current = announcements.find((item) => item.id === id);
    if (!current) return;
    const isRead = !current.isRead;
    const previous = announcements;
    setAnnouncements(announcements.map((item) => item.id === id ? { ...item, isRead } : item));
    if (isDemoMode) localStorage.setItem('klabatsync_announcements', JSON.stringify(
      announcements.map((item) => item.id === id ? { ...item, isRead } : item)
    ));
    else if (firebaseUser && activeRole === 'student') {
      trackWrite(firebaseService.setAnnouncementRead(firebaseUser.uid, id, isRead), () => setAnnouncements(previous));
    }
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((item) => ({ ...item, isRead: true }));
    setNotifications(updated);
    if (isDemoMode) localStorage.setItem('klabatsync_notifications', JSON.stringify(updated));
  };

  const resetAllDemoData = () => {
    if (!isDemoMode) {
      reportDataError(new Error('Reset data hanya tersedia di Mode Demo; data produksi tidak dihapus dari aplikasi.'));
      return;
    }
    eventService.resetToDefault();
    attendanceService.resetToDefault();
    localStorage.removeItem('klabatsync_student');
    localStorage.removeItem('klabatsync_admins');
    localStorage.removeItem('klabatsync_orgs');
    localStorage.removeItem('klabatsync_announcements');
    localStorage.removeItem('klabatsync_bookmarks');
    localStorage.removeItem('klabatsync_notifications');
    localStorage.removeItem('klabatsync_demo_session');
    setEvents(initialEvents);
    setStudent(initialStudentProfile);
    setAdminUsers(initialAdminUsers);
    setOrganizations(initialOrganizations);
    setAnnouncements(initialAnnouncements);
    setRegistrations(attendanceService.getRegistrations());
    setBookmarks(['evt-001', 'evt-002']);
    setNotifications(initialNotifications);
    setAgendaEvents([]);
    setActiveRoleState('student');
    setCurrentAdminUser(null);
    setDemoAuthUser(null);
    setDataStatus('idle');
  };

  const contextValue = {
    events,
    agendaEvents,
    student,
    adminUsers,
    organizations,
    announcements,
    registrations,
    bookmarks,
    notifications,
    isAuthenticated,
    demoAuthUser,
    firebaseUser,
    isFirebaseLoading,
    isBootstrapCandidate,
    isDemoMode,
    dataStatus,
    dataError,
    loginDemoStudent,
    loginDemoAdmin,
    loginWithGoogle,
    loginWithEmail,
    loginAdminWithEmail,
    bootstrapFirstSuperAdmin,
    registerWithEmail,
    logout,
    activeRole,
    currentAdminUser,
    presentationMode,
    theme,
    isGlobalAIChatOpen,
    globalAIChatContextEventId,
    setActiveRole,
    setCurrentAdminUser,
    setTheme,
    toggleTheme,
    setPresentationMode,
    setIsGlobalAIChatOpen,
    setGlobalAIChatContextEventId,
    createEvent,
    updateEvent,
    deleteEvent,
    publishEvent,
    cancelEvent,
    setRSVP,
    getEventRSVP,
    getEventRegistration,
    checkInToken,
    toggleBookmark,
    isBookmarked,
    createPersonalAgendaEvent,
    deletePersonalAgendaEvent,
    createOrganization,
    updateOrganization,
    archiveOrganization,
    inviteAdminUser,
    updateAdminStatus,
    createAnnouncement,
    toggleAnnouncementRead,
    markAllNotificationsRead,
    resetAllDemoData,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};
