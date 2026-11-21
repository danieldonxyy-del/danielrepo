import React from 'react';
import { useApp } from '../context/AppContext';
import { SuperAdminDashboard } from './admin/SuperAdminDashboard';
import { CampusAdminDashboard } from './admin/CampusAdminDashboard';
import { OrganizationAdminDashboard } from './admin/OrganizationAdminDashboard';
import { DormitoryAdminDashboard } from './admin/DormitoryAdminDashboard';
import { SpiritualAdminDashboard } from './admin/SpiritualAdminDashboard';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * AdminDashboard Dispatcher Component.
 * Resolves to the dedicated role-specific dashboard page depending on `activeRole`.
 * Ensures each administrator role has its own dedicated dashboard experience,
 * navigation structure, statistics, management tools, and authorized data scope.
 */
export const AdminDashboard: React.FC = () => {
  const { activeRole } = useApp();
  const navigate = useNavigate();

  switch (activeRole) {
    case 'super_admin':
      return <SuperAdminDashboard />;

    case 'campus_admin':
      return <CampusAdminDashboard />;

    case 'ormawa_admin':
    case 'organization_admin':
      return <OrganizationAdminDashboard />;

    case 'dormitory_admin':
      return <DormitoryAdminDashboard />;

    case 'spiritual_admin':
      return <SpiritualAdminDashboard />;

    case 'student':
    default:
      return (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Akses Admin Studio Dibatasi
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sesi aktif Anda teridentifikasi sebagai <strong>Mahasiswa (Student)</strong>. Admin Studio dirancang khusus untuk administrator UNKLAB. Silakan masuk dengan akun Administrator di halaman login demo.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/overview')}>
              Kembali ke Student Overview
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/auth')}>
              Masuk Akun Admin
            </Button>
          </div>
        </div>
      );
  }
};

export default AdminDashboard;
