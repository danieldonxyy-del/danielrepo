import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  CalendarDays,
  Bookmark,
  Bell,
  Sparkles,
  Clock,
  Building2,
  Users,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeRole, bookmarks, announcements, logout } = useApp();
  const navigate = useNavigate();
  const isStudent = activeRole === 'student';
  const unreadAnnouncements = announcements.filter((a) => !a.isRead).length;

  // Navigation Items for Student Role
  const studentNavItems = [
    {
      to: '/overview',
      label: 'Ringkasan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/events',
      label: 'Eksplorasi Kegiatan',
      icon: Compass,
      badge: null,
    },
    {
      to: '/agenda',
      label: 'Agenda & Tiket Saya',
      icon: CalendarCheck,
      badge: null,
    },
    {
      to: '/calendar',
      label: 'Kalender Kampus',
      icon: CalendarDays,
      badge: null,
    },
    {
      to: '/saved',
      label: 'Kegiatan Tersimpan',
      icon: Bookmark,
      badge: bookmarks.length > 0 ? bookmarks.length : null,
    },
    {
      to: '/announcements',
      label: 'Pusat Pengumuman',
      icon: Bell,
      badge: unreadAnnouncements > 0 ? unreadAnnouncements : null,
    },
    {
      to: '/ai-assistant',
      label: 'Asisten AI Kampus',
      icon: Sparkles,
      badge: null,
    },
  ];

  // Navigation Items for Administrator Roles
  const adminRoleMap: Record<string, string> = {
    super_admin: 'Administrasi platform',
    campus_admin: 'Administrasi kampus',
    ormawa_admin: 'Administrasi ORMAWA',
    organization_admin: 'Administrasi organisasi',
    dormitory_admin: 'Administrasi asrama',
    spiritual_admin: 'Pelayanan rohani',
  };

  const adminSectionTitle = adminRoleMap[activeRole] || 'Administrasi';

  const adminNavItems = [
    {
      to: '/admin-studio',
      label: 'Dasbor Admin',
      icon: LayoutDashboard,
      badge: null,
      show: true,
    },
    {
      to: '/admin-management',
      label: 'Tim Admin (RBAC)',
      icon: Users,
      badge: null,
      show: activeRole === 'super_admin',
    },
    {
      to: '/organization-management',
      label: 'Manajemen Organisasi',
      icon: Building2,
      badge: null,
      show: activeRole === 'super_admin',
    },
  ].filter((item) => item.show);

  const adminRepoItems = [
    {
      to: '/events',
      label: 'Registri Kegiatan Kampus',
      icon: Compass,
      badge: null,
    },
    {
      to: '/announcements',
      label: 'Pusat Pengumuman',
      icon: Bell,
      badge: unreadAnnouncements > 0 ? unreadAnnouncements : null,
    },
    {
      to: '/ai-assistant',
      label: 'Asisten AI Kampus',
      icon: Sparkles,
      badge: null,
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111C2E] p-3.5 shrink-0 transition-colors">
      <div className="space-y-6">
        {/* CASE 1: Student Navigation (shown ONLY when activeRole is student) */}
        {isStudent ? (
          <div>
            <div className="px-3 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Portal Mahasiswa
            </div>
            <nav className="space-y-0.5">
              {studentNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/overview'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                        isActive
                          ? 'bg-[#142D4E] text-white shadow-2xs dark:bg-blue-600 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`h-4 w-4 transition-colors ${
                              isActive
                                ? 'text-white'
                                : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ) : (
          /* CASE 2: Administrator Navigation (shown when activeRole is administrator) */
          <div className="space-y-5">
            <div>
              <div className="px-3 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>{adminSectionTitle}</span>
              </div>
              <nav className="space-y-0.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                          isActive
                            ? 'bg-[#142D4E] text-white shadow-2xs dark:bg-blue-600 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`h-4 w-4 transition-colors ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* University Repository & Public View for Admins */}
            <div>
              <div className="px-3 pb-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Repositori Kampus
              </div>
              <nav className="space-y-0.5">
                {adminRepoItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                          isActive
                            ? 'bg-[#142D4E] text-white shadow-2xs dark:bg-blue-600 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`h-4 w-4 transition-colors ${
                                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Standalone Logout Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={async () => {
              await logout();
              navigate('/auth');
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Keluar</span>
            </div>
          </button>
        </div>
      </div>

      {/* Footer info: Campus Timezone Asia/Makassar (WITA) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium text-xs">
            <Clock className="h-3.5 w-3.5 text-[#D6A84B]" />
            <span>Zona waktu:</span>
          </span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
            WITA (UTC+8)
          </span>
        </div>
        <p className="px-2 text-xs text-slate-500 dark:text-slate-400 leading-tight">
          Universitas Klabat, Airmadidi, Sulawesi Utara.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
