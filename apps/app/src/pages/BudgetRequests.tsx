import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RequestForm from '../components/BudgetRequests/RequestForm';
import QuoteForm from '../components/BudgetRequests/QuoteForm';
import BudgetReview from '../components/BudgetRequests/BudgetReview';
import {
  PlusIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const BudgetRequests: React.FC = () => {
  const { budgetRequests, budgets, projects, user } = useApp();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showBudgetReview, setShowBudgetReview] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'quotes'>('requests');

  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';

  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'counter_offer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'quoted':
        return 'Cotizado';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'sent':
        return 'Enviado';
      case 'counter_offer':
        return 'Contraoferta';
      default:
        return status;
    }
  };

  const handleCreateQuote = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowQuoteForm(true);
  };

  const handleViewBudget = (budget: any) => {
    setSelectedBudget(budget);
    setShowBudgetReview(true);
  };

  // Por ahora solo abre el modal de nueva solicitud.
  // Más adelante lo conectamos a "editar" pasando el ticket.
  const handleViewRequest = (requestId: string) => {
    console.log('Ver / editar solicitud con id:', requestId);
    setShowRequestForm(true);
  };

  // Por ahora solo loguea. Más adelante lo conectamos a Supabase / soft delete.
  const handleDeleteRequest = (requestId: string) => {
    console.log('Eliminar (en futuro: enviar a basurero) solicitud con id:', requestId);
    // Aquí después haremos el soft delete / actualización de estado real.
  };

  const openWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isClient ? 'Mis Solicitudes de Presupuesto' : 'Solicitudes de Presupuesto'}
        </h1>
        {isClient && (
          <button
            onClick={() => setShowRequestForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nueva Solicitud
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Solicitudes ({budgetRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quotes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Presupuestos ({budgets.length})
          </button>
        </nav>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgetRequests.map((request) => {
            const project = getProject(request.projectId);

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* Header de la card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {request.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{project?.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {request.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        request.priority
                      )}`}
                    >
                      {getPriorityText(request.priority)}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>

                {/* Fechas */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Solicitado:</span>
                    <span className="text-gray-900">
                      {request.createdAt instanceof Date
                        ? request.createdAt.toLocaleDateString('es-AR')
                        : new Date(request.createdAt).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                  {request.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha límite:</span>
                      <span className="text-gray-900">
                        {request.dueDate instanceof Date
                          ? request.dueDate.toLocaleDateString('es-AR')
                          : new Date(request.dueDate).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    {/* Ver / editar */}
                    <button
                      onClick={() => handleViewRequest(request.id)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Ver / editar
                    </button>

                    {/* Cotizar (solo constructor, estado pendiente) */}
                    {isConstructor && request.status === 'pending' && (
                      <button
                        onClick={() => handleCreateQuote(request.id)}
                        className="flex items-center px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Cotizar
                      </button>
                    )}

                    {/* Eliminar (por ahora solo UI + console.log) */}
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="flex items-center px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Eliminar
                    </button>
                  </div>

                  {/* Enviar (antes WhatsApp) */}
                  <button
                    onClick={() =>
                      openWhatsApp(
                        isClient ? '+54 9 11 1234-5678' : '+54 9 11 9876-5432',
                        `Hola! Quería conversar sobre la solicitud: ${request.title}`
                      )
                    }
                    className="flex items-center px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    Enviar
                  </button>
                </div>
              </div>
            );
          })}

          {budgetRequests.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No hay solicitudes</div>
              <p className="text-gray-500">
                {isClient
                  ? 'Crea tu primera solicitud de presupuesto'
                  : 'No hay solicitudes pendientes'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quotes Tab */}
      {activeTab === 'quotes' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Presupuestos</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presupuesto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgets.map((budget) => {
                  const project = getProject(budget.projectId);

                  return (
                    <tr key={budget.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {budget.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {budget.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {project?.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          $
                          {budget.amount.toLocaleString
                            ? budget.amount.toLocaleString('es-AR')
                            : budget.amount}
                        </div>
                        {budget.estimatedDays && (
                          <div className="text-xs text-gray-500">
                            {budget.estimatedDays} días
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            budget.status
                          )}`}
                        >
                          {getStatusText(budget.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {budget.requestedAt instanceof Date
                          ? budget.requestedAt.toLocaleDateString('es-AR')
                          : new Date(budget.requestedAt).toLocaleDateString(
                              'es-AR'
                            )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewBudget(budget)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {budget.status === 'sent' && isClient && (
                            <>
                              <button className="text-green-600 hover:text-green-900">
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {budgets.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No hay presupuestos</div>
              <p className="text-gray-500">
                Los presupuestos aparecerán aquí una vez creados
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
      />

      <QuoteForm
        isOpen={showQuoteForm}
        onClose={() => setShowQuoteForm(false)}
        requestId={selectedRequestId}
      />

      {selectedBudget && (
        <BudgetReview
          isOpen={showBudgetReview}
          onClose={() => setShowBudgetReview(false)}
          budget={selectedBudget}
        />
      )}
    </div>
  );
};

export default BudgetRequests;
