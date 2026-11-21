import { EventRegistration, RSVPStatus } from '../types';

const REGISTRATIONS_STORAGE_KEY = 'klabatsync_registrations';

// Pre-seeded registration for Michella (Going to Midweek Chapel & Hackathon)
const initialRegistrations: EventRegistration[] = [
  {
    id: 'reg-001',
    eventId: 'evt-001',
    studentId: 'usr-student-01',
    status: 'going',
    registrationToken: 'KLS-EVT-2026-8F3A91',
    attendanceStatus: 'not_checked_in',
    registeredAt: '2026-11-08 14:22',
  },
  {
    id: 'reg-002',
    eventId: 'evt-002',
    studentId: 'usr-student-01',
    status: 'going',
    registrationToken: 'KLS-EVT-2026-9C4B12',
    attendanceStatus: 'not_checked_in',
    registeredAt: '2026-11-09 10:15',
  },
  {
    id: 'reg-003',
    eventId: 'evt-004',
    studentId: 'usr-student-01',
    status: 'interested',
    attendanceStatus: 'not_checked_in',
    registeredAt: '2026-11-09 16:30',
  },
];

export const attendanceService = {
  getRegistrations(): EventRegistration[] {
    const raw = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(initialRegistrations));
      return initialRegistrations;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return initialRegistrations;
    }
  },

  saveRegistrations(registrations: EventRegistration[]): void {
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations));
  },

  getRegistration(eventId: string, studentId: string): EventRegistration | undefined {
    return this.getRegistrations().find((r) => r.eventId === eventId && r.studentId === studentId);
  },

  setRSVP(eventId: string, studentId: string, status: RSVPStatus): EventRegistration {
    const list = this.getRegistrations();
    const existingIndex = list.findIndex((r) => r.eventId === eventId && r.studentId === studentId);

    if (status === 'none') {
      if (existingIndex !== -1) {
        list.splice(existingIndex, 1);
        this.saveRegistrations(list);
      }
      return {
        id: '',
        eventId,
        studentId,
        status: 'none',
        attendanceStatus: 'not_checked_in',
        registeredAt: '',
      };
    }

    // Generate unique token if 'going'
    const token =
      status === 'going'
        ? `KLS-EVT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        : undefined;

    const registration: EventRegistration = {
      id: existingIndex !== -1 ? list[existingIndex].id : `reg-${Date.now()}`,
      eventId,
      studentId,
      status,
      registrationToken: token || (existingIndex !== -1 ? list[existingIndex].registrationToken : undefined),
      attendanceStatus: existingIndex !== -1 ? list[existingIndex].attendanceStatus : 'not_checked_in',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    if (existingIndex !== -1) {
      list[existingIndex] = registration;
    } else {
      list.push(registration);
    }

    this.saveRegistrations(list);
    return registration;
  },

  simulateCheckIn(token: string): {
    success: boolean;
    message: string;
    registration?: EventRegistration;
  } {
    const list = this.getRegistrations();
    const reg = list.find((r) => r.registrationToken === token);

    if (!reg) {
      return {
        success: false,
        message: 'Token tiket digital tidak valid. Pendaftaran tidak ditemukan.',
      };
    }

    if (reg.attendanceStatus === 'checked_in') {
      return {
        success: false,
        message: `Peserta sudah check-in pada ${reg.checkedInAt || 'hari ini'}. Pemindaian duplikat ditolak.`,
        registration: reg,
      };
    }

    reg.attendanceStatus = 'checked_in';
    reg.checkedInAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    this.saveRegistrations(list);

    return {
      success: true,
      message: 'Check-in mahasiswa berhasil. Kehadiran telah dicatat.',
      registration: reg,
    };
  },

  resetToDefault(): void {
    localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(initialRegistrations));
  },
};
