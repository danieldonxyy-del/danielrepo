import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  QrCode,
  Users,
  CheckCircle2,
  BarChart3,
  Bell,
  Church,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PosterUploader } from '../../dialogs/PosterUploader';
import { QRScannerModal } from '../../dialogs/QRScanner';
import { EventDetailsModal } from '../../dialogs/EventDetailsModal';
import { CampusEvent } from '../../types';
import { getScopedEvents, getScopedRegistrations, getScopedAnnouncements } from '../../utils/permissions';
import { DashboardMetricCard } from '../../components/admin/DashboardMetricCard';
import { EventManagementTable } from '../../components/admin/EventManagementTable';
import { AnnouncementManagement } from '../../components/admin/AnnouncementManagement';
import { RegistrationTable } from '../../components/admin/RegistrationTable';
import { ActivityReportPanel } from '../../components/admin/ActivityReportPanel';

/**
 * SPIRITUAL ADMIN DASHBOARD
 * Dedicated spiritual activity management interface.
 * Scoped to spiritual events, vespers, and events awarding chapel credits.
 */
export const SpiritualAdminDashboard: React.FC = () => {
  const {
    events, registrations, announcements, organizations,
    activeRole, currentAdminUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<CampusEvent | null>(null);

  const assignedOrg = organizations.find((o) => o.id === currentAdminUser?.organizationId || o.id === 'org-spiritual');

  // Spiritual-scoped data
  const scopedEvents = getScopedEvents(events, activeRole);
  const scopedRegistrations = getScopedRegistrations(registrations, scopedEvents);
  const scopedAnnouncements = getScopedAnnouncements(announcements, activeRole);

  const publishedEvents = scopedEvents.filter((e) => e.status === 'published').length;
  const checkedInCount = scopedRegistrations.filter((r) => r.attendanceStatus === 'checked_in').length;

  // Total Chapel Points awarded across spiritual events
  const totalChapelPoints = scopedEvents.reduce(
    (acc, curr) => acc + (curr.chapelPoints || 0),
    0
  );

  const tabs = [
    { key: 'overview', label: 'Ringkasan kapelan', icon: BarChart3 },
    { key: 'events', label: `Kapel dan ibadah Vesper (${scopedEvents.length})`, icon: Calendar },
    { key: 'poster-uploader', label: 'Pembuat poster AI', icon: Sparkles },
    { key: 'attendance', label: `Kredit Kapel (${scopedRegistrations.length})`, icon: QrCode },
    { key: 'announcements', label: `Pengumuman kerohanian (${scopedAnnouncements.length})`, icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="purple" className="text-[10px] font-bold">
              <Church className="h-3 w-3 mr-1" />
              Administrator kerohanian · kapelan
            </Badge>
            {assignedOrg && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                {assignedOrg.name}
              </span>
            )}
            <span className="text-xs text-slate-400">
              Admin: <strong className="text-slate-700 dark:text-slate-300">{currentAdminUser?.name || 'Kapelan kampus'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Kehidupan Kerohanian dan Pelayanan Pioneer Chapel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola persekutuan kampus, ibadah Vesper Sabat, doa tengah pekan, dan verifikasi Poin Kapel.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)} className="text-xs font-semibold">
            <QrCode className="h-4 w-4 mr-1.5 text-blue-500" /> Pemindai QR
          </Button>
          <Button variant="purple" size="sm" onClick={() => setActiveTab('poster-uploader')} className="text-xs font-bold">
            <Sparkles className="h-4 w-4 mr-1.5 text-amber-300" /> Poster AI
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap select-none shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#142D4E] text-white shadow-2xs dark:bg-blue-600'
                  : 'bg-white dark:bg-[#111C2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" /><span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardMetricCard label="Kegiatan kerohanian" value={scopedEvents.length} subtext={`${publishedEvents} diterbitkan`} icon={Church} variant="purple" />
            <DashboardMetricCard label="Poin Kapel tersedia" value={totalChapelPoints} subtext="Kredit Pioneer Chapel" icon={Award} variant="amber" />
            <DashboardMetricCard label="Pendaftaran aktif" value={scopedRegistrations.length} subtext="Tiket diterbitkan" icon={Users} variant="blue" />
            <DashboardMetricCard label="Kehadiran terverifikasi" value={checkedInCount} subtext="Poin telah diberikan" icon={CheckCircle2} variant="emerald" />
          </div>
          <ActivityReportPanel events={scopedEvents} registrations={scopedRegistrations} title="Kegiatan kerohanian dan kehadiran kapel" scopeLabel="kerohanian" />
          <EventManagementTable events={scopedEvents.slice(0, 5)} onPreviewEvent={setPreviewEvent} onCreateEventClick={() => setActiveTab('poster-uploader')} role={activeRole} title="Program kerohanian mendatang" />
        </div>
      )}

      {activeTab === 'events' && (
        <EventManagementTable events={scopedEvents} onPreviewEvent={setPreviewEvent} onCreateEventClick={() => setActiveTab('poster-uploader')} role={activeRole} title="Pioneer Chapel dan kegiatan kerohanian" />
      )}

      {activeTab === 'poster-uploader' && <PosterUploader onSuccess={() => setActiveTab('events')} />}

      {activeTab === 'attendance' && (
        <RegistrationTable registrations={scopedRegistrations} events={scopedEvents} onLaunchScanner={() => setScannerOpen(true)} title="Kehadiran dan kredit Pioneer Chapel" subtext="Token kehadiran untuk Midweek Chapel, Vesper, dan kredit kapel SWOP." />
      )}

      {activeTab === 'announcements' && (
        <AnnouncementManagement announcements={scopedAnnouncements} role={activeRole} organizationId={assignedOrg?.id} organizerName={assignedOrg?.name} />
      )}

      <QRScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
      {previewEvent && <EventDetailsModal event={previewEvent} open={!!previewEvent} onOpenChange={(open) => !open && setPreviewEvent(null)} />}
    </div>
  );
};

export default SpiritualAdminDashboard;
