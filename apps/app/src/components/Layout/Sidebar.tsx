import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Home,
  FolderOpen,
  FileText,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  BookOpen,
  User,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Estilos compartidos para el look "neon dark" (match con Agenda)
const shell =
  'fixed lg:relative z-50 min-h-screen w-72 transition-transform duration-300 ease-in-out lg:translate-x-0';
const panel =
  'h-full bg-neutral-950/95 backdrop-blur border-r border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]';
const headerWrap = 'px-5 py-5 border-b border-white/10 relative';

const itemBase =
  'group flex items-center gap-3 px-4 py-3 rounded-xl border transition select-none';
const itemIdle = 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white';
const itemActive =
  'border-white/20 bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]';

const iconBase = 'w-5 h-5';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useApp();

  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';

  const baseNavItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
    { to: '/budget-management', icon: FileText, label: 'Presupuestos' },
    { to: '/payments', icon: TrendingDown, label: 'Pagos' },
  ];

  if (isConstructor) {
    baseNavItems.splice(4, 0, { to: '/collections', icon: TrendingUp, label: 'Cobros' });
  }

  const navItems = [...baseNavItems, { to: '/agenda', icon: BookOpen, label: 'Agenda' }];
  navItems.push({ to: '/profile', icon: User, label: 'Perfil' });

  return (
    <aside className={`${shell} ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Fondo semitransparente para mobile */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 transition-opacity ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div className={`${panel} w-72`}>        
        {/* Header */}
        <div className={headerWrap}>
          {/* Botón cerrar en mobile */}
          <button
            onClick={onClose}
            className="lg:hidden absolute right-4 top-4 inline-flex items-center justify-center w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/5"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>

          <NavLink to="/" className="flex items-center justify-center py-2 hover:opacity-80 transition">
            <img
              src="/obrix-logo.png"
              alt="Obrix"
              className="h-24 w-auto drop-shadow-[0_0_10px_rgba(0,255,163,0.4)]"
            />
          </NavLink>
        </div>

        {/* Navegación */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [itemBase, isActive ? itemActive : itemIdle].join(' ')
              }
            >
              {/* Indicador neon a la izquierda */}
              <span
                className="relative inline-flex w-1.5 h-6 rounded-full overflow-hidden"
                aria-hidden
              >
                <span className="absolute inset-0 bg-gradient-to-b from-cyan-400 via-fuchsia-400 to-emerald-400 opacity-0 group-hover:opacity-70 transition" />
                <span className="absolute inset-0 bg-white/10 group-[.active]:opacity-0" />
              </span>

              <item.icon className={`${iconBase} text-white`} />
              <span className="truncate text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mensaje inferior (opcional) */}
        <div className="mt-auto px-5 py-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60 hidden lg:block">
            {isClient && (
              <p>Estás en vista de <span className="text-white">Cliente</span>.</p>
            )}
            {isConstructor && (
              <p>Estás en vista de <span className="text-white">Constructor/a</span>.</p>
            )}
            {!isClient && !isConstructor && (
              <p>Seleccioná un rol para ver menús específicos.</p>
            )}
          </div>

          <a
            href="https://laburapp.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
          >
            <img
              src="/laburapp-logo.png"
              alt="Laburapp"
              className="w-20 h-auto drop-shadow-[0_0_8px_rgba(0,255,163,0.3)]"
            />
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
