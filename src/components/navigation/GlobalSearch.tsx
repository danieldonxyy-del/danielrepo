import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Bell, MapPin, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventBadge } from '../events/EventBadge';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const { events, announcements } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle or let parent handle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  const q = query.toLowerCase().trim();

  const matchingEvents = q
    ? events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
      )
    : events.slice(0, 4);

  const matchingAnnouncements = q
    ? announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.organizer.toLowerCase().includes(q)
      )
    : announcements.slice(0, 2);

  const handleSelectEvent = (id: string) => {
    onClose();
    navigate(`/events?id=${id}`);
  };

  const handleSelectAnnouncement = (id: string) => {
    onClose();
    navigate(`/announcements?id=${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-50 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Cari kegiatan, ibadah Chapel, lokasi, atau pengumuman..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-500 text-sm font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
          {/* Events Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {q ? 'Kegiatan yang cocok' : 'Kegiatan kampus pilihan'}
              </span>
              <span className="text-xs text-slate-500">{matchingEvents.length} kegiatan</span>
            </div>

            {matchingEvents.length === 0 ? (
              <p className="text-sm text-slate-500 px-2 py-1">Tidak ada kegiatan yang cocok dengan "{query}"</p>
            ) : (
              <div className="space-y-1.5">
                {matchingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => handleSelectEvent(evt.id)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                          {evt.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {evt.location}
                          </span>
                          <span>•</span>
                          <span>{evt.startDate}</span>
                        </div>
                      </div>
                    </div>
                    <EventBadge category={evt.category} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Pengumuman kampus
              </span>
              <span className="text-xs text-slate-500">{matchingAnnouncements.length} pengumuman</span>
            </div>

            {matchingAnnouncements.length === 0 ? (
              <p className="text-sm text-slate-500 px-2 py-1">Pengumuman tidak ditemukan</p>
            ) : (
              <div className="space-y-1.5">
                {matchingAnnouncements.map((anc) => (
                  <div
                    key={anc.id}
                    onClick={() => handleSelectAnnouncement(anc.id)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                          {anc.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {anc.organizer} · {anc.date}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {{
                        university: 'Universitas',
                        academic: 'Akademik',
                        spiritual: 'Kerohanian',
                        dormitory: 'Asrama',
                        ormawa: 'ORMAWA',
                      }[anc.category]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span>Gunakan tetikus atau papan ketik untuk memilih</span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs font-mono">
              ESC
            </kbd>{' '}
            untuk menutup
          </span>
        </div>
      </div>
    </div>
  );
};
