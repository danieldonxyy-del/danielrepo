import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { SiteFooter } from './SiteFooter';
import { GlobalChatbotWidget } from '../ai/GlobalChatbotWidget';
import { useApp } from '../../context/AppContext';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { dataError, dataStatus, isDemoMode } = useApp();

  // Hide public footer on internal administration pages
  const isAdminRoute =
    location.pathname.startsWith('/admin-studio') ||
    location.pathname.startsWith('/admin-management') ||
    location.pathname.startsWith('/organization-management');

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#0B1320] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-[#142D4E] selection:text-white">
      {/* Top Navbar: Primary Deep Navy Navigation */}
      <Navbar />

      {/* Main Container with Sidebar & Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[#142D4E] focus:shadow-lg"
      >
        Lewati ke konten utama
      </a>
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto overflow-hidden">
        {/* Desktop Sidebar (Role-aware navigation) */}
        <Sidebar />

        {/* Scrollable Content Region */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto max-w-full flex flex-col focus:outline-none">
          {/* Page Content Container with Consistent Horizontal Alignment */}
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-12 w-full">
            {dataError && !isDemoMode && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200"
              >
                Gagal menyinkronkan data Firebase: {dataError}
              </div>
            )}
            {!dataError && dataStatus === 'loading' && !isDemoMode && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                Memuat data dari Firebase…
              </div>
            )}
            <Outlet />
          </div>

          {/* Institutional Footer (Full-width across content pane, sits naturally after page content) */}
          {!isAdminRoute && <SiteFooter />}

          {/* Mobile spacing to prevent bottom nav overlap */}
          <div className="h-28 pb-[env(safe-area-inset-bottom)] lg:hidden" />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Persistent AI Assistant Widget */}
      <GlobalChatbotWidget />
    </div>
  );
};

export default AppLayout;
