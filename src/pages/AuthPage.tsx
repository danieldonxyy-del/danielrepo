import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { firebaseService } from '../services/firebase';
import { initialAdminUsers } from '../data/mockUsers';

export const AuthPage: React.FC = () => {
  const {
    isAuthenticated,
    demoAuthUser,
    firebaseUser,
    loginDemoStudent,
    loginDemoAdmin,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAdminWithEmail,
    bootstrapFirstSuperAdmin,
    logout,
    activeRole,
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [bootstrapKey, setBootstrapKey] = useState('');
  const demoAdmins = initialAdminUsers;

  // Handle Google Sign-In via Firebase
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const user = await loginWithGoogle();
      toast.success(`Berhasil masuk sebagai ${user.displayName || user.email}.`);
      navigate('/overview');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal login via Google';
      toast.error(`Firebase Auth: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Email & Password (Login or Register)
  const handleStudentAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = studentEmail.trim().toLowerCase();

    if (!email.endsWith('@student.unklab.ac.id')) {
      toast.error('Domain tidak valid: Akun mahasiswa wajib menggunakan email institusi @student.unklab.ac.id');
      return;
    }

    try {
      setLoading(true);
      if (authMode === 'register') {
        await registerWithEmail(studentName, email, studentPassword);
        toast.success('Pendaftaran berhasil. Periksa email institusi untuk memverifikasi akun sebelum masuk.');
      } else {
        await loginWithEmail(email, studentPassword);
        toast.success('Selamat datang kembali.');
        navigate('/overview');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Autentikasi gagal.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin Credentials Login
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = adminEmail.trim().toLowerCase();

    try {
      setLoading(true);
      const admin = await loginAdminWithEmail(email, adminPassword);
      toast.success(`Terautentikasi sebagai ${admin.name} (${admin.role.replace('_', ' ')}).`);
      navigate('/admin-studio');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Autentikasi administrator gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleFirstAdminBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await bootstrapFirstSuperAdmin(adminEmail.trim().toLowerCase(), adminPassword, bootstrapKey);
      toast.success('Super Admin pertama berhasil diprovisikan.');
      navigate('/admin-studio');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bootstrap Super Admin gagal.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for instant testing without typing
  const handleQuickDemoStudent = () => {
    loginDemoStudent('demo@student.unklab.ac.id', 'Mahasiswa Demo');
    toast.success('Mode Demo mahasiswa aktif.');
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 py-12 transition-colors selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="h-16 w-16 rounded-3xl bg-linear-to-br from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-center font-black mx-auto shadow-xl shadow-blue-500/20 ring-4 ring-blue-500/10">
            <Compass className="h-8 w-8 text-amber-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Klabat<span className="text-blue-600 dark:text-blue-400">Sync</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Informasi kegiatan dan pengumuman kampus Universitas Klabat
            </p>
          </div>

          {/* Firebase availability indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] font-bold text-amber-800 dark:text-amber-300">
            <span className={`h-2 w-2 rounded-full ${firebaseService.isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{firebaseService.isConfigured ? 'Konfigurasi Firebase tersedia; koneksi diperiksa saat masuk' : 'Konfigurasi Firebase belum tersedia'}</span>
            {firebaseUser && (
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                · {firebaseUser.email}
              </span>
            )}
          </div>
        </div>

        {/* Existing Active Session Banner (if already logged in) */}
        {isAuthenticated && (
          <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 shadow-xs flex items-center justify-between gap-3">
            <div className="text-xs space-y-0.5">
              <div className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Sesi Aktif: {demoAuthUser?.name || firebaseUser?.displayName || 'Pengguna Terautentikasi'}
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                Peran: <strong className="capitalize">{activeRole.replace('_', ' ')}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => navigate(activeRole === 'student' ? '/overview' : '/admin-studio')}
                className="text-xs font-bold"
              >
                Ke Dashboard <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logout();
                  toast.info('Sesi telah diakhiri.');
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900/40"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Tab switch between Student Portal & Administrator Portal */}
        <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            aria-pressed={activeTab === 'student'}
            className={`flex-1 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'student'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="h-4 w-4" />
            Portal Mahasiswa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            aria-pressed={activeTab === 'admin'}
            className={`flex-1 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Portal Administrator
          </button>
        </div>

        {/* STUDENT PORTAL CARD */}
        {activeTab === 'student' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  {authMode === 'login' ? 'Masuk Akun Mahasiswa' : 'Daftar Akun Mahasiswa Baru'}
                </h2>
                <p className="text-xs text-slate-400">
                  Wajib menggunakan email institusi Universitas Klabat
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {authMode === 'login' ? 'Daftar Baru' : 'Sudah Punya Akun'}
                </button>
              </div>
            </div>

            {/* Google Firebase SSO Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 text-xs font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-2xl"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Masuk dengan Google (Firebase SSO)
            </Button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                atau email institusi
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>

            <form onSubmit={handleStudentAuth} className="space-y-4">
              {authMode === 'register' && (
                <div className="space-y-1.5">
                  <label htmlFor="student-name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Lengkap Mahasiswa
                  </label>
                  <div className="relative">
                    <UserIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <Input
                      id="student-name"
                      name="name"
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Nama sesuai akun institusi"
                      className="pl-10 text-xs py-2.5 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="student-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Institusi Mahasiswa
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <Input
                    id="student-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="nama@student.unklab.ac.id"
                    className="pl-10 text-xs py-2.5 rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Format wajib:{' '}
                  <strong className="text-blue-600 dark:text-blue-400 font-extrabold">
                    @student.unklab.ac.id
                  </strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="student-password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <Input
                    id="student-password"
                    name="password"
                    type="password"
                    required
                    autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 text-xs py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full font-bold text-xs py-3 rounded-2xl shadow-md shadow-blue-500/20"
              >
                {loading
                  ? 'Memproses…'
                  : authMode === 'login'
                  ? 'Masuk ke akun mahasiswa'
                  : 'Daftarkan Akun Mahasiswa'}
              </Button>
            </form>
          </div>
        )}

        {activeTab === 'student' && (
          <aside className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Mode Demo · data simulasi</h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Coba tampilan mahasiswa tanpa masuk ke akun produksi.
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleQuickDemoStudent} className="shrink-0 text-xs">
                Masuk sebagai mahasiswa demo
              </Button>
            </div>
          </aside>
        )}

        {/* ADMINISTRATOR PORTAL CARD */}
        {activeTab === 'admin' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Autentikasi Administrator KlabatSync
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Akses terproteksi RBAC untuk Super Admin, BEM/ORMAWA, Dekanat, dan Asrama.
              </p>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Administrator Terdaftar
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="username"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@unklab.ac.id"
                    className="pl-10 text-xs py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kata sandi administrator
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <Input
                    id="admin-password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 text-xs py-2.5 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="purple"
                disabled={loading}
                className="w-full font-bold text-xs py-3 rounded-2xl shadow-md shadow-purple-500/20"
              >
                {loading ? 'Memverifikasi hak akses…' : 'Masuk ke portal administrator'}
              </Button>
            </form>

            {!isAuthenticated && (
              <details className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                <summary className="cursor-pointer text-xs font-bold text-amber-900 dark:text-amber-200">
                  Bootstrap Super Admin pertama (setup satu kali)
                </summary>
                <form onSubmit={handleFirstAdminBootstrap} className="mt-3 space-y-3">
                  <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                    Gunakan akun Firebase terverifikasi dan kunci bootstrap yang disimpan di Secret Manager. Hanya dapat berhasil sekali.
                  </p>
                  <Input
                    type="password"
                    required
                    value={bootstrapKey}
                    onChange={(e) => setBootstrapKey(e.target.value)}
                    placeholder="Kunci bootstrap"
                    autoComplete="off"
                  />
                  <Button type="submit" variant="outline" disabled={loading || !firebaseService.isConfigured} className="w-full text-xs font-bold">
                    {loading ? 'Memproses bootstrap…' : 'Bootstrap Super Admin'}
                  </Button>
                </form>
              </details>
            )}

            {/* Quick Demo Admin Switchers (Part 30.8) */}
            {!firebaseUser && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Pilih Akun Demo Admin (Mode Demo):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {demoAdmins.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setAdminEmail(a.email);
                      loginDemoAdmin(a);
                      toast.info(`Login instan demo: ${a.name} (${a.role.replace('_', ' ')})`);
                      navigate('/admin-studio');
                    }}
                    className="text-left p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/60 dark:border-slate-700/60 transition-colors text-[11px] cursor-pointer"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {a.name}
                    </div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold capitalize">
                      {a.role.replace('_', ' ')}
                    </div>
                  </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security & Simulation Boundaries Disclaimer (Part 30.7 & 30.8) */}
        <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Batas Mode Demo dan Produksi:
            </span>
            <p className="leading-relaxed">
              Mode Demo menggunakan akun dan data simulasi. Untuk penggunaan produksi, pastikan Firebase Authentication, Cloud Functions, dan Firestore Security Rules telah dikonfigurasi serta diterapkan di proyek yang benar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
