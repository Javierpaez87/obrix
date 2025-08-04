import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusIcon, 
  EyeIcon, 
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Collections: React.FC = () => {
  const { payments, collections, projects, budgets } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Solo mostrar pagos de tipo 'collection' (cobros)
  const collectionPayments = payments.filter(p => p.type === 'collection');
  
  const filteredPayments = collectionPayments.filter(payment => {
    const budget = budgets.find(b => b.id === payment.budgetId);
    return selectedProject === '' || budget?.projectId === selectedProject;
  });

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getBudget = (budgetId: string) => {
    return budgets.find(b => b.id === budgetId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'completed': return 'Cobrado';
      case 'failed': return 'Fallido';
      case 'overdue': return 'Vencido';
      default: return status;
    }
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  const totalToCobrar = collectionPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalCobrado = collections.reduce((sum, c) => sum + c.amount, 0);
  const pendientesCobro = collectionPayments.filter(p => p.status === 'pending').length;
  const vencidos = collectionPayments.filter(p => p.status === 'pending' && isOverdue(p.dueDate)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Cobros</h1>
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrar Cobro
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Total a Cobrar</p>
              <p className="text-2xl font-bold text-green-900">
                ${totalToCobrar.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total Cobrado</p>
              <p className="text-2xl font-bold text-blue-900">
                ${totalCobrado.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">
                {pendientesCobro}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Vencidos</p>
              <p className="text-2xl font-bold text-red-900">
                {vencidos}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collections List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Cobros Registrados</h2>
        </div>
        
        <div className="p-6">
          {collections.length > 0 ? (
            <div className="space-y-4">
              {collections.map((collection) => {
                const project = getProject(collection.projectId);
                
                return (
                  <div key={collection.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            ${collection.amount.toLocaleString('es-AR')}
                          </h3>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Cobrado
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Obra:</p>
                            <p className="font-medium text-gray-900">{project?.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fecha de cobro:</p>
                            <p className="font-medium text-gray-900">
                              {collection.receivedDate.toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Método:</p>
                            <p className="font-medium text-gray-900">{collection.method}</p>
                          </div>
                        </div>
                        
                        {collection.notes && (
                          <div className="mt-3">
                            <p className="text-gray-600 text-sm">Notas:</p>
                            <p className="text-gray-900 text-sm">{collection.notes}</p>
                          </div>
                        )}
                        
                        {collection.receipt && (
                          <div className="mt-3">
                            <p className="text-blue-600 text-sm">
                              📎 Comprobante: {collection.receipt}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <EyeIcon className="h-5 w-5" />
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
              <div className="text-gray-400 text-lg mb-2">No hay cobros registrados</div>
              <p className="text-gray-500">Registra tu primer cobro para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;