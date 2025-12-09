import React, { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import PhoneRequiredModal from '../common/PhoneRequiredModal';
import { useApp } from '../../context/AppContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const { user, updateProfile } = useApp();

  useEffect(() => {
    if (user && !user.phone) {
      setShowPhoneModal(true);
    } else {
      setShowPhoneModal(false);
    }
  }, [user]);

  const handlePhoneComplete = async (phone: string) => {
    const { error } = await updateProfile({ phone });
    if (!error) {
      setShowPhoneModal(false);
    } else {
      throw new Error('Error al actualizar el teléfono');
    }
  };

  return (
    <div className="flex h-screen bg-neutral-950">
      {showPhoneModal && <PhoneRequiredModal onComplete={handlePhoneComplete} />}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6 bg-neutral-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;