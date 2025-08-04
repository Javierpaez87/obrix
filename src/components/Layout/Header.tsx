import React from 'react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BellIcon, PhoneIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user, logout } = useApp();

  const openWhatsApp = () => {
    if (user?.phone) {
      const cleanPhone = user.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Panel de Control
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Role Badge */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <span className="text-sm font-medium">
              {user?.role === 'constructor' ? '👷‍♂️ Constructor' : '👤 Cliente'}
            </span>
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <BellIcon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.company}</p>
            </div>
            
            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              title="Contactar por WhatsApp"
            >
              <PhoneIcon className="h-5 w-5" />
            </button>
            
            <img
              className="h-10 w-10 rounded-full"
              src={user?.avatar}
              alt={user?.name}
            />
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            title="Cerrar Sesión"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;