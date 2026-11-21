import React, { useState } from 'react';
import {
  Bell,
  Search,
  Pin,
  Building,
  BookOpen,
  Church,
  Home,
  Trophy,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CampusAnnouncement } from '../types';

export const Announcements: React.FC = () => {
  const { announcements, toggleAnnouncementRead } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<CampusAnnouncement | null>(null);

  const categories = [
    { key: 'all', label: 'Semua Edaran', icon: Bell },
    { key: 'university', label: 'Universitas', icon: Building },
    { key: 'academic', label: 'Akademik (BAA)', icon: BookOpen },
    { key: 'spiritual', label: 'Pelayanan Rohani', icon: Church },
    { key: 'dormitory', label: 'Asrama', icon: Home },
    { key: 'ormawa', label: 'ORMAWA & BEM', icon: Trophy },
  ];

  const filtered = announcements.filter((a) => {
    if (activeCategory !== 'all' && a.category !== activeCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.organizer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pinnedAnnouncements = filtered.filter((a) => a.isPinned);
  const regularAnnouncements = filtered.filter((a) => !a.isPinned);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="gold" className="text-[10px]">
              BULETIN RESMI UNKLAB
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Rektorat &amp; Kemahasiswaan</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Pusat Pengumuman &amp; Surat Edaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Surat edaran resmi rektorat, tata tertib ujian, panduan asrama, dan direktif peribadatan.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari edaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#142D4E] dark:focus:ring-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = activeCategory === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#142D4E] text-white shadow-2xs dark:bg-blue-600'
                  : 'bg-white dark:bg-[#111C2E] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
            <Pin className="h-3.5 w-3.5 text-[#D6A84B]" /> Edaran Prioritas &amp; Tersemat
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pinnedAnnouncements.map((anc) => (
              <div
                key={anc.id}
                onClick={() => setSelectedAnnouncement(anc)}
                className={`p-4 rounded-xl border transition-colors cursor-pointer space-y-2.5 ${
                  anc.isRead
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60'
                    : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="amber" className="text-[10px] uppercase">
                      {anc.category}
                    </Badge>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                      <Pin className="h-3 w-3" /> Tersemat
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium font-mono">{anc.date}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {anc.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {anc.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{anc.organizer}</span>
                  <span className="text-[#142D4E] dark:text-blue-400 font-semibold">Baca lengkap →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Semua Surat Edaran ({regularAnnouncements.length})
        </span>

        <div className="space-y-2.5">
          {regularAnnouncements.map((anc) => (
            <div
              key={anc.id}
              onClick={() => setSelectedAnnouncement(anc)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111C2E] shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] capitalize">
                    {anc.category}
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-mono">{anc.date}</span>
                  {!anc.isRead && (
                    <Badge variant="gold" className="text-[9px]">
                      Baru
                    </Badge>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-[#142D4E] dark:hover:text-blue-400 transition-colors truncate">
                  {anc.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{anc.content}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span className="text-xs text-slate-500">{anc.organizer}</span>
                <Button size="sm" variant="secondary" className="text-xs">
                  Buka
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Announcement Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedAnnouncement(null)}
          />
          <div className="relative z-50 w-full max-w-lg rounded-2xl bg-white dark:bg-[#111C2E] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-[10px] capitalize">
                Edaran {selectedAnnouncement.category}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">{selectedAnnouncement.date}</span>
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {selectedAnnouncement.title}
            </h2>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <Building className="h-4 w-4 text-[#142D4E] dark:text-blue-400 shrink-0" />
              <span>Diterbitkan oleh: <strong className="text-slate-800 dark:text-slate-200">{selectedAnnouncement.organizer}</strong></span>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line border-t border-b border-slate-100 dark:border-slate-800 py-3">
              {selectedAnnouncement.content}
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  toggleAnnouncementRead(selectedAnnouncement.id);
                  setSelectedAnnouncement({
                    ...selectedAnnouncement,
                    isRead: !selectedAnnouncement.isRead,
                  });
                }}
                className="text-xs font-semibold text-[#142D4E] dark:text-blue-400 hover:underline cursor-pointer"
              >
                Tandai sebagai {selectedAnnouncement.isRead ? 'Belum Dibaca' : 'Sudah Dibaca'}
              </button>
              <Button size="sm" variant="secondary" onClick={() => setSelectedAnnouncement(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
