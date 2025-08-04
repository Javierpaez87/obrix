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
  Building2
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useApp();
  
  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';
  
  const baseNavItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
    { to: '/budget-requests', icon: MessageSquare, label: 'Solicitudes' },
    { to: '/budgets', icon: FileText, label: 'Presupuestos' },
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
    <div className="bg-white w-64 min-h-screen shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">ConstructorApp</h1>
            <p className="text-sm text-gray-500">Gestión de Obras</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;