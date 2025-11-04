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

  // Solo pagos tipo "collection"
  const collectionPayments = payments.filter(p => p.type === 'collection');

  const filteredPayments = collectionPayments.filter(payment => {
    const budget = budgets.find(b => b.id === payment.budgetId);
    return selectedProject === '' || budget?.projectId === selectedProject;
  });

  const getProject = (projectId: string) => projects.find(p => p.id === projectId);
  const getBudget = (budgetId: string) => budgets.find(b => b.id === budgetId);
  const isOverdue = (dueDate: Date) => new Date() > dueDate;

  const totalToCobrar = collectionPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCobrado = collections.reduce((sum, c) => sum + c.amount, 0);
  const pendientesCobro = collectionPayments.filter(p => p.status === 'pending').length;
  const vencidos = collectionPayments.filter(p => p.status === 'pending' && isOverdue(p.dueDate)).length;

  return (
    <div className="min-h-screen bg-black text-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-green-500/25 sm:border-green-500/40 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-green-400 drop-shadow-none sm:drop-shadow-[0_0_8px_#00ff9d]">
          💰 Gestión de Cobros
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          {/* (Opcional) Filtro de proyecto */}
          {projects?.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full sm:w-64 rounded-lg bg-black border border-green-500/25 sm:border-green-500/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/60"
            >
              <option value="">Todas las obras</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-green-500 text-black font-semibold shadow-none sm:shadow-[0_0_10px_#00ff9d] hover:shadow-[0_0_18px_#00ff9d] transition-all">
            <PlusIcon className="h-5 w-5 mr-2" />
            Registrar Cobro
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: CurrencyDollarIcon, label: 'Total a Cobrar', value: `$${totalToCobrar.toLocaleString('es-AR')}` },
          { icon: CheckCircleIcon, label: 'Total Cobrado', value: `$${totalCobrado.toLocaleString('es-AR')}` },
          { icon: ClockIcon, label: 'Pendientes', value: pendientesCobro },
          { icon: CalendarIcon, label: 'Vencidos', value: vencidos },
        ].map((item, i) => (
          <div
            key={i}
            className="
              bg-black rounded-xl
              border border-green-500/15 md:border-green-500/35
              p-4 sm:p-6
              shadow-none md:shadow-[0_0_10px_#00ff9d33]
              hover:md:shadow-[0_0_20px_#00ff9d66]
              transition-all
            "
          >
            <div className="flex items-center">
              <item.icon className="h-7 w-7 sm:h-8 sm:w-8 text-green-400 drop-shadow-none sm:drop-shadow-[0_0_6px_#00ff9d]" />
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-green-400">{item.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collections List */}
      <div className="
        bg-black/70 rounded-xl
        border border-green-500/15 md:border-green-500/35
        shadow-none md:shadow-[0_0_15px_#00ff9d33]
      ">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-green-500/15 md:border-green-500/30">
          <h2 className="text-base sm:text-lg font-semibold text-green-300">Cobros Registrados</h2>
        </div>

        <div className="p-4 sm:p-6">
          {collections.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {collections
                .filter(c => {
                  // Respetar el filtro de proyecto si se usa
                  if (!selectedProject) return true;
                  const pr = getProject(c.projectId);
                  return pr?.id === selectedProject;
                })
                .map((collection) => {
                  const project = getProject(collection.projectId);
                  return (
                    <div
                      key={collection.id}
                      className="
                        rounded-lg p-4 sm:p-6
                        bg-black/60
                        border border-green-500/15 md:border-green-500/25
                        hover:md:shadow-[0_0_15px_#00ff9d66]
                        transition-all
                      "
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-green-300">
                              ${collection.amount.toLocaleString('es-AR')}
                            </h3>
                            <span className="inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full bg-green-500/15 text-green-300 border border-green-400/30">
                              Cobrado
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-sm">
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
                            <div className="mt-2 sm:mt-3">
                              <p className="text-gray-400 text-xs sm:text-sm">Notas:</p>
                              <p className="text-gray-200 text-xs sm:text-sm">{collection.notes}</p>
                            </div>
                          )}

                          {collection.receipt && (
                            <div className="mt-2 sm:mt-3">
                              <p className="text-green-300 text-xs sm:text-sm break-words">
                                📎 Comprobante: {collection.receipt}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center ml-2">
                          <button
                            className="
                              p-2 rounded-lg
                              text-green-300
                              border border-green-500/20
                              hover:bg-green-500/10
                              transition-colors
                            "
                            aria-label="Ver comprobante"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12">
              <CurrencyDollarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-400/60 mx-auto mb-3 sm:mb-4" />
              <div className="text-green-300 text-base sm:text-lg mb-1">No hay cobros registrados</div>
              <p className="text-gray-500 text-sm">Registra tu primer cobro para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collections;
