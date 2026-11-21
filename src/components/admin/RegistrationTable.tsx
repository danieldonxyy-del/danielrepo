import React, { useState } from 'react';
import { QrCode, Search } from 'lucide-react';
import { EventRegistration, CampusEvent } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface RegistrationTableProps {
  registrations: EventRegistration[];
  events: CampusEvent[];
  onLaunchScanner: () => void;
  title?: string;
  subtext?: string;
}

export const RegistrationTable: React.FC<RegistrationTableProps> = ({
  registrations,
  events,
  onLaunchScanner,
  title = 'Kehadiran dan pendaftaran',
  subtext = 'Token tiket untuk kegiatan dalam cakupan administrasi Anda.',
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');

  const eventMap = new Map(events.map((e) => [e.id, e]));

  const filtered = registrations.filter((r) => {
    if (filterStatus !== 'all' && r.attendanceStatus !== filterStatus) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const evt = eventMap.get(r.eventId);
      return (
        (r.registrationToken && r.registrationToken.toLowerCase().includes(q)) ||
        (evt && evt.title.toLowerCase().includes(q)) ||
        r.studentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <QrCode className="h-4 w-4 text-blue-500" />
            {title} ({registrations.length})
          </h3>
          <p className="text-xs text-slate-400">{subtext}</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onLaunchScanner}
          className="text-xs font-bold"
        >
          <QrCode className="h-4 w-4 mr-1.5" /> Buka pemindai QR
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
          <Input
            type="text"
            placeholder="Cari token tiket atau judul kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs py-2 h-9 rounded-xl"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
          {[
            { key: 'all', label: 'Semua tiket' },
            { key: 'checked_in', label: 'Sudah hadir' },
            { key: 'not_checked_in', label: 'Belum hadir' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilterStatus(item.key as any)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filterStatus === item.key
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <QrCode className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-500">Belum ada pendaftaran pada cakupan ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500">
                <tr>
                  <th className="p-4">Token tiket</th>
                  <th className="p-4">Kegiatan</th>
                  <th className="p-4">Status RSVP</th>
                  <th className="p-4">Kehadiran</th>
                  <th className="p-4 text-right">Tanggal daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((r) => {
                  const evt = eventMap.get(r.eventId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {r.registrationToken || 'Menunggu token'}
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                        {evt?.title || 'Kegiatan tidak ditemukan'}
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="capitalize text-[10px]">
                          {{ none: 'Tidak ikut', interested: 'Tertarik', going: 'Terdaftar' }[r.status]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={r.attendanceStatus === 'checked_in' ? 'success' : 'amber'}
                          className="text-[10px]"
                        >
                          {r.attendanceStatus === 'checked_in' ? 'Sudah hadir ✓' : 'Belum hadir'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right text-slate-400 text-[11px]">
                        {r.registeredAt}
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

export default RegistrationTable;
