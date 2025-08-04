import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentArrowUpIcon,
  BuildingStorefrontIcon,
  UserIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const Payments: React.FC = () => {
  const { expenses, projects } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const filteredExpenses = expenses.filter(expense => {
    return (selectedProject === '' || expense.projectId === selectedProject) &&
           (selectedCategory === '' || expense.category === selectedCategory) &&
           (selectedStatus === '' || expense.status === selectedStatus);
  });

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'materials': return 'bg-blue-100 text-blue-800';
      case 'labor': return 'bg-green-100 text-green-800';
      case 'equipment': return 'bg-yellow-100 text-yellow-800';
      case 'services': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'materials': return 'Materiales';
      case 'labor': return 'Mano de Obra';
      case 'equipment': return 'Equipos';
      case 'services': return 'Servicios';
      case 'other': return 'Otros';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'materials': return BuildingStorefrontIcon;
      case 'labor': return UserIcon;
      case 'equipment': return WrenchScrewdriverIcon;
      case 'services': return DocumentArrowUpIcon;
      default: return CurrencyDollarIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'paid': return 'Pagado';
      default: return status;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'transfer': return 'Transferencia';
      case 'check': return 'Cheque';
      case 'card': return 'Tarjeta';
      default: return method;
    }
  };

  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
        <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrar Pago
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Total Pagado</p>
              <p className="text-2xl font-bold text-red-900">
                ${totalPaid.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Pendiente de Pago</p>
              <p className="text-2xl font-bold text-yellow-900">
                ${totalPending.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DocumentArrowUpIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-blue-900">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obra
            </label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las obras</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              <option value="materials">Materiales</option>
              <option value="labor">Mano de Obra</option>
              <option value="equipment">Equipos</option>
              <option value="services">Servicios</option>
              <option value="other">Otros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSelectedProject('');
                setSelectedCategory('');
                setSelectedStatus('');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registro de Pagos</h2>
        </div>
        
        <div className="p-6">
          {filteredExpenses.length > 0 ? (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => {
                const project = getProject(expense.projectId);
                const CategoryIcon = getCategoryIcon(expense.category);
                
                return (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${getCategoryColor(expense.category)}`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {expense.description}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                              {getCategoryText(expense.category)}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                              {getStatusText(expense.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Obra:</p>
                              <p className="font-medium text-gray-900">{project?.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Monto:</p>
                              <p className="font-medium text-gray-900 text-lg">
                                ${expense.amount.toLocaleString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Fecha de pago:</p>
                              <p className="font-medium text-gray-900">
                                {expense.paymentDate.toLocaleDateString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Método:</p>
                              <p className="font-medium text-gray-900">{getMethodText(expense.method)}</p>
                            </div>
                          </div>
                          
                          {(expense.supplier || expense.employee) && (
                            <div className="mt-3">
                              <p className="text-gray-600 text-sm">
                                {expense.supplier ? 'Proveedor:' : 'Empleado:'}
                              </p>
                              <p className="text-gray-900 text-sm font-medium">
                                {expense.supplier || expense.employee}
                              </p>
                            </div>
                          )}
                          
                          {expense.notes && (
                            <div className="mt-3">
                              <p className="text-gray-600 text-sm">Notas:</p>
                              <p className="text-gray-900 text-sm">{expense.notes}</p>
                            </div>
                          )}
                          
                          {expense.receipt && (
                            <div className="mt-3">
                              <p className="text-blue-600 text-sm">
                                📎 Comprobante: {expense.receipt}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No hay pagos registrados</div>
              <p className="text-gray-500">Registra tu primer pago para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;