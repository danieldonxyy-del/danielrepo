import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  QrCode,
  Users,
  CheckCircle2,
  BarChart3,
  Bell,
  ClipboardList,
  GraduationCap,
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
 * CAMPUS ADMIN DASHBOARD
 * University-wide academic & institutional operations.
 * Scoped to: academic, seminar, competition events + unassigned university events.
 */
export const CampusAdminDashboard: React.FC = () => {
  const {
    events, registrations, announcements,
    activeRole, currentAdminUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<CampusEvent | null>(null);

  // Campus-scoped data
  const scopedEvents = getScopedEvents(events, activeRole);
  const scopedRegistrations = getScopedRegistrations(registrations, scopedEvents);
  const scopedAnnouncements = getScopedAnnouncements(announcements, activeRole);

  const publishedEvents = scopedEvents.filter((e) => e.status === 'published').length;
  const pendingEvents = scopedEvents.filter((e) => e.status === 'pending' || e.status === 'draft').length;
  const checkedInCount = scopedRegistrations.filter((r) => r.attendanceStatus === 'checked_in').length;

  const tabs = [
    { key: 'overview', label: 'Ringkasan kampus', icon: BarChart3 },
    { key: 'events', label: `Kegiatan universitas (${scopedEvents.length})`, icon: Calendar },
    { key: 'poster-uploader', label: 'Pembuat poster AI', icon: Sparkles },
    { key: 'approval-queue', label: `Antrean persetujuan (${pendingEvents})`, icon: ClipboardList },
    { key: 'attendance', label: `Pendaftaran (${scopedRegistrations.length})`, icon: QrCode },
    { key: 'announcements', label: `Pengumuman (${scopedAnnouncements.length})`, icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue" className="text-[10px] font-bold">
              <GraduationCap className="h-3 w-3 mr-1" />
              Administrasi kampus · urusan akademik
            </Badge>
            <span className="text-xs text-slate-400">
              Admin: <strong className="text-slate-700 dark:text-slate-300">{currentAdminUser?.name || 'Administrator kampus'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Urusan Kampus dan Akademik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola jadwal akademik, kolokium fakultas, dan pengumuman rektorat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)} className="text-xs font-semibold">
            <QrCode className="h-4 w-4 mr-1.5 text-blue-500" /> Pemindai QR
          </Button>
          <Button variant="purple" size="sm" onClick={() => setActiveTab('poster-uploader')} className="text-xs font-bold">
            <Sparkles className="h-4 w-4 mr-1.5 text-amber-300" /> Pembuat poster AI
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
            <DashboardMetricCard label="Kegiatan universitas" value={scopedEvents.length} subtext={`${publishedEvents} diterbitkan`} icon={Calendar} variant="blue" />
            <DashboardMetricCard label="Menunggu persetujuan" value={pendingEvents} subtext="Draf dan menunggu tinjauan" icon={ClipboardList} variant="amber" />
            <DashboardMetricCard label="Pendaftaran aktif" value={scopedRegistrations.length} subtext="Tiket mahasiswa diterbitkan" icon={Users} variant="default" />
            <DashboardMetricCard label="Kehadiran terverifikasi" value={checkedInCount} subtext="Dipindai petugas" icon={CheckCircle2} variant="emerald" />
          </div>
          <ActivityReportPanel events={scopedEvents} registrations={scopedRegistrations} title="Kegiatan kampus berdasarkan kategori" scopeLabel="akademik" />
          <EventManagementTable
            events={scopedEvents.slice(0, 5)}
            onPreviewEvent={setPreviewEvent}
            onCreateEventClick={() => setActiveTab('poster-uploader')}
            role={activeRole}
            title="Kegiatan kampus terbaru"
          />
        </div>
      )}

      {/* ═══ EVENTS ═══ */}
      {activeTab === 'events' && (
        <EventManagementTable events={scopedEvents} onPreviewEvent={setPreviewEvent} onCreateEventClick={() => setActiveTab('poster-uploader')} role={activeRole} title="Pengelolaan kegiatan universitas" />
      )}

      {activeTab === 'poster-uploader' && <PosterUploader onSuccess={() => setActiveTab('events')} />}

      {/* ═══ APPROVAL QUEUE ═══ */}
      {activeTab === 'approval-queue' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              Antrean persetujuan kegiatan
            </h3>
            <p className="text-sm text-slate-500">Kegiatan yang menunggu tinjauan dan persetujuan untuk diterbitkan.</p>
          </div>
          {pendingEvents > 0 ? (
            <EventManagementTable
              events={scopedEvents.filter((e) => e.status === 'pending' || e.status === 'draft')}
              onPreviewEvent={setPreviewEvent}
              onCreateEventClick={() => setActiveTab('poster-uploader')}
              role={activeRole}
              title={`Kegiatan menunggu persetujuan (${pendingEvents})`}
            />
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada antrean</p>
              <p className="text-sm text-slate-500 mt-1">Semua kegiatan universitas telah ditinjau.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ ATTENDANCE ═══ */}
      {activeTab === 'attendance' && (
        <RegistrationTable registrations={scopedRegistrations} events={scopedEvents} onLaunchScanner={() => setScannerOpen(true)} title="Pendaftaran kegiatan kampus" subtext="Token pendaftaran untuk kegiatan akademik, seminar, dan kompetisi." />
      )}

      {/* ═══ ANNOUNCEMENTS ═══ */}
      {activeTab === 'announcements' && (
        <AnnouncementManagement announcements={scopedAnnouncements} role={activeRole} />
      )}

      <QRScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
      {previewEvent && <EventDetailsModal event={previewEvent} open={!!previewEvent} onOpenChange={(open) => !open && setPreviewEvent(null)} />}
    </div>
  );
};

export default CampusAdminDashboard;
