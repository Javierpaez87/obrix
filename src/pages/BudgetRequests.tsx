import React, { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

const BudgetRequests: React.FC = () => {
  const { budgetRequests, budgets, projects, user } = useApp();

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showBudgetReview, setShowBudgetReview] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'quotes'>('requests');

  // Estados que vienen DIRECTO de Supabase
  const [dbBudgetRequests, setDbBudgetRequests] = useState<any[]>([]);
  const [dbBudgets, setDbBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const formatDate = (value: any) => {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('es-AR');
  };

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Solicitudes desde tabla public.tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('*');

      if (ticketsError) throw ticketsError;

      // ✅ Presupuestos desde tabla public.quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('quotes')
        .select('*');

      if (quotesError) throw quotesError;

      const normalizedRequests = (ticketsData || []).map((r: any) => ({
        ...r,
        id: r.id,
        projectId: r.projectId ?? r.project_id,
        createdAt: r.createdAt ?? r.created_at,
        dueDate: r.dueDate ?? r.due_date,
        priority: r.priority ?? 'medium',
        status: r.status ?? 'pending',
      }));

      const normalizedBudgets = (quotesData || []).map((b: any) => ({
        ...b,
        id: b.id,
        projectId: b.projectId ?? b.project_id,
        requestedAt: b.requestedAt ?? b.requested_at,
        status: b.status ?? 'sent',
      }));

      setDbBudgetRequests(normalizedRequests);
      setDbBudgets(normalizedBudgets);

      console.log('✅ Tickets (requests) desde Supabase:', normalizedRequests);
      console.log('✅ Quotes (budgets) desde Supabase:', normalizedBudgets);
    } catch (err: any) {
      console.error('Error al cargar datos de tickets/quotes desde Supabase:', err);
      setError('No se pudieron cargar las solicitudes/presupuestos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
    // Si más adelante querés filtrar por usuario logueado:
    // }, [user?.id]);
  }, []);

  const handleCreateQuote = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowQuoteForm(true);
  };

  const handleViewBudget = (budget: any) => {
    setSelectedBudget(budget);
    setShowBudgetReview(true);
  };

  const openWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Preferimos datos reales de Supabase, y usamos el contexto como fallback
  const requestsToShow = dbBudgetRequests.length ? dbBudgetRequests : budgetRequests;
  const budgetsToShow = dbBudgets.length ? dbBudgets : budgets;

  return (
    <div className="space-y-6">
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

      {loading && <p className="text-sm text-gray-500">Cargando solicitudes y presupuestos...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

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
            Solicitudes ({requestsToShow.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quotes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Presupuestos ({budgetsToShow.length})
          </button>
        </nav>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {requestsToShow.map((request: any) => {
            const project = getProject(request.projectId);
            const createdAt = formatDate(request.createdAt);
            const dueDate = formatDate(request.dueDate);

            return (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project?.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{request.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        request.priority,
                      )}`}
                    >
                      {getPriorityText(request.priority)}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        request.status,
                      )}`}
                    >
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Solicitado:</span>
                    <span className="text-gray-900">{createdAt}</span>
                  </div>
                  {request.dueDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha límite:</span>
                      <span className="text-gray-900">{dueDate}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Ver
                    </button>
                    {isConstructor && request.status === 'pending' && (
                      <button
                        onClick={() => handleCreateQuote(request.id)}
                        className="flex items-center px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        Cotizar
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      openWhatsApp(
                        isClient ? '+54 9 11 1234-5678' : '+54 9 11 9876-5432',
                        `Hola! Quería conversar sobre la solicitud: ${request.title}`,
                      )
                    }
                    className="flex items-center px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    WhatsApp
                  </button>
                </div>
              </div>
            );
          })}

          {requestsToShow.length === 0 && !loading && (
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
                {budgetsToShow.map((budget: any) => {
                  const project = getProject(budget.projectId);
                  const requestedAt = formatDate(budget.requestedAt);

                  return (
                    <tr key={budget.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{budget.title}</div>
                          <div className="text-sm text-gray-500">{budget.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{project?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          $
                          {(() => {
                            const num =
                              typeof budget.amount === 'number'
                                ? budget.amount
                                : Number(budget.amount);
                            return Number.isNaN(num)
                              ? budget.amount
                              : num.toLocaleString('es-AR');
                          })()}
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
                            budget.status,
                          )}`}
                        >
                          {getStatusText(budget.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requestedAt}
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

          {budgetsToShow.length === 0 && !loading && (
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
        onClose={() => {
          setShowRequestForm(false);
          fetchBudgetData(); // refrescar después de crear ticket
        }}
      />

      <QuoteForm
        isOpen={showQuoteForm}
        onClose={() => {
          setShowQuoteForm(false);
          fetchBudgetData(); // refrescar después de crear quote
        }}
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
