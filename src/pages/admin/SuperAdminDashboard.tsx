import React, { useState } from 'react';
import {
  ShieldAlert,
  Calendar,
  Sparkles,
  QrCode,
  Users,
  Building2,
  RefreshCw,
  BarChart3,
  SlidersHorizontal,
  Bell,
  FileText,
  Settings,
  Crown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PosterUploader } from '../../dialogs/PosterUploader';
import { QRScannerModal } from '../../dialogs/QRScanner';
import { EventDetailsModal } from '../../dialogs/EventDetailsModal';
import { CampusEvent } from '../../types';
import { DashboardMetricCard } from '../../components/admin/DashboardMetricCard';
import { EventManagementTable } from '../../components/admin/EventManagementTable';
import { AnnouncementManagement } from '../../components/admin/AnnouncementManagement';
import { RegistrationTable } from '../../components/admin/RegistrationTable';
import { ActivityReportPanel } from '../../components/admin/ActivityReportPanel';
import { getRoleLabel } from '../../utils/permissions';
import { toast } from 'sonner';

/**
 * SUPER ADMIN DASHBOARD
 * Platform-wide management: all events, all orgs, all admins.
 * Includes System Configuration, Audit Logs, Role Management tabs.
 */
export const SuperAdminDashboard: React.FC = () => {
  const {
    events,
    registrations,
    announcements,
    organizations,
    adminUsers,
    activeRole,
    currentAdminUser,
    resetAllDemoData,
  } = useApp();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<CampusEvent | null>(null);

  // Super Admin sees ALL data — no scoping
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.status === 'published').length;
  const pendingEvents = events.filter((e) => e.status === 'pending' || e.status === 'draft').length;
  const totalRegistrations = registrations.length;
  const checkedInCount = registrations.filter((r) => r.attendanceStatus === 'checked_in').length;
  const activeOrgs = organizations.filter((o) => o.status === 'active').length;
  const activeAdmins = adminUsers.filter((a) => a.status === 'active').length;

  const handleResetData = () => {
    if (window.confirm('Atur ulang seluruh data demo ke kondisi awal?')) {
      resetAllDemoData();
      toast.success('Lingkungan demo dikembalikan ke kondisi awal UNKLAB.');
    }
  };

  const tabs = [
    { key: 'overview', label: 'Ringkasan platform', icon: BarChart3 },
    { key: 'events', label: `Semua kegiatan (${totalEvents})`, icon: Calendar },
    { key: 'poster-uploader', label: 'Pembuat poster AI', icon: Sparkles },
    { key: 'attendance', label: `Kehadiran (${totalRegistrations})`, icon: QrCode },
    { key: 'announcements', label: `Pengumuman (${announcements.length})`, icon: Bell },
    { key: 'admin-users', label: `Administrator (${adminUsers.length})`, icon: Users },
    { key: 'audit-logs', label: 'Log audit', icon: FileText },
    { key: 'system-config', label: 'Konfigurasi sistem', icon: Settings },
    { key: 'presentation', label: 'Presentasi dan atur ulang', icon: SlidersHorizontal },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="amber" className="text-[10px] font-bold">
              <Crown className="h-3 w-3 mr-1" />
              Super Admin · seluruh platform
            </Badge>
            <span className="text-xs text-slate-400">
              Admin: <strong className="text-slate-700 dark:text-slate-300">{currentAdminUser?.name || 'Administrator'}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Panel Super Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau platform, kelola administrasi lintas organisasi, dan atur tata kelola sistem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScannerOpen(true)} className="text-xs font-semibold">
            <QrCode className="h-4 w-4 mr-1.5 text-blue-500" /> Pemindai QR
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin-management')} className="text-xs font-semibold">
            <Users className="h-4 w-4 mr-1.5 text-amber-500" /> Tim admin
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/organization-management')} className="text-xs font-semibold">
            <Building2 className="h-4 w-4 mr-1.5 text-purple-500" /> Organisasi
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap select-none shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#142D4E] text-white shadow-2xs dark:bg-blue-600'
                  : 'bg-white dark:bg-[#111C2E] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Platform-wide Metrics — 2 rows */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardMetricCard label="Administrator aktif" value={activeAdmins} subtext={`${adminUsers.length} akun terdaftar`} icon={ShieldAlert} variant="amber" />
            <DashboardMetricCard label="Organisasi aktif" value={activeOrgs} subtext={`${organizations.length} organisasi terdaftar`} icon={Building2} variant="purple" />
            <DashboardMetricCard label="Kegiatan kampus" value={totalEvents} subtext={`${publishedEvents} terbit · ${pendingEvents} draf atau menunggu`} icon={Calendar} variant="default" />
            <DashboardMetricCard label="Pendaftaran" value={totalRegistrations} subtext={`${checkedInCount} peserta hadir`} icon={Users} variant="blue" />
          </div>

          {/* Global Analytics */}
          <ActivityReportPanel events={events} registrations={registrations} title="Kegiatan seluruh platform berdasarkan kategori" scopeLabel="seluruh kampus" />

          {/* Quick Preview of Recent Events */}
          <EventManagementTable
            events={events.slice(0, 6)}
            onPreviewEvent={setPreviewEvent}
            onCreateEventClick={() => setActiveTab('poster-uploader')}
            role={activeRole}
            title="Kegiatan platform terbaru"
          />
        </div>
      )}

      {/* ═══ EVENTS TAB ═══ */}
      {activeTab === 'events' && (
        <EventManagementTable
          events={events}
          onPreviewEvent={setPreviewEvent}
          onCreateEventClick={() => setActiveTab('poster-uploader')}
          role={activeRole}
          title="Semua kegiatan kampus"
        />
      )}

      {/* ═══ AI POSTER UPLOADER ═══ */}
      {activeTab === 'poster-uploader' && (
        <PosterUploader onSuccess={() => setActiveTab('events')} />
      )}

      {/* ═══ ATTENDANCE ═══ */}
      {activeTab === 'attendance' && (
        <RegistrationTable
          registrations={registrations}
          events={events}
          onLaunchScanner={() => setScannerOpen(true)}
          title="Semua catatan kehadiran"
          subtext="Token pendaftaran dan catatan kehadiran terverifikasi dari seluruh organisasi."
        />
      )}

      {/* ═══ ANNOUNCEMENTS ═══ */}
      {activeTab === 'announcements' && (
        <AnnouncementManagement
          announcements={announcements}
          role={activeRole}
        />
      )}

      {/* ═══ ADMIN USER OVERVIEW ═══ */}
      {activeTab === 'admin-users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" />
                Daftar administrator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semua administrator yang terdaftar beserta perannya. Kelola melalui{' '}
                <button onClick={() => navigate('/admin-management')} className="text-blue-600 underline font-semibold cursor-pointer">
                  Tim admin (RBAC)
                </button>.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/admin-management')} className="text-xs font-bold">
              <Users className="h-4 w-4 mr-1.5" /> Kelola administrator
            </Button>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Nama</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Peran</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Cakupan</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((admin) => (
                  <tr key={admin.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{admin.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{admin.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={admin.role === 'super_admin' ? 'amber' : 'secondary'} className="text-[10px]">
                        {getRoleLabel(admin.role)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{admin.permissionScope}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          admin.status === 'active'
                            ? 'success'
                            : admin.status === 'suspended' || admin.status === 'revoked'
                              ? 'danger'
                              : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {admin.status === 'active'
                          ? 'Aktif'
                          : admin.status === 'pending_invitation'
                            ? 'Undangan menunggu'
                            : admin.status === 'expired_invitation'
                              ? 'Undangan kadaluarsa'
                              : admin.status === 'suspended'
                                ? 'Ditangguhkan'
                                : admin.status === 'revoked'
                                  ? 'Dicabut'
                                  : 'Tidak aktif'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ AUDIT LOGS (Simulated) ═══ */}
      {activeTab === 'audit-logs' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Log audit platform
          </h3>
          <p className="text-xs text-slate-500">
            Simulasi riwayat audit untuk demo. Pada lingkungan produksi, bagian ini menampilkan log langsung dari Firebase Cloud Functions dan pemicu Firestore.
          </p>
          <div className="space-y-2">
            {[
              { time: '14:32 WITA', actor: 'Dr. Arthur Sengkey', action: 'Published event "Midweek Chapel Service"', level: 'info' },
              { time: '13:15 WITA', actor: 'Ephraim Roring', action: 'Created announcement for BEM Assembly', level: 'info' },
              { time: '12:00 WITA', actor: 'System', action: 'Auto-verified event registration token KLS-EVT-2026-8F3A91', level: 'system' },
              { time: '11:45 WITA', actor: 'Kezia Sompie', action: 'Updated HMP Informatika organization profile', level: 'info' },
              { time: '10:30 WITA', actor: 'Pastor Jerry Manoppo', action: 'Scanned QR attendance for Youth Vespers', level: 'info' },
              { time: '09:00 WITA', actor: 'System', action: 'Daily backup completed — 12 events, 8 registrations synced to Firestore', level: 'system' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap mt-0.5">{log.time}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.actor}</span>
                  <span className="text-xs text-slate-500 ml-1.5">— {log.action}</span>
                </div>
                <Badge variant={log.level === 'system' ? 'blue' : 'secondary'} className="text-[9px] shrink-0">
                  {log.level}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic text-center pt-2">
            Entri audit simulasi untuk demo/presentasi tugas akhir. Belum terhubung ke sistem pencatatan nyata.
          </p>
        </div>
      )}

      {/* ═══ SYSTEM CONFIG (Simulated) ═══ */}
      {activeTab === 'system-config' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-4 w-4 text-indigo-500" />
            Konfigurasi sistem
          </h3>
          <p className="text-xs text-slate-500">
            Pengaturan seluruh platform. Pada lingkungan produksi, perubahan disimpan melalui Firebase Remote Config.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Mode Demo', value: 'Aktif', desc: 'Simulasi sisi klien berjalan' },
              { label: 'Zona waktu kampus', value: 'Asia/Makassar (WITA, UTC+8)', desc: 'Waktu kegiatan ditampilkan dalam WITA' },
              { label: 'Proyek Firebase', value: 'frontend-bbek', desc: 'Proyek backend Firestore dan Auth' },
              { label: 'Terbitkan kegiatan otomatis', value: 'Nonaktif', desc: 'Kegiatan memerlukan persetujuan manual' },
              { label: 'Pelacakan Poin Kapel', value: 'Aktif', desc: 'Kegiatan kerohanian memberi kredit kapel' },
              { label: 'Pendaftaran mandiri mahasiswa', value: 'Dibuka', desc: 'Mahasiswa dapat mendaftar ke kegiatan yang diterbitkan' },
            ].map((cfg, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cfg.label}</span>
                  <Badge variant="secondary" className="text-[10px]">{cfg.value}</Badge>
                </div>
                <p className="text-[11px] text-slate-400">{cfg.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-slate-400 italic text-center">
            Panel konfigurasi sistem simulasi — khusus demo. Belum terhubung ke backend konfigurasi nyata.
          </p>
        </div>
      )}

      {/* ═══ PRESENTATION & RESET ═══ */}
      {activeTab === 'presentation' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-amber-500" />
              Mode Presentasi dan Pengelolaan Data Demo
            </h3>
            <p className="text-xs text-slate-500">
              Untuk presentasi kelas dan evaluasi tugas akhir. Atur ulang kegiatan, pendaftaran, dan kehadiran demo tanpa memasukkan ulang data.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
            <span className="font-semibold">Atur ulang data demo</span>
            <p className="leading-relaxed">
              Data yang dipulihkan:
              <br />• Contoh kegiatan UNKLAB (Midweek Chapel, FIK Hackathon, Youth Vespers, Dormitory Assembly)
              <br />• Contoh profil mahasiswa (Michella Lumengkewas, FIK, Asrama Edelweiss)
              <br />• Pendaftaran demo dan tiket digital awal
              <br />• Contoh pengumuman rektorat dan kerohanian
            </p>
            <div className="pt-2">
              <Button variant="danger" size="sm" onClick={handleResetData} className="font-bold text-xs">
                <RefreshCw className="h-4 w-4 mr-1.5" /> Pulihkan data demo awal UNKLAB
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <QRScannerModal open={scannerOpen} onOpenChange={setScannerOpen} />
      {previewEvent && (
        <EventDetailsModal event={previewEvent} open={!!previewEvent} onOpenChange={(open) => !open && setPreviewEvent(null)} />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
