import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * Route guard that ensures the user is authenticated (via Demo Mode session or Firebase Auth).
 * Unauthenticated requests are redirected directly to /auth.
 */
export const RequireAuth: React.FC = () => {
  const { isAuthenticated, isFirebaseLoading } = useApp();
  const location = useLocation();

  if (isFirebaseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs text-slate-400 font-medium">Checking authentication state...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;

