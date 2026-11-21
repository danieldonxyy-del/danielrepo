import { AdminRole, CampusEvent, EventRegistration, CampusAnnouncement } from '../types';

// ─── Part 30.10 Section I — Granular Permission Actions ─────────────────────
export type PermissionAction =
  | 'view_dashboard'
  | 'view_events'
  | 'create_events'
  | 'edit_events'
  | 'delete_events'
  | 'publish_events'
  | 'approve_events'
  | 'view_announcements'
  | 'create_announcements'
  | 'edit_announcements'
  | 'delete_announcements'
  | 'manage_registrations'
  | 'view_reports'
  | 'edit_organization_profile'
  | 'manage_organization_members'
  | 'manage_administrators'
  | 'manage_organizations'
  | 'manage_permissions'
  | 'view_audit_logs'
  | 'manage_system_settings'
  | 'scan_attendance'
  | 'reset_demo_data';

// ─── Role-Permission Matrix ─────────────────────────────────────────────────
const ROLE_PERMISSIONS: Record<AdminRole, PermissionAction[]> = {
  super_admin: [
    'view_dashboard',
    'view_events', 'create_events', 'edit_events', 'delete_events', 'publish_events', 'approve_events',
    'view_announcements', 'create_announcements', 'edit_announcements', 'delete_announcements',
    'manage_registrations', 'view_reports',
    'edit_organization_profile', 'manage_organization_members',
    'manage_administrators', 'manage_organizations', 'manage_permissions',
    'view_audit_logs', 'manage_system_settings',
    'scan_attendance', 'reset_demo_data',
  ],
  campus_admin: [
    'view_dashboard',
    'view_events', 'create_events', 'edit_events', 'publish_events', 'approve_events',
    'view_announcements', 'create_announcements', 'edit_announcements',
    'manage_registrations', 'view_reports',
    'scan_attendance',
  ],
  ormawa_admin: [
    'view_dashboard',
    'view_events', 'create_events', 'edit_events', 'publish_events',
    'view_announcements', 'create_announcements',
    'manage_registrations', 'view_reports',
    'edit_organization_profile',
    'scan_attendance',
  ],
  organization_admin: [
    'view_dashboard',
    'view_events', 'create_events', 'edit_events', 'publish_events',
    'view_announcements', 'create_announcements',
    'manage_registrations', 'view_reports',
    'edit_organization_profile',
    'scan_attendance',
  ],
  dormitory_admin: [
    'view_dashboard',
    'view_events', 'create_events', 'edit_events', 'publish_events',
    'view_announcements', 'create_announcements',
    'manage_registrations', 'view_reports',
    'scan_attendance',
  ],
  spiritual_admin: [
    'view_dashboard',
    'view_events', 'create_events', 'edit_events', 'publish_events',
    'view_announcements', 'create_announcements',
    'manage_registrations', 'view_reports',
    'scan_attendance',
  ],
  student: ['view_dashboard', 'view_events', 'view_announcements'],
};

/**
 * Check if a role has permission for a specific action.
 * NOTE: Client-side permission check — simulated for demo purposes.
 * Production systems must enforce permissions server-side.
 */
export function hasPermission(role: AdminRole, action: PermissionAction): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(action);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: AdminRole): PermissionAction[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Filter events based on administrator role and optional organizationId
 */
export function getScopedEvents(
  events: CampusEvent[],
  role: AdminRole,
  organizationId?: string
): CampusEvent[] {
  if (role === 'super_admin') {
    return events;
  }

  if (role === 'campus_admin') {
    return events.filter(
      (e) =>
        e.category === 'academic' ||
        e.category === 'seminar' ||
        e.category === 'competition' ||
        !e.organizationId
    );
  }

  if (role === 'ormawa_admin' || role === 'organization_admin') {
    if (organizationId) {
      return events.filter((e) => e.organizationId === organizationId);
    }
    return events.filter((e) => e.category === 'ormawa');
  }

  if (role === 'dormitory_admin') {
    return events.filter((e) => e.category === 'dormitory' || e.dormitoryOnly);
  }

  if (role === 'spiritual_admin') {
    return events.filter((e) => e.category === 'spiritual' || (e.chapelPoints && e.chapelPoints > 0));
  }

  return [];
}

/**
 * Filter event registrations based on scoped events
 */
export function getScopedRegistrations(
  registrations: EventRegistration[],
  scopedEvents: CampusEvent[]
): EventRegistration[] {
  const allowedEventIds = new Set(scopedEvents.map((e) => e.id));
  return registrations.filter((r) => allowedEventIds.has(r.eventId));
}

/**
 * Filter announcements based on administrator role and optional organizationId
 */
export function getScopedAnnouncements(
  announcements: CampusAnnouncement[],
  role: AdminRole,
  organizationId?: string
): CampusAnnouncement[] {
  if (role === 'super_admin') {
    return announcements;
  }

  if (role === 'campus_admin') {
    return announcements.filter(
      (a) => a.category === 'university' || a.category === 'academic'
    );
  }

  if (role === 'ormawa_admin' || role === 'organization_admin') {
    if (organizationId) {
      return announcements.filter((a) => a.organizationId === organizationId || a.category === 'ormawa');
    }
    return announcements.filter((a) => a.category === 'ormawa');
  }

  if (role === 'dormitory_admin') {
    return announcements.filter((a) => a.category === 'dormitory');
  }

  if (role === 'spiritual_admin') {
    return announcements.filter((a) => a.category === 'spiritual');
  }

  return [];
}

/**
 * Check if the active role is permitted to modify or publish a given event
 */
export function canManageEvent(
  event: CampusEvent,
  role: AdminRole,
  organizationId?: string
): boolean {
  if (role === 'super_admin') return true;

  if (role === 'campus_admin') {
    return (
      event.category === 'academic' ||
      event.category === 'seminar' ||
      event.category === 'competition'
    );
  }

  if (role === 'ormawa_admin' || role === 'organization_admin') {
    if (organizationId) {
      return event.organizationId === organizationId;
    }
    return event.category === 'ormawa';
  }

  if (role === 'dormitory_admin') {
    return event.category === 'dormitory' || Boolean(event.dormitoryOnly);
  }

  if (role === 'spiritual_admin') {
    return event.category === 'spiritual';
  }

  return false;
}

/**
 * Human-readable label for each admin role (used in dashboards)
 */
export function getRoleLabel(role: AdminRole): string {
  const labels: Record<AdminRole, string> = {
    super_admin: 'Super Admin',
    campus_admin: 'Admin Kampus',
    ormawa_admin: 'Admin ORMAWA',
    organization_admin: 'Admin Organisasi',
    dormitory_admin: 'Admin Asrama',
    spiritual_admin: 'Admin Kerohanian',
    student: 'Mahasiswa',
  };
  return labels[role] || role;
}
