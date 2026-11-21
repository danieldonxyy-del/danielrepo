import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  QrCode,
  Users,
  CheckCircle2,
  BarChart3,
  Bell,
  Home,
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
 * DORMITORY ADMIN DASHBOARD
 * Dedicated residential activity management for assigned dormitory.
 * Scoped to dormitory events + dormitoryOnly events.
 */
export const DormitoryAdminDashboard: React.FC = () => {
  const {
    events, registrations, announcements, organizations,
    activeRole, currentAdminUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<CampusEvent | null>(null);
  const [now] = useState(() => new Date());

  const assignedOrg = organizations.find((o) => o.id === currentAdminUser?.organizationId);

  // Dormitory-scoped data
  const scopedEvents = getScopedEvents(events, activeRole);
  const scopedRegistrations = getScopedRegistrations(registrations, scopedEvents);
  const scopedAnnouncements = getScopedAnnouncements(announcements, activeRole);

  const publishedEvents = scopedEvents.filter((e) => e.status === 'published').length;
  const upcomingEvents = scopedEvents.filter((e) => {
    const eventDate = new Date(e.startDate);
    return eventDate >= now && e.status === 'published';
  }).length;
  const checkedInCount = scopedRegistrations.filter((r) => r.attendanceStatus === 'checked_in').length;

  const tabs = [
    { key: 'overview', label: 'Ringkasan asrama', icon: BarChart3 },
    { key: 'events', label: `Kegiatan asrama (${scopedEvents.length})`, icon: Calendar },
    { key: 'poster-uploader', label: 'Pembuat poster AI', icon: Sparkles },
    { key: 'attendance', label: `Pendaftaran (${scopedRegistrations.length})`, icon: QrCode },
    { key: 'announcements', label: `Pengumuman (${scopedAnnouncements.length})`, icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-bold">
              <Home className="h-3 w-3 mr-1" />
              Administrator asrama
            </Badge>
            {assignedOrg && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                {assignedOrg.name}
              </span>
            )}
            <span className="text-xs text-slate-400">
              Admin: <strong className="text-slate-700 dark:text-slate-300">{currentAdminUser?.name || 'Administrator asrama'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Panel pengelolaan asrama
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola jadwal ibadah, pertemuan, dan presensi penghuni asrama Edelweiss dan Jasmine.
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
            <DashboardMetricCard label="Kegiatan asrama" value={scopedEvents.length} subtext={`${publishedEvents} diterbitkan`} icon={Home} variant="default" />
            <DashboardMetricCard label="Kegiatan mendatang" value={upcomingEvents} subtext="Telah dijadwalkan" icon={Calendar} variant="blue" />
            <DashboardMetricCard label="Pendaftaran" value={scopedRegistrations.length} subtext="Tiket mahasiswa" icon={Users} variant="purple" />
            <DashboardMetricCard label="Kehadiran terverifikasi" value={checkedInCount} subtext="Presensi telah diperiksa" icon={CheckCircle2} variant="emerald" />
          </div>
          <ActivityReportPanel events={scopedEvents} registrations={scopedRegistrations} title="Kegiatan asrama berdasarkan kategori" scopeLabel="asrama" />
          <EventManagementTable events={scopedEvents.slice(0, 5)} onPreviewEvent={setPreviewEvent} onCreateEventClick={() => setActiveTab('poster-uploader')} role={activeRole} title="Kegiatan asrama terbaru" />
        </div>
      )}

      {activeTab === 'events' && (
        <EventManagementTable events={scopedEvents} onPreviewEvent={setPreviewEvent} onCreateEventClick={() => setActiveTab('poster-uploader')} role={activeRole} title="Pengelolaan kegiatan asrama" />
      )}

      {activeTab === 'poster-uploader' && <PosterUploader onSuccess={() => setActiveTab('events')} />}

      {activeTab === 'attendance' && (
        <RegistrationTable registrations={scopedRegistrations} events={scopedEvents} onLaunchScanner={() => setScannerOpen(true)} title="Catatan kehadiran asrama" subtext="Token presensi dan catatan kehadiran penghuni yang telah diverifikasi." />
      )}

      {activeTab === 'announcements' && (
        <AnnouncementManagement announcements={scopedAnnouncements} role={activeRole} organizationId={assignedOrg?.id} organizerName={assignedOrg?.name} />
      )}

      <QRScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
      {previewEvent && <EventDetailsModal event={previewEvent} open={!!previewEvent} onOpenChange={(open) => !open && setPreviewEvent(null)} />}
    </div>
  );
};

export default DormitoryAdminDashboard;
