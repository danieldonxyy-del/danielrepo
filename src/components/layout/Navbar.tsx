import React, { useState } from 'react';
import { Search, Compass, LogOut, Settings, ShieldCheck, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RoleSwitcher } from '../navigation/RoleSwitcher';
import { ThemeToggle } from '../navigation/ThemeToggle';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { GlobalSearch } from '../navigation/GlobalSearch';
import { getRoleLabel } from '../../utils/permissions';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { student, activeRole, currentAdminUser, firebaseUser, demoAuthUser, logout } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isAdmin = activeRole !== 'student';

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await logout();
    toast.info('Sesi Anda telah berakhir.');
    navigate('/auth');
  };

  // Determine display identity
  const displayName = firebaseUser
    ? firebaseUser.displayName || 'Pengguna'
    : isAdmin
      ? currentAdminUser?.name || 'Administrator'
      : demoAuthUser?.name || student.fullName;

  const displayEmail = firebaseUser
    ? firebaseUser.email || 'Email tidak tersedia'
    : isAdmin
      ? currentAdminUser?.email || 'Email tidak tersedia'
      : demoAuthUser?.email || student.email;

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'U';

  const roleLabel = getRoleLabel(activeRole);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-2 bg-[#142D4E] text-white px-3 sm:px-6 shadow-xs border-b border-[#0f223c] transition-colors select-none">
        {/* Left: Institutional Brand Identity */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            to={isAdmin ? '/admin-studio' : '/overview'}
            className="flex w-fit items-center gap-2.5 group"
            aria-label="Beranda KlabatSync"
          >
            {/* UNKLAB Emblem */}
            <div className="h-9 w-9 rounded-xl bg-[#0f223c] border border-white/10 text-white flex items-center justify-center font-black text-sm shadow-2xs group-hover:bg-[#1a385f] transition-colors">
              <Compass className="h-4 w-4 text-[#D6A84B]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm tracking-tight">
                  Klabat<span className="text-[#D6A84B]">Sync</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-normal hidden md:block">
                Kegiatan kampus Universitas Klabat
              </p>
              </div>
            </Link>
        </div>

        {/* Center: Global Search Bar trigger */}
        <div className="hidden lg:flex items-center max-w-md w-full mx-6">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#1a385f]/90 hover:bg-[#1f4270] border border-white/10 text-slate-200 text-xs transition-colors cursor-pointer shadow-inner"
          >
            <span className="flex items-center gap-2 font-normal text-slate-300">
              <Search className="h-3.5 w-3.5 text-slate-300" />
              <span>Cari kegiatan, Chapel Point, atau pengumuman…</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#142D4E] border border-white/15 text-xs font-mono text-slate-300 font-semibold">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Actions & Profile */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="lg:hidden h-9 w-9 shrink-0 rounded-lg flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A84B] max-[359px]:hidden"
            aria-label="Cari"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Environment Indicator: Demo Mode Switcher (Hidden in production sessions) */}
          <RoleSwitcher />

          {/* Theme switcher */}
          <div className="text-white">
            <ThemeToggle />
          </div>

          {/* Notification Bell */}
          <div className="text-white">
            <NotificationDropdown />
          </div>

          {/* User Profile Area (Visually separate from demo switcher) */}
          <div className="relative pl-2 sm:pl-3 border-l border-white/15">
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              aria-expanded={profileMenuOpen}
              className="flex items-center gap-2 rounded-xl p-1 hover:bg-white/10 transition-colors cursor-pointer text-left select-none"
              title="Profil Pengguna & Pengaturan"
            >
              <div className="relative">
                <div className="h-8 w-8 rounded-lg bg-white text-[#142D4E] flex items-center justify-center font-bold text-xs shadow-2xs">
                  {initials}
                </div>
                {firebaseUser && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#D6A84B] border-2 border-[#142D4E]"
                    title="Firebase SSO Terverifikasi"
                  />
                )}
              </div>
              <div className="hidden xl:block">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[130px]">
                  {displayName}
                </div>
                <div className="text-xs text-slate-300 leading-tight flex items-center gap-1">
                  <span>{roleLabel}</span>
                  <ChevronDown className="h-2.5 w-2.5 text-slate-300" />
                </div>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Tutup menu profil"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 z-50 rounded-2xl bg-white dark:bg-[#111C2E] p-2 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-100">
                  {/* User Identity Info */}
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {displayName}
                      </span>
                      <span                       className="text-xs px-1.5 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {roleLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {displayEmail}
                    </p>
                    <div className="pt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{firebaseUser ? 'Sesi akun terverifikasi' : 'Mode demo · sesi lokal'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate('/auth');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      <span>Pengaturan akun</span>
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate('/admin-studio');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Compass className="h-3.5 w-3.5 text-[#142D4E] dark:text-blue-400" />
                        <span>Buka panel admin</span>
                      </button>
                    )}
                  </div>

                  {/* Logout Item */}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Keluar</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
