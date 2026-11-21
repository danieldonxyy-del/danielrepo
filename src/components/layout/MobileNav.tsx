import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Compass, CalendarCheck, CalendarDays, Bell, Users, Building2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const { announcements, activeRole } = useApp();
  const unreadCount = announcements.filter((a) => !a.isRead).length;

  const items =
    activeRole === 'student'
      ? [
          { to: '/overview', label: 'Ringkasan', icon: LayoutDashboard },
          { to: '/events', label: 'Kegiatan', icon: Compass },
          { to: '/agenda', label: 'Agenda', icon: CalendarCheck },
          { to: '/calendar', label: 'Kalender', icon: CalendarDays },
          { to: '/announcements', label: 'Pengumuman', icon: Bell, badge: unreadCount },
          { to: '/ai-assistant', label: 'Asisten AI', icon: Sparkles },
        ]
      : [
          { to: '/admin-studio', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/events', label: 'Kegiatan', icon: Compass },
          { to: '/announcements', label: 'Pengumuman', icon: Bell, badge: unreadCount },
          ...(activeRole === 'super_admin'
            ? [
                { to: '/admin-management', label: 'Tim Admin', icon: Users },
                { to: '/organization-management', label: 'Organisasi', icon: Building2 },
              ]
            : [{ to: '/calendar', label: 'Kalender', icon: CalendarDays }]),
          { to: '/ai-assistant', label: 'Asisten AI', icon: Sparkles },
        ];

  return (
    <nav aria-label="Navigasi utama" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-[calc(4rem+env(safe-area-inset-bottom))] items-center justify-around border-t border-slate-200/80 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/95 transition-colors">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/overview' || item.to === '/admin-studio'}
            aria-label={item.badge && item.badge > 0 ? `${item.label}, ${item.badge} belum dibaca` : undefined}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center justify-center min-h-11 px-0.5 py-1 text-[10px] sm:text-[11px] font-medium transition-colors relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-rose-500" />
                  ) : null}
                </div>
                <span className="mt-1">{item.label}</span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
