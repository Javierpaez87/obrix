import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  PhoneIcon 
} from '@heroicons/react/24/outline';

const Projects: React.FC = () => {
  const { projects } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Planificación';
      case 'in_progress': return 'En Progress';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Obras</h1>
        <button className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Nueva Obra</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar obras por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base">
              <option value="">Todos los estados</option>
              <option value="planning">Planificación</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{project.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">{project.description}</p>
                <p className="text-xs sm:text-sm text-gray-500">{project.address}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Presupuesto:</span>
                <span className="font-medium text-gray-900">${project.budget.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Gastado:</span>
                <span className="font-medium text-red-600">${project.spent.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Restante:</span>
                <span className="font-medium text-green-600">
                  ${(project.budget - project.spent).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{Math.round((project.spent / project.budget) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex gap-1 sm:gap-2">
                <button className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex-1 sm:flex-none">
                  <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Ver</span>
                </button>
                <button className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex-1 sm:flex-none">
                  <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
              </div>
              <button 
                onClick={() => openWhatsApp('+54 9 11 9876-5432')}
                className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                title="Contactar cliente"
              >
                <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Cliente</span>
                <span className="sm:hidden">📞</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No se encontraron obras</div>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default Projects;