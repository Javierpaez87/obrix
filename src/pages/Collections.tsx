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

  const collectionPayments = payments.filter(p => p.type === 'collection');
  
  const filteredPayments = collectionPayments.filter(payment => {
    const budget = budgets.find(b => b.id === payment.budgetId);
    return selectedProject === '' || budget?.projectId === selectedProject;
  });

  const getProject = (projectId: string) => projects.find(p => p.id === projectId);
  const getBudget = (budgetId: string) => budgets.find(b => b.id === budgetId);

  const isOverdue = (dueDate: Date) => new Date() > dueDate;

  const totalToCobrar = collectionPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalCobrado = collections.reduce((sum, c) => sum + c.amount, 0);
  const pendientesCobro = collectionPayments.filter(p => p.status === 'pending').length;
  const vencidos = collectionPayments.filter(p => p.status === 'pending' && isOverdue(p.dueDate)).length;

  return (
    <div className="space-y-8 text-gray-200 bg-black min-h-screen p-8">
      <div className="flex items-center justify-between border-b border-green-500/40 pb-4">
        <h1 className="text-3xl font-bold text-green-400 drop-shadow-[0_0_8px_#00ff9d]">
          💰 Gestión de Cobros
        </h1>
        <button className="flex items-center px-4 py-2 bg-green-500 text-black font-semibold rounded-lg shadow-[0_0_10px_#00ff9d] hover:shadow-[0_0_20px_#00ff9d] transition-all">
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrar Cobro
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: CurrencyDollarIcon, label: 'Total a Cobrar', value: `$${totalToCobrar.toLocaleString('es-AR')}` },
          { icon: CheckCircleIcon, label: 'Total Cobrado', value: `$${totalCobrado.toLocaleString('es-AR')}` },
          { icon: ClockIcon, label: 'Pendientes', value: pendientesCobro },
          { icon: CalendarIcon, label: 'Vencidos', value: vencidos },
        ].map((item, i) => (
          <div 
            key={i} 
            className="bg-black border border-green-500/40 rounded-xl p-6 shadow-[0_0_10px_#00ff9d33] hover:shadow-[0_0_20px_#00ff9d66] transition-all"
          >
            <div className="flex items-center">
              <item.icon className="h-8 w-8 text-green-400 drop-shadow-[0_0_6px_#00ff9d]" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-400">{item.label}</p>
                <p className="text-2xl font-bold text-white">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collections List */}
      <div className="bg-black/70 border border-green-500/40 rounded-xl shadow-[0_0_15px_#00ff9d33]">
        <div className="px-6 py-4 border-b border-green-500/30">
          <h2 className="text-lg font-semibold text-green-300">Cobros Registrados</h2>
        </div>
        
        <div className="p-6">
          {collections.length > 0 ? (
            <div className="space-y-4">
              {collections.map((collection) => {
                const project = getProject(collection.projectId);
                return (
                  <div
                    key={collection.id}
                    className="border border-green-500/20 bg-black/50 rounded-lg p-6 hover:shadow-[0_0_15px_#00ff9d66] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-green-300">
                            ${collection.amount.toLocaleString('es-AR')}
                          </h3>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-400/40">
                            Cobrado
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Obra:</p>
                            <p className="font-medium text-white">{project?.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Fecha de cobro:</p>
                            <p className="font-medium text-white">
                              {collection.receivedDate.toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Método:</p>
                            <p className="font-medium text-white">{collection.method}</p>
                          </div>
                        </div>

                        {collection.notes && (
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm">Notas:</p>
                            <p className="text-gray-200 text-sm">{collection.notes}</p>
                          </div>
                        )}

                        {collection.receipt && (
                          <div className="mt-3">
                            <p className="text-green-300 text-sm">
                              📎 Comprobante: {collection.receipt}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-green-300 border border-green-500/40 rounded-lg hover:bg-green-500/10 transition-all">
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
              <CurrencyDollarIcon className="h-12 w-12 text-green-400/50 mx-auto mb-4 drop-shadow-[0_0_8px_#00ff9d]" />
              <div className="text-green-300 text-lg mb-2">No hay cobros registrados</div>
              <p className="text-gray-500">Registra tu primer cobro para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;
