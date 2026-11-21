import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  QrCode,
  Users,
  Building2,
  CheckCircle2,
  BarChart3,
  Bell,
  Trophy,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PosterUploader } from '../../dialogs/PosterUploader';
import { QRScannerModal } from '../../dialogs/QRScanner';
import { EventDetailsModal } from '../../dialogs/EventDetailsModal';
import { CampusEvent } from '../../types';
import { getScopedEvents, getScopedRegistrations, getScopedAnnouncements, hasPermission } from '../../utils/permissions';
import { DashboardMetricCard } from '../../components/admin/DashboardMetricCard';
import { EventManagementTable } from '../../components/admin/EventManagementTable';
import { AnnouncementManagement } from '../../components/admin/AnnouncementManagement';
import { OrganizationProfileForm } from '../../components/admin/OrganizationProfileForm';
import { RegistrationTable } from '../../components/admin/RegistrationTable';
import { ActivityReportPanel } from '../../components/admin/ActivityReportPanel';

/**
 * ORGANIZATION ADMIN DASHBOARD
 * Scoped to assigned organization(s) only.
 * Works for both ormawa_admin and organization_admin roles.
 * Supports multi-org selector when admin has multiple assignments.
 */
export const OrganizationAdminDashboard: React.FC = () => {
  const {
    events, registrations, announcements, organizations,
    activeRole, currentAdminUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<CampusEvent | null>(null);

  // Determine assigned organizations for this admin
  const assignedOrgIds = currentAdminUser?.organizationId
    ? [currentAdminUser.organizationId]
    : [];
  
  // Find all orgs where this admin is listed in assignedAdminIds
  const orgsFromAssignment = organizations.filter(
    (o) => o.assignedAdminIds?.includes(currentAdminUser?.id || '')
  );
  
  // Merge: assigned from AdminUser + assigned via org's assignedAdminIds
  const allAssignedOrgs = organizations.filter(
    (o) => assignedOrgIds.includes(o.id) || orgsFromAssignment.some((ao) => ao.id === o.id)
  );

  // Multi-org selector state (default to first assigned org)
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    allAssignedOrgs[0]?.id || ''
  );
  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

  // Scoped data for selected org
  const scopedEvents = getScopedEvents(events, activeRole, selectedOrgId);
  const scopedRegistrations = getScopedRegistrations(registrations, scopedEvents);
  const scopedAnnouncements = getScopedAnnouncements(announcements, activeRole, selectedOrgId);

  const publishedEvents = scopedEvents.filter((e) => e.status === 'published').length;
  const checkedInCount = scopedRegistrations.filter((r) => r.attendanceStatus === 'checked_in').length;

  const isOrmawa = activeRole === 'ormawa_admin';
  const roleBadge = isOrmawa ? 'Administrator ORMAWA' : 'Administrator organisasi';
  const badgeVariant = isOrmawa ? 'amber' : 'purple';

  const tabs = [
    { key: 'overview', label: 'Ringkasan organisasi', icon: BarChart3 },
    { key: 'events', label: `Kegiatan (${scopedEvents.length})`, icon: Calendar },
    { key: 'poster-uploader', label: 'Pembuat poster AI', icon: Sparkles },
    { key: 'org-profile', label: 'Profil organisasi', icon: Building2 },
    { key: 'attendance', label: `Kehadiran (${scopedRegistrations.length})`, icon: QrCode },
    { key: 'announcements', label: `Pengumuman (${scopedAnnouncements.length})`, icon: Bell },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={badgeVariant as 'amber' | 'purple'} className="text-[10px] font-bold">
              <Trophy className="h-3 w-3 mr-1" />
              {roleBadge}
            </Badge>
            {selectedOrg && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                Organisasi: {selectedOrg.name}
              </span>
            )}
            <span className="text-xs text-slate-400">
              Admin: <strong className="text-slate-700 dark:text-slate-300">{currentAdminUser?.name || 'Administrator organisasi'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            {isOrmawa ? 'Panel ORMAWA' : 'Panel organisasi'} · {selectedOrg?.name || 'Organisasi'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola kegiatan, verifikasi kehadiran, dan profil {selectedOrg?.name || 'organisasi yang ditugaskan'}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Multi-org selector */}
          {allAssignedOrgs.length > 1 && (
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {allAssignedOrgs.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}
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
          {/* Org branding card */}
          {selectedOrg && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-slate-50 to-indigo-50/50 dark:from-slate-800/50 dark:to-indigo-950/20 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg font-black text-indigo-600 dark:text-indigo-400 shrink-0">
                  {selectedOrg.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{selectedOrg.name}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{selectedOrg.description}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardMetricCard label="Kegiatan organisasi" value={scopedEvents.length} subtext={`${publishedEvents} diterbitkan`} icon={Calendar} variant={isOrmawa ? 'amber' : 'purple'} />
            <DashboardMetricCard label="Pendaftaran aktif" value={scopedRegistrations.length} subtext="Tiket mahasiswa diterbitkan" icon={Users} variant="blue" />
            <DashboardMetricCard label="Kehadiran terverifikasi" value={checkedInCount} subtext="Dipindai petugas" icon={CheckCircle2} variant="emerald" />
            <DashboardMetricCard label="Pengumuman organisasi" value={scopedAnnouncements.length} subtext="Pengumuman diterbitkan" icon={Bell} variant="default" />
          </div>

          <ActivityReportPanel events={scopedEvents} registrations={scopedRegistrations} title={`Kegiatan ${selectedOrg?.name || 'organisasi'} berdasarkan kategori`} scopeLabel={selectedOrg?.name || 'organisasi'} />
          <EventManagementTable events={scopedEvents.slice(0, 5)} onPreviewEvent={setPreviewEvent} onCreateEventClick={() => setActiveTab('poster-uploader')} role={activeRole} organizationId={selectedOrgId} title="Kegiatan organisasi terbaru" />
        </div>
      )}

      {activeTab === 'events' && (
        <EventManagementTable events={scopedEvents} onPreviewEvent={setPreviewEvent} onCreateEventClick={() => setActiveTab('poster-uploader')} role={activeRole} organizationId={selectedOrgId} title={`Kegiatan ${selectedOrg?.name || 'organisasi'}`} />
      )}

      {activeTab === 'poster-uploader' && <PosterUploader onSuccess={() => setActiveTab('events')} />}

      {activeTab === 'org-profile' && selectedOrg && (
        <OrganizationProfileForm organization={selectedOrg} isReadOnly={!hasPermission(activeRole, 'edit_organization_profile')} />
      )}

      {activeTab === 'attendance' && (
        <RegistrationTable registrations={scopedRegistrations} events={scopedEvents} onLaunchScanner={() => setScannerOpen(true)} title={`Tiket peserta ${selectedOrg?.name || 'organisasi'}`} subtext="Token pendaftaran dan catatan kehadiran terverifikasi untuk kegiatan organisasi." />
      )}

      {activeTab === 'announcements' && (
        <AnnouncementManagement announcements={scopedAnnouncements} role={activeRole} organizationId={selectedOrgId} organizerName={selectedOrg?.name} />
      )}

      <QRScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
      {previewEvent && <EventDetailsModal event={previewEvent} open={!!previewEvent} onOpenChange={(open) => !open && setPreviewEvent(null)} />}
    </div>
  );
};

export default OrganizationAdminDashboard;
