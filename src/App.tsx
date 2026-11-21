import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useApp } from './context/AppContext';
import { AppProvider } from './context/AppProvider';
import { AppLayout } from './components/layout/AppLayout';
import { RequireAuth } from './components/auth/RequireAuth';
import { Overview } from './pages/Overview';
import { Explore } from './pages/Explore';
import { MyAgenda } from './pages/MyAgenda';
import { CalendarPage } from './pages/CalendarPage';
import { SavedEvents } from './pages/SavedEvents';
import { Announcements } from './pages/Announcements';
import { AIAssistant } from './pages/AIAssistant';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminManagement } from './pages/AdminManagement';
import { OrganizationManagement } from './pages/OrganizationManagement';
import { AuthPage } from './pages/AuthPage';

function AppContent() {
  const { theme } = useApp();

  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone Authentication Route (Outside AppLayout - No navbar, sidebar, or chatbot) */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />

        {/* Visiting root '/' automatically redirects to /auth as required */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Protected Application Routes guarded by RequireAuth */}
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/overview" element={<Overview />} />
            <Route path="/events" element={<Explore />} />
            <Route path="/agenda" element={<MyAgenda />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/saved" element={<SavedEvents />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/admin-studio" element={<AdminDashboard />} />
            <Route path="/admin-management" element={<AdminManagement />} />
            <Route path="/organization-management" element={<OrganizationManagement />} />
          </Route>
        </Route>

        {/* Fallback unknown routes */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>

      {/* Global Toaster for feedback across both Auth and Internal pages */}
      <Toaster theme={theme} position="bottom-left" richColors closeButton />
    </BrowserRouter>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
