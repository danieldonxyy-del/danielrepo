import React, { useState } from 'react';
import { Bell, CheckCheck, ExternalLink, Calendar, Info, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/badge';

export const NotificationDropdown: React.FC = () => {
  const { notifications, markAllNotificationsRead } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleItemClick = (link?: string) => {
    setIsOpen(false);
    if (link) navigate(link);
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'reminder':
        return <Calendar className="h-4 w-4 text-amber-500" />;
      case 'conflict':
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
      case 'announcement':
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifikasi kampus"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-84 z-50 rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Notifikasi kampus
                </span>
                {unreadCount > 0 && (
                  <Badge variant="danger" className="text-[10px] px-1.5 py-0">
                    {unreadCount} baru
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="py-2 max-h-80 overflow-y-auto space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Belum ada notifikasi</p>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.link)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors text-xs flex items-start gap-3 ${
                      item.isRead
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400 opacity-80'
                        : 'bg-blue-50/60 dark:bg-blue-950/30 text-slate-900 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">{getIcon(item.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold">{item.title}</span>
                        <span className="text-xs text-slate-500 shrink-0">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/announcements');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1"
              >
                Lihat semua pengumuman <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
