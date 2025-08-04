import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import BudgetRequests from './pages/BudgetRequests';
import Budgets from './pages/Budgets';
import Collections from './pages/Collections';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Agenda from './pages/Agenda';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/budget-requests" element={<BudgetRequests />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Layout>
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