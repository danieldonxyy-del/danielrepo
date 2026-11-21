import React, { useState } from 'react';
import {
  Calendar,
  PlusCircle,
  Eye,
  Trash2,
  Search,
} from 'lucide-react';
import { CampusEvent, AdminRole } from '../../types';
import { EventBadge } from '../events/EventBadge';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useApp } from '../../context/AppContext';
import { canManageEvent } from '../../utils/permissions';
import { toast } from 'sonner';

interface EventManagementTableProps {
  events: CampusEvent[];
  onPreviewEvent: (event: CampusEvent) => void;
  onCreateEventClick?: () => void;
  role: AdminRole;
  organizationId?: string;
  title?: string;
}

export const EventManagementTable: React.FC<EventManagementTableProps> = ({
  events,
  onPreviewEvent,
  onCreateEventClick,
  role,
  organizationId,
  title = 'Events Catalog',
}) => {
  const { publishEvent, cancelEvent, deleteEvent } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'cancelled'>('all');

  const filteredEvents = events.filter((evt) => {
    if (statusFilter !== 'all' && evt.status !== statusFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.organizer.toLowerCase().includes(q) ||
        evt.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            {title} ({events.length})
          </h3>
          <p className="text-xs text-slate-400">
            Daftar kegiatan sesuai cakupan peran administrator Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCreateEventClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateEventClick}
              className="text-xs font-bold"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" /> Buat kegiatan
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
          <Input
            type="text"
            placeholder="Cari judul kegiatan, penyelenggara, atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs py-2 h-9 rounded-xl"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
          {(['all', 'published', 'draft', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {{ all: 'Semua', published: 'Terbit', draft: 'Draf', cancelled: 'Dibatalkan' }[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Calendar className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-500">Tidak ada kegiatan pada cakupan ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500">
                <tr>
                  <th className="p-4">Judul &amp; kategori</th>
                  <th className="p-4">Tanggal &amp; waktu</th>
                  <th className="p-4">Lokasi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEvents.map((evt) => {
                  const isPermitted = canManageEvent(evt, role, organizationId);

                  return (
                    <tr
                      key={evt.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {evt.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <EventBadge category={evt.category} />
                          <span className="text-slate-400 text-[11px]">{evt.organizer}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {evt.startDate} · {evt.startTime}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{evt.location}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            evt.status === 'published'
                              ? 'success'
                              : evt.status === 'cancelled'
                              ? 'danger'
                              : 'secondary'
                          }
                          className="capitalize text-[10px]"
                        >
                          {{
                            draft: 'Draf',
                            pending: 'Menunggu persetujuan',
                            published: 'Terbit',
                            rejected: 'Ditolak',
                            cancelled: 'Dibatalkan',
                            completed: 'Selesai',
                          }[evt.status]}
                        </Badge>
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreviewEvent(evt)}
                          className="text-xs"
                          title="Lihat detail"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {isPermitted ? (
                          <>
                            {evt.status !== 'published' ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  publishEvent(evt.id);
                                  toast.success(`"${evt.title}" diterbitkan.`);
                                }}
                                className="text-xs"
                              >
                                Terbitkan
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  cancelEvent(evt.id);
                                  toast.warning('Kegiatan ditandai sebagai dibatalkan.');
                                }}
                                className="text-xs text-rose-600"
                              >
                                Batalkan
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (window.confirm(`Hapus kegiatan "${evt.title}"?`)) {
                                  deleteEvent(evt.id);
                                  toast.info('Kegiatan dihapus.');
                                }
                              }}
                              className="text-xs text-rose-500"
                              title="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Hanya lihat</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagementTable;
