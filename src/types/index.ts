// ==========================================
// KLABATSYNC CENTRALIZED TYPESCRIPT CONTRACT
// Universitas Klabat (UNKLAB) - Asia/Makassar
// ==========================================

export type EventCategory =
  | "spiritual"
  | "academic"
  | "ormawa"
  | "dormitory"
  | "seminar"
  | "competition";

export type RSVPStatus =
  | "none"
  | "interested"
  | "going";

export type EventStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "cancelled"
  | "completed";

export type AttendanceStatus =
  | "not_checked_in"
  | "checked_in"
  | "cancelled";

export type EligibilityStatus =
  | "eligible"
  | "not_eligible"
  | "requires_verification"
  | "open_to_all";

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizer: string;
  organizationId?: string;

  posterUrl?: string;
  posterGradient?: string;
  posterIcon?: string;

  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD

  startTime: string; // HH:mm (24-hour)
  endTime?: string;  // HH:mm (optional/missing in some cases)

  location: string;
  dressCode?: string;
  chapelPoints?: number;

  capacity?: number;
  registeredCount?: number;

  registrationDeadline?: string; // YYYY-MM-DD or YYYY-MM-DD HH:mm

  requirements?: string[];

  eligibleFaculties?: string[];
  eligibleBatches?: number[];

  dormitoryOnly?: boolean;

  rundown?: {
    time: string;
    activity: string;
  }[];

  contact?: {
    name: string;
    email?: string;
    phone?: string;
  };

  status: EventStatus;

  isVerified: boolean;
  isDemo: boolean;

  createdAt: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  nim: string;
  email: string;

  faculty: string;
  studyProgram?: string;

  batch: number;

  residenceStatus: "dormitory" | "off_campus";

  dormitoryBuilding?: string; // e.g. "Edelweiss", "Jasmine", "Crystal", "Guest House"

  studentStatus: "active" | "inactive";

  avatarUrl?: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  organizationId?: string;
  category?: EventCategory;

  status: RSVPStatus;

  registrationToken?: string; // e.g. "KLS-EVT-2026-8F3A91"

  attendanceStatus: AttendanceStatus;

  registeredAt: string;
  checkedInAt?: string;
}

export interface CampusAnnouncement {
  id: string;
  title: string;
  content: string;
  category: "university" | "academic" | "ormawa" | "dormitory" | "spiritual";
  organizer: string;
  organizationId?: string;
  date: string;
  isPinned: boolean;
  isRead: boolean;
  isVerified: boolean;
  isDemo: boolean;
  authorName?: string;
}

export type AdminRole =
  | "super_admin"
  | "campus_admin"
  | "ormawa_admin"
  | "dormitory_admin"
  | "spiritual_admin"
  | "organization_admin"
  | "student";

export type AdminStatus =
  | "active"
  | "pending_invitation"
  | "expired_invitation"
  | "suspended"
  | "revoked";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  organizationId?: string; // for organization_admin
  permissionScope: string;
  status: AdminStatus;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
}

export interface CampusOrganization {
  id: string;
  name: string;
  slug: string;
  categoryId: string; // e.g. "bem", "hmp", "ukm", "academic", "dormitory", "spiritual"
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  email?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  location?: string;
  socialLinks?: { platform: string; url: string }[];
  status: "active" | "inactive" | "archived";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  assignedAdminIds?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: "event" | "announcement" | "reminder" | "conflict" | "system";
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  type: "direct" | "potential" | "available" | "incomplete";
  message: string;
  conflictingEvents?: [CampusEvent, CampusEvent];
}

export interface AISourceAttribution {
  title: string;
  module: string;
  date?: string;
  link?: string;
}

export interface AIMessage {
  id: string;
  sender: "user" | "ai" | "system";
  content: string;
  timestamp: string;
  context?: {
    page?: string;
    eventId?: string;
  };
  isSimulated?: boolean;
  sourceAttributions?: AISourceAttribution[];
}

export interface DemoAuthSession {
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
  isDemo: boolean;
  loggedInAt: string;
}

export interface PosterExtractionResult {
  title: string;
  category: EventCategory;
  organizer: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  description: string;
  dressCode?: string;
  chapelPoints?: number;
  registrationDeadline?: string;
  capacity?: number;
  requirements?: string[];
  eligibleFaculties?: string[];
  eligibleBatches?: number[];
  dormitoryOnly?: boolean;
  contactInfo?: string;
  uncertainFields: string[];
  missingFields: string[];
  confidenceScore: number;
  isSimulated: boolean;
}
