import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { hasPermission, PermissionAction, getRoleLabel } from '../../utils/permissions';

interface PermissionGateProps {
  /** Required permission(s). If array, user needs ALL of them. */
  requires: PermissionAction | PermissionAction[];
  /** Content to render when permission is granted */
  children: React.ReactNode;
  /** Optional fallback when denied. Defaults to nothing. */
  fallback?: React.ReactNode;
  /** Show a denial card instead of hiding content */
  showDenial?: boolean;
}

/**
 * Conditionally renders children based on the active role's permissions.
 * NOTE: Client-side gate for UI display only — not a security boundary.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  requires,
  children,
  fallback,
  showDenial = false,
}) => {
  const { activeRole } = useApp();
  const actions = Array.isArray(requires) ? requires : [requires];
  const granted = actions.every((action) => hasPermission(activeRole, action));

  if (granted) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showDenial) {
    return (
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-rose-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Akses Dibatasi
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Peran <strong>{getRoleLabel(activeRole)}</strong> tidak memiliki izin untuk mengakses fitur ini.
          Hubungi Super Admin jika Anda memerlukan akses.
        </p>
        <p className="text-[10px] text-slate-400 italic">
          Pemeriksaan izin sisi klien · hanya untuk demo
        </p>
      </div>
    );
  }

  return null;
};

export default PermissionGate;
