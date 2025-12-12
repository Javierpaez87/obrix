import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import RequestForm from '../components/BudgetRequests/RequestForm';
import QuoteForm from '../components/BudgetRequests/QuoteForm';
import BudgetReview from '../components/BudgetRequests/BudgetReview';
import { supabase } from '../lib/supabase';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const BudgetRequests: React.FC = () => {
  const { budgetRequests, budgets, projects, user, refreshBudgetRequests, deletedRequests, restoreRequest } = useApp() as any;
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showBudgetReview, setShowBudgetReview] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'quotes' | 'trash'>('requests');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);

  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'counter_offer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'quoted': return 'Cotizado';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'sent': return 'Enviado';
      case 'counter_offer': return 'Contraoferta';
      default: return status;
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

  const handleEditRequest = (request: any) => {
    setEditingRequest(request);
    setShowRequestForm(true);
  };

  const handleCloseRequestForm = () => {
    setShowRequestForm(false);
    setEditingRequest(null);
  };

  const handleDeleteRequest = (requestId: string) => {
    setDeletingRequestId(requestId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingRequestId) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', deletingRequestId);

      if (error) {
        console.error('Error al eliminar ticket:', error);
        alert('Hubo un error al eliminar la solicitud.');
        return;
      }

      await refreshBudgetRequests();
      setShowDeleteConfirm(false);
      setDeletingRequestId(null);
    } catch (err) {
      console.error('Error inesperado:', err);
      alert('Ocurrió un error inesperado.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingRequestId(null);
  };

  const handleRestoreRequest = async (requestId: string) => {
    try {
      await restoreRequest(requestId);
      alert('Solicitud restaurada correctamente.');
    } catch (err) {
      alert('Hubo un error al restaurar la solicitud.');
    }
  };

  const openWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

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
            Mis Solicitudes ({budgetRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quotes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Presupuestos Recibidos ({budgets.length})
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trash'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-1">
              <TrashIcon className="h-4 w-4" />
              Basurero ({deletedRequests?.length || 0})
            </span>
          </button>
        </nav>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {budgetRequests.map((request) => {
            const project = getProject(request.projectId);
            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project?.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{request.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {getPriorityText(request.priority)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Solicitado:</span>
                    <span className="text-gray-900">{request.createdAt.toLocaleDateString('es-AR')}</span>
                  </div>
                  {request.dueDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha límite:</span>
                      <span className="text-gray-900">{request.dueDate.toLocaleDateString('es-AR')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRequest(request)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Ver/Editar
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteRequest(request.id)}
                      className="flex items-center px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Eliminar
                    </button>
                    <button
                      onClick={() => openWhatsApp(
                        isClient ? '+54 9 11 1234-5678' : '+54 9 11 9876-5432',
                        `Hola! Quería conversar sobre la solicitud: ${request.title}`
                      )}
                      className="flex items-center px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {budgetRequests.length === 0 && (
            <div className="col-span-full text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No hay solicitudes</div>
              <p className="text-gray-500">
                {isClient ? 'Crea tu primera solicitud de presupuesto' : 'No hay solicitudes pendientes'}
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
                          <div className="text-sm font-medium text-gray-900">{budget.title}</div>
                          <div className="text-sm text-gray-500">{budget.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{project?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${budget.amount.toLocaleString('es-AR')}
                        </div>
                        {budget.estimatedDays && (
                          <div className="text-xs text-gray-500">
                            {budget.estimatedDays} días
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(budget.status)}`}>
                          {getStatusText(budget.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {budget.requestedAt.toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewBudget(budget)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {budget.status === 'sent' && (
                            <>
                              {isClient && (
                                <>
                                  <button className="text-green-600 hover:text-green-900">
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-900">
                                    <XCircleIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
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
              <p className="text-gray-500">Los presupuestos aparecerán aquí una vez creados</p>
            </div>
          )}
        </div>
      )}

      {/* Trash Tab */}
      {activeTab === 'trash' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {deletedRequests?.map((request: any) => {
            const project = getProject(request.projectId);
            return (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-75">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project?.name}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{request.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {getPriorityText(request.priority)}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Eliminado
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Solicitado:</span>
                    <span className="text-gray-900">{request.createdAt.toLocaleDateString('es-AR')}</span>
                  </div>
                  {request.dueDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fecha límite:</span>
                      <span className="text-gray-900">{request.dueDate.toLocaleDateString('es-AR')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleRestoreRequest(request.id)}
                    className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Restaurar
                  </button>
                </div>
              </div>
            );
          })}

          {(!deletedRequests || deletedRequests.length === 0) && (
            <div className="col-span-full text-center py-12">
              <TrashIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">El basurero está vacío</div>
              <p className="text-gray-500">Las solicitudes eliminadas aparecerán aquí</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RequestForm
        isOpen={showRequestForm}
        onClose={handleCloseRequestForm}
        editingRequest={editingRequest}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={cancelDelete} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Estás seguro que deseas eliminar?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Se notificará a otros usuarios dentro de esta tarea.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetRequests;