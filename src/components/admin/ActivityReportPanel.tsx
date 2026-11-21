import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CampusEvent, EventRegistration } from '../../types';

interface ActivityReportPanelProps {
  events: CampusEvent[];
  registrations: EventRegistration[];
  title?: string;
  scopeLabel?: string;
}

export const ActivityReportPanel: React.FC<ActivityReportPanelProps> = ({
  events,
  registrations,
  title = 'Analisis kegiatan dan partisipasi',
  scopeLabel = 'cakupan administrasi saat ini',
}) => {
  // Category stats derived from scoped events
  const categoryStats = [
    { name: 'Kerohanian', count: events.filter((e) => e.category === 'spiritual').length },
    { name: 'Akademik', count: events.filter((e) => e.category === 'academic').length },
    { name: 'ORMAWA', count: events.filter((e) => e.category === 'ormawa').length },
    { name: 'Asrama', count: events.filter((e) => e.category === 'dormitory').length },
    { name: 'Seminar', count: events.filter((e) => e.category === 'seminar').length },
  ].filter((c) => c.count > 0 || events.length === 0);

  const publishedCount = events.filter((e) => e.status === 'published').length;
  const checkedInCount = registrations.filter((r) => r.attendanceStatus === 'checked_in').length;
  const attendanceRate =
    registrations.length > 0 ? Math.round((checkedInCount / registrations.length) * 100) : 0;

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            {title}
          </h3>
          <p className="text-xs text-slate-400">
            Ringkasan kegiatan dari {scopeLabel.toLowerCase()}.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Kehadiran terverifikasi:</span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {attendanceRate}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Distribution Bar Chart */}
        <div className="lg:col-span-2 space-y-2">
          <span className="text-xs font-medium text-slate-500">
            Kegiatan berdasarkan kategori
          </span>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats.length > 0 ? categoryStats : [{ name: 'Kegiatan', count: events.length }]}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Summary Callouts */}
        <div className="space-y-3 flex flex-col justify-center">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-300">
              <span>Kegiatan diterbitkan</span>
              <span>{publishedCount} / {events.length}</span>
            </div>
            <div className="w-full bg-indigo-200/50 dark:bg-indigo-900/60 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{
                  width: `${events.length > 0 ? (publishedCount / events.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span>Kehadiran terverifikasi</span>
              <span>{checkedInCount} / {registrations.length}</span>
            </div>
            <div className="w-full bg-emerald-200/50 dark:bg-emerald-900/60 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityReportPanel;
