import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const { projects, budgets, user } = useApp();

  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const pendingTasks = 5; // Ejemplo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          Bienvenido, {user?.name}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-50 text-blue-600">
              <BuildingOfficeIcon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Obras Activas</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-50 text-green-600">
              <CurrencyDollarIcon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Presupuesto Total</p>
              <p className="text-lg sm:text-3xl font-bold text-gray-900">
                ${totalBudget.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-50 text-yellow-600">
              <ClockIcon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Tareas Pendientes</p>
              <p className="text-xl sm:text-3xl font-bold text-gray-900">{pendingTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-red-50 text-red-600">
              <CheckCircleIcon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Gastado</p>
              <p className="text-lg sm:text-3xl font-bold text-gray-900">
                ${totalSpent.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Obras Recientes</h2>
        </div>
        <div className="p-3 sm:p-6">
          {projects.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <p className="text-sm sm:text-base font-medium text-gray-900">{project.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{project.address}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      ${project.budget.toLocaleString('es-AR')}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'in_progress' 
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status === 'in_progress' ? 'En Progreso' :
                       project.status === 'completed' ? 'Completada' : 'Planificación'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay obras registradas</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;