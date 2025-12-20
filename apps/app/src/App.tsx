import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import BudgetManagement from './pages/BudgetManagement';
import Collections from './pages/Collections';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Agenda from './pages/Agenda';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TicketDetail from './pages/TicketDetail';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useApp();

  // 🟢 Loader global neón (antes de cualquier ruta)
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner neón */}
          <div className="relative">
            {/* Glow */}
            <div
              className="absolute -inset-6 rounded-full blur-2xl opacity-60"
              style={{
                background:
                  'radial-gradient(circle, rgba(0,255,163,0.35) 0%, rgba(0,255,163,0) 70%)',
              }}
            />

            {/* Ring base */}
            <div
              className="h-14 w-14 rounded-full border border-emerald-300/25"
              style={{ boxShadow: '0 0 30px rgba(0,255,163,0.25)' }}
            />

            {/* Spinner */}
            <div
              className="absolute inset-0 h-14 w-14 rounded-full border-2 border-emerald-300/20 border-t-emerald-300 animate-spin"
              style={{ boxShadow: '0 0 22px rgba(0,255,163,0.35)' }}
            />
          </div>

          {/* Texto */}
          <div className="text-center">
            <div
              className="text-base sm:text-lg font-semibold tracking-wide"
              style={{
                color: '#00FFA3',
                textShadow: '0 0 16px rgba(0,255,163,0.35)',
              }}
            >
              Cargando
              <span className="inline-flex w-10 justify-start">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse [animation-delay:150ms]">.</span>
                <span className="animate-pulse [animation-delay:300ms]">.</span>
              </span>
            </div>

            <div className="mt-2 text-xs sm:text-sm text-white/60">
              Preparando tu workspace
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />

      <Route
        path="/forgot-password"
        element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" replace />}
      />

      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/ticket/:ticketId" element={<TicketDetail />} />
      <Route path="/tickets/:ticketId" element={<TicketDetail />} />

      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/budget-management" element={<BudgetManagement />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
