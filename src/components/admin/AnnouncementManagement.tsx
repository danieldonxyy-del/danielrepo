import React, { useState } from 'react';
import { Bell, PlusCircle, Pin, CheckCircle2, Sparkles } from 'lucide-react';
import { CampusAnnouncement, AdminRole } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

interface AnnouncementManagementProps {
  announcements: CampusAnnouncement[];
  role: AdminRole;
  organizationId?: string;
  defaultCategory?: CampusAnnouncement['category'];
  organizerName?: string;
}

export const AnnouncementManagement: React.FC<AnnouncementManagementProps> = ({
  announcements,
  role,
  organizationId,
  defaultCategory,
  organizerName,
}) => {
  const { createAnnouncement, toggleAnnouncementRead } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category] = useState<CampusAnnouncement['category']>(() => {
    if (defaultCategory) return defaultCategory;
    if (role === 'dormitory_admin') return 'dormitory';
    if (role === 'spiritual_admin') return 'spiritual';
    if (role === 'ormawa_admin' || role === 'organization_admin') return 'ormawa';
    if (role === 'campus_admin') return 'academic';
    return 'university';
  });
  const [isPinned, setIsPinned] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createAnnouncement({
      title,
      content,
      category,
      organizer: organizerName || (role === 'super_admin' ? 'University Rectorate' : role.replace('_', ' ').toUpperCase()),
      organizationId,
      date: new Date().toISOString().substring(0, 10),
      isPinned,
      isRead: false,
      isVerified: true,
      isDemo: true,
      authorName: role.replace('_', ' ').toUpperCase(),
    });

    setTitle('');
    setContent('');
    setIsPinned(false);
    setIsCreating(false);
    toast.success('Campus bulletin broadcasted successfully!');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="h-4 w-4 text-purple-500" />
            Pengumuman kampus ({announcements.length})
          </h3>
          <p className="text-xs text-slate-400">
            Terbitkan pengumuman resmi sesuai cakupan administrasi Anda.
          </p>
        </div>

        <Button
          variant="purple"
          size="sm"
          onClick={() => setIsCreating(!isCreating)}
          className="text-xs font-bold"
        >
          <PlusCircle className="h-4 w-4 mr-1.5" />
          {isCreating ? 'Batal' : 'Buat pengumuman'}
        </Button>
      </div>

      {/* Creation Drawer / Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/60 shadow-md space-y-4 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-purple-500" /> Tulis pengumuman resmi
            </span>
            <Badge variant="purple" className="capitalize text-[10px]">
              {category}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Judul pengumuman
            </label>
            <Input
              type="text"
              required
              placeholder="Contoh: Pemberitahuan pertemuan wajib penghuni asrama..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Isi dan arahan
            </label>
            <textarea
              required
              rows={3}
              placeholder="Tuliskan petunjuk, lokasi, atau ketentuan secara jelas..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <Pin className="h-3.5 w-3.5 text-amber-500" /> Sematkan di bagian atas
            </label>

            <Button type="submit" variant="primary" size="sm" className="font-bold text-xs">
              Terbitkan pengumuman
            </Button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
        {announcements.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-500">Belum ada pengumuman aktif pada cakupan ini.</p>
          </div>
        ) : (
          announcements.map((anc) => (
            <div key={anc.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  {anc.isPinned && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      <Pin className="h-3 w-3" /> Disematkan
                    </span>
                  )}
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {anc.category}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">{anc.date}</span>
                </div>

                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {anc.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {anc.content}
                </p>

                <div className="text-[11px] text-slate-400 font-medium pt-1">
                  Diterbitkan oleh: <strong className="text-slate-600 dark:text-slate-300">{anc.organizer}</strong>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleAnnouncementRead(anc.id)}
                  title={anc.isRead ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}
                  className={`p-1.5 rounded-xl transition-colors ${
                    anc.isRead
                      ? 'text-slate-400 hover:text-slate-600'
                      : 'text-purple-600 bg-purple-50 dark:bg-purple-950/50'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementManagement;
