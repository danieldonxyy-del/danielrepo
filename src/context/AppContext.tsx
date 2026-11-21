import React, { createContext, useContext } from 'react';
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

export interface AppContextType {
  // Data
  events: CampusEvent[];
  agendaEvents: CampusEvent[];
  student: StudentProfile;
  adminUsers: AdminUser[];
  organizations: CampusOrganization[];
  announcements: CampusAnnouncement[];
  registrations: EventRegistration[];
  bookmarks: string[];
  notifications: NotificationItem[];

  // Authentication State (Demo & Firebase)
  isAuthenticated: boolean;
  demoAuthUser: DemoAuthSession | null;
  firebaseUser: User | null;
  isFirebaseLoading: boolean;
  isBootstrapCandidate: boolean;
  isDemoMode: boolean;
  dataStatus: 'idle' | 'loading' | 'ready' | 'error';
  dataError: string | null;

  loginDemoStudent: (email: string, name?: string) => DemoAuthSession;
  loginDemoAdmin: (admin: AdminUser) => DemoAuthSession;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  loginAdminWithEmail: (email: string, pass: string) => Promise<AdminUser>;
  bootstrapFirstSuperAdmin: (email: string, pass: string, bootstrapKey: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;

  // Roles & Presentation Mode
  activeRole: AdminRole;
  currentAdminUser: AdminUser | null;
  presentationMode: boolean;
  theme: 'light' | 'dark';

  // Floating AI Chat state
  isGlobalAIChatOpen: boolean;
  globalAIChatContextEventId: string | null;

  // Actions
  setActiveRole: (role: AdminRole) => void;
  setCurrentAdminUser: (admin: AdminUser | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setPresentationMode: (active: boolean) => void;
  setIsGlobalAIChatOpen: (open: boolean) => void;
  setGlobalAIChatContextEventId: (eventId: string | null) => void;

  // Event Actions
  createEvent: (event: Omit<CampusEvent, 'id' | 'createdAt'>) => CampusEvent;
  updateEvent: (event: CampusEvent) => void;
  deleteEvent: (id: string) => void;
  publishEvent: (id: string) => void;
  cancelEvent: (id: string) => void;

  // Registration & Attendance
  setRSVP: (eventId: string, status: RSVPStatus) => EventRegistration;
  getEventRSVP: (eventId: string) => RSVPStatus;
  getEventRegistration: (eventId: string) => EventRegistration | undefined;
  checkInToken: (token: string) => Promise<{ success: boolean; message: string; registration?: EventRegistration }>;

  // Bookmarks
  toggleBookmark: (eventId: string) => void;
  isBookmarked: (eventId: string) => boolean;
  createPersonalAgendaEvent: (event: Omit<CampusEvent, 'id' | 'createdAt'>) => CampusEvent;
  deletePersonalAgendaEvent: (eventId: string) => void;

  // Organization Management (Part 30.9)
  createOrganization: (org: Omit<CampusOrganization, 'id' | 'createdAt' | 'updatedAt'>) => CampusOrganization;
  updateOrganization: (org: CampusOrganization) => void;
  archiveOrganization: (id: string) => void;

  // Admin Management (Part 30.8)
  inviteAdminUser: (admin: Omit<AdminUser, 'id' | 'createdAt'>) => Promise<AdminUser>;
  updateAdminStatus: (id: string, status: AdminUser['status']) => Promise<void>;

  // Announcements
  createAnnouncement: (announcement: Omit<CampusAnnouncement, 'id'>) => CampusAnnouncement;
  toggleAnnouncementRead: (id: string) => void;

  // Notifications
  markAllNotificationsRead: () => void;

  // Reset
  resetAllDemoData: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
