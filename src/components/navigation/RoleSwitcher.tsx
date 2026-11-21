import React, { useState } from 'react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminRole, AdminUser } from '../../types';

export const RoleSwitcher: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    adminUsers,
    setCurrentAdminUser,
    demoAuthUser,
    firebaseUser,
  } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // In Production Mode (authenticated via real Firebase session and not demo),
  // interactive role switching is completely hidden from the header.
  const isDemoMode = !firebaseUser && (Boolean(demoAuthUser?.isDemo) || !demoAuthUser);

  if (!isDemoMode) {
    return null;
  }

  const rolesList: { role: AdminRole; label: string; desc: string; admin?: AdminUser }[] = [
    {
      role: 'student',
      label: 'Mahasiswa',
      desc: 'Michella Lumengkewas (FIK · Asrama Edelweiss)',
    },
    {
      role: 'super_admin',
      label: 'Super Admin',
      desc: 'Dr. Arthur Sengkey (Tata kelola platform & RBAC)',
      admin: adminUsers.find((a) => a.role === 'super_admin'),
    },
    {
      role: 'campus_admin',
      label: 'Admin Kampus',
      desc: 'Prof. Danny Rantung (Urusan kampus dan akademik)',
      admin: adminUsers.find((a) => a.role === 'campus_admin'),
    },
    {
      role: 'ormawa_admin',
      label: 'Admin ORMAWA',
      desc: 'Ephraim Roring (Ketua BEM UNKLAB)',
      admin: adminUsers.find((a) => a.role === 'ormawa_admin'),
    },
    {
      role: 'dormitory_admin',
      label: 'Admin Asrama',
      desc: 'Kepala asrama Sarah Rondonuwu (Edelweiss & Jasmine)',
      admin: adminUsers.find((a) => a.role === 'dormitory_admin'),
    },
    {
      role: 'spiritual_admin',
      label: 'Admin Kerohanian',
      desc: 'Pastor Jerry Manoppo (Pelayanan Pioneer Chapel)',
      admin: adminUsers.find((a) => a.role === 'spiritual_admin'),
    },
    {
      role: 'organization_admin',
      label: 'Admin Organisasi',
      desc: 'Kezia Sompie (HMP Informatika)',
      admin: adminUsers.find((a) => a.role === 'organization_admin'),
    },
  ];

  const currentSelection = rolesList.find((r) => r.role === activeRole) || rolesList[0];

  const handleSelectRole = (r: (typeof rolesList)[0]) => {
    setActiveRole(r.role);
    setCurrentAdminUser(r.admin || null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Visually separated Demo Environment indicator */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-sm font-medium transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D6A84B]"
        title="Ganti peran dalam Mode Demo"
      >
        <span className="text-xs font-semibold text-[#D6A84B] whitespace-nowrap sm:hidden">Demo</span>
        <span className="hidden text-xs font-semibold text-[#D6A84B] whitespace-nowrap sm:inline">Mode demo</span>
        <span className="text-slate-200 hidden 2xl:inline text-sm whitespace-nowrap">· {currentSelection.label}</span>
        <ChevronDown className="h-3 w-3 text-amber-300/80 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] z-50 rounded-2xl bg-white dark:bg-[#111C2E] p-2.5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Ganti peran demo
              </span>
            </div>

            <div className="py-1.5 max-h-80 overflow-y-auto space-y-1">
              {rolesList.map((item) => {
                const isSelected = activeRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleSelectRole(item)}
                    className={`w-full text-left p-2.5 rounded-xl text-sm transition-colors flex items-start justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{item.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                        {item.desc}
                      </p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[#142D4E] dark:text-blue-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                Mode ini hanya tersedia untuk demo dan presentasi. Dalam penggunaan produksi, peran ditentukan oleh server autentikasi.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;
