// src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@config/constants';

// Pages
import LandingPage    from '@pages/LandingPage';
import LoginPage      from '@pages/LoginPage';
import SignupPage     from '@pages/SignupPage';
import ChatPage       from '@pages/ChatPage';
import SettingsPage   from '@pages/SettingsPage';
import NotFoundPage   from '@pages/NotFoundPage';

// Layout
import AppShell       from '@components/layout/AppShell';
import LoadingScreen  from '@components/ui/LoadingScreen';

// ─── Route guards ─────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { isLoggedIn, initialized } = useAuth();
  if (!initialized) return <LoadingScreen />;
  return isLoggedIn ? children : <Navigate to={ROUTES.LOGIN} replace />;
}

function PublicRoute({ children }) {
  const { isLoggedIn, initialized } = useAuth();
  if (!initialized) return <LoadingScreen />;
  return isLoggedIn ? <Navigate to={ROUTES.CHAT} replace /> : children;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { initialized } = useAuth();

  // Dark mode always on
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (!initialized) return <LoadingScreen />;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a24',
            color:      '#f0f0ff',
            border:     '1px solid #2a2a3d',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#0a0a0f' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0a0a0f' } },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes>
          {/* Public */}
          <Route path={ROUTES.HOME}  element={<PublicRoute><LandingPage  /></PublicRoute>} />
          <Route path={ROUTES.LOGIN} element={<PublicRoute><LoginPage    /></PublicRoute>} />
          <Route path={ROUTES.SIGNUP}element={<PublicRoute><SignupPage   /></PublicRoute>} />

          {/* Private — wrapped in AppShell (sidebar + header) */}
          <Route
            path="/chat/*"
            element={
              <PrivateRoute>
                <AppShell>
                  <Routes>
                    <Route index           element={<ChatPage />} />
                    <Route path=":id"      element={<ChatPage />} />
                  </Routes>
                </AppShell>
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <PrivateRoute>
                <AppShell>
                  <SettingsPage />
                </AppShell>
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
