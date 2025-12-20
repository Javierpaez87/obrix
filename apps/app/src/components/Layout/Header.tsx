import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  BellIcon,
  PhoneIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ShareIcon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useApp();
  const navigate = useNavigate();

  const openWhatsApp = () => {
    if (user?.phone) {
      const cleanPhone = user.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const handleShareApp = async () => {
    const url = window.location.origin;
    const shareData = {
      title: 'Obrix',
      text: 'Estoy usando Obrix para gestionar obras y proyectos. Mirá la app acá:',
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        alert('Link copiado al portapapeles');
      } else {
        window.prompt('Copiá este link para compartir:', url);
      }
    } catch (err) {
      console.error('Error sharing app', err);
    }
  };

  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        {/* Left */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-white/70 hover:text-white lg:hidden"
            title="Abrir menú"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <h1 className="text-lg sm:text-2xl font-semibold text-white hidden sm:block">
            Panel de Control
          </h1>
          <h1 className="text-lg font-semibold text-white sm:hidden">Panel</h1>
        </div>

        {/* Right */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Role badge */}
          <div className="hidden sm:flex items-center px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg">
            <span className="text-xs sm:text-sm font-medium">
              {user?.role === 'constructor'
                ? 'Perfil de Constructor'
                : 'Perfil de Cliente'}
            </span>
          </div>

          {/* Desktop actions */}
          <button
            onClick={handleShareApp}
            className="hidden sm:block p-2 text-white/70 hover:text-white transition-colors"
            title="Compartir Obrix"
          >
            <ShareIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            className="hidden sm:block p-2 text-white/70 hover:text-white transition-colors"
            title="Notificaciones"
          >
            <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs sm:text-sm font-medium text-white">
                {user?.name}
              </p>
              <p className="text-xs text-white/60">{user?.company}</p>
            </div>

            <button
              onClick={openWhatsApp}
              className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors border border-white/10"
              title="Contactar por WhatsApp"
            >
              <PhoneIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {/* Mobile share */}
            <button
              onClick={handleShareApp}
              className="flex sm:hidden items-center justify-center w-8 h-8 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition-colors"
              title="Compartir Obrix"
            >
              <ShareIcon className="h-4 w-4" />
            </button>

            <button
              onClick={goToProfile}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-white/20 overflow-hidden hover:border-white/40 transition-colors"
              title="Ver perfil"
            >
              <img
                className="w-full h-full object-cover"
                src={user?.avatar}
                alt={user?.name}
              />
            </button>
          </div>

          {/* Desktop logout */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
            title="Cerrar Sesión"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>

          {/* Mobile logout */}
          <button
            onClick={handleLogout}
            className="flex sm:hidden items-center justify-center w-8 h-8 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20 transition-colors"
            title="Cerrar Sesión"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
