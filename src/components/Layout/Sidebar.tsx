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
  Building2,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

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

  // Add Collections only for constructors
  if (isConstructor) {
    baseNavItems.splice(4, 0, { to: '/collections', icon: TrendingUp, label: 'Cobros' });
  }

  // Add Agenda for all users
  const navItems = [...baseNavItems, { to: '/agenda', icon: BookOpen, label: 'Agenda' }];

  // Add Profile at the end
  navItems.push({ to: '/profile', icon: User, label: 'Perfil' });

  return (
    <div className={`
      bg-white min-h-screen shadow-lg transition-transform duration-300 ease-in-out z-50
      fixed lg:relative lg:translate-x-0 w-64
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-4 sm:p-6 border-b border-gray-200">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-md text-gray-400 hover:text-gray-600 lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">ConstructorApp</h1>
            <p className="text-xs sm:text-sm text-gray-500">Gestión de Obras</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-4 sm:mt-6">
        <ul className="space-y-1 sm:space-y-2 px-3 sm:px-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;