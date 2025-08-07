import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Budget, BudgetRequest, Task } from '../types';
import { 
  PlusIcon, 
  EyeIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import RequestForm from '../components/BudgetRequests/RequestForm';
import QuoteForm from '../components/BudgetRequests/QuoteForm';
import BudgetReview from '../components/BudgetRequests/BudgetReview';
import { useNavigate } from 'react-router-dom';

const BudgetManagement: React.FC = () => {
  const { budgetRequests, budgets, projects, user, contacts, tasks, setTasks } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'quotes' | 'sent'>('requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showBudgetReview, setShowBudgetReview] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [requestType, setRequestType] = useState<'constructor' | 'supplier'>('constructor');

  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';

  // Filtrar datos según el rol del usuario
  const myRequests = budgetRequests.filter(req => 
    isClient ? req.requestedBy === user?.id : true
  );

  const receivedBudgets = budgets.filter(budget => 
    isClient ? budget.requestedBy === user?.id : budget.requestedBy !== user?.id
  );

  const sentBudgets = budgets.filter(budget => 
    isConstructor ? budget.requestedBy !== user?.id : budget.requestedBy === user?.id
  );

  const createTaskFromBudget = (budget: Budget) => {
    const project = getProject(budget.projectId);
    if (!project) return;

    const newTask: Task = {
      id: Date.now().toString(),
      projectId: budget.projectId,
      budgetId: budget.id,
      title: budget.title,
      description: budget.description,
      status: 'pending',
      priority: 'medium',
      requestedBy: budget.requestedBy,
      assignedTo: isClient ? '1' : budget.requestedBy, // Asignar al constructor
      createdAt: new Date(),
      paymentPlan: budget.paymentPlan,
      materialRequests: []
    };

    setTasks([...tasks, newTask]);
    navigate('/projects');
  };
  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'quoted': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'counter_offer': return 'bg-purple-100 text-purple-800';
      case 'negotiating': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'quoted': return 'Cotizado';
      case 'sent': return 'Enviado';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'counter_offer': return 'Contraoferta';
      case 'negotiating': return 'Negociando';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'labor': return UserIcon;
      case 'materials': return BuildingStorefrontIcon;
      case 'combined': return WrenchScrewdriverIcon;
      default: return DocumentTextIcon;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'labor': return 'Mano de Obra';
      case 'materials': return 'Materiales';
      case 'combined': return 'M.O. + Materiales';
      default: return type;
    }
  };

  const openWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getContactPhone = (contactType: 'constructor' | 'client' | 'supplier') => {
    switch (contactType) {
      case 'constructor': return '+54 9 11 1234-5678';
      case 'client': return '+54 9 11 9876-5432';
      case 'supplier': return '+54 9 11 2345-6789';
      default: return '+54 9 11 1234-5678';
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

  const handleNewRequest = (type: 'constructor' | 'supplier') => {
    setRequestType(type);
    setShowRequestForm(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Presupuestos</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isClient ? 'Solicita y gestiona tus presupuestos' : 'Gestiona solicitudes y envía presupuestos'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => handleNewRequest('constructor')}
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Solicitar a Constructor</span>
            <span className="sm:hidden">Constructor</span>
          </button>
          
          <button 
            onClick={() => handleNewRequest('supplier')}
            className="flex items-center justify-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Solicitar Materiales</span>
            <span className="sm:hidden">Materiales</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-50 text-yellow-600">
              <ClockIcon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-yellow-600">Pendientes</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-900">
                {myRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-50 text-blue-600">
              <DocumentTextIcon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-blue-600">Cotizados</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-900">
                {receivedBudgets.filter(b => b.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-50 text-green-600">
              <CheckCircleIcon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-green-600">Aprobados</p>
              <p className="text-lg sm:text-2xl font-bold text-green-900">
                {receivedBudgets.filter(b => b.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-50 text-purple-600">
              <CurrencyDollarIcon className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-purple-600">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-900">
                ${receivedBudgets.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.amount, 0).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'requests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isClient ? 'Mis Solicitudes' : 'Solicitudes Recibidas'} ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {isClient ? 'Presupuestos Recibidos' : 'Presupuestos Enviados'} ({receivedBudgets.length})
          </button>
        </nav>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {myRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {myRequests.map((request) => {
                const project = getProject(request.projectId);
                return (
                  <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{project?.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{request.description}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Solicitado:</span>
                        <span className="text-gray-900">{request.createdAt.toLocaleDateString('es-AR')}</span>
                      </div>
                      {request.dueDate && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Fecha límite:</span>
                          <span className="text-gray-900">{request.dueDate.toLocaleDateString('es-AR')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        <button className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex-1 sm:flex-none">
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Ver</span>
                        </button>
                        {isConstructor && request.status === 'pending' && (
                          <button 
                            onClick={() => handleCreateQuote(request.id)}
                            className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors flex-1 sm:flex-none"
                          >
                            <DocumentTextIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Cotizar</span>
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => openWhatsApp(
                          getContactPhone(isClient ? 'constructor' : 'client'),
                          `Hola! Quería conversar sobre la solicitud: ${request.title}`
                        )}
                        className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                      >
                        <ChatBubbleLeftRightIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">WhatsApp</span>
                        <span className="sm:hidden">💬</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
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
        <div className="space-y-4">
          {receivedBudgets.length > 0 ? (
            <div className="space-y-4">
              {receivedBudgets.map((budget) => {
                const project = getProject(budget.projectId);
                const TypeIcon = getTypeIcon(budget.type);
                
                return (
                  <div key={budget.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 sm:p-3 rounded-full ${
                          budget.type === 'labor' ? 'bg-blue-100 text-blue-600' :
                          budget.type === 'materials' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          <TypeIcon className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              {budget.title}
                            </h3>
                            <div className="flex gap-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                budget.type === 'labor' ? 'bg-blue-100 text-blue-800' :
                                budget.type === 'materials' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {getTypeText(budget.type)}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(budget.status)}`}>
                                {getStatusText(budget.status)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Obra:</p>
                              <p className="font-medium text-gray-900">{project?.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Monto:</p>
                              <p className="font-medium text-gray-900 text-base sm:text-lg">
                                ${budget.amount.toLocaleString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Duración:</p>
                              <p className="font-medium text-gray-900">
                                {budget.estimatedDays ? `${budget.estimatedDays} días` : 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-xs sm:text-sm text-gray-500 mb-3">{budget.description}</p>
                          
                          <div className="text-xs text-gray-500">
                            Enviado el {budget.requestedAt.toLocaleDateString('es-AR')}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
                        <button 
                          onClick={() => handleViewBudget(budget)}
                          className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Ver Detalle</span>
                          <span className="sm:hidden">Ver</span>
                        </button>
                        
                        {budget.status === 'approved' && (
                          <button 
                            onClick={() => createTaskFromBudget(budget)}
                            className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                          >
                            <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Ir a Tarea</span>
                            <span className="sm:hidden">Tarea</span>
                          </button>
                        )}
                        
                        <button 
                          onClick={() => openWhatsApp(
                            getContactPhone(isClient ? 'constructor' : 'client'),
                            `Hola! Quería conversar sobre el presupuesto: ${budget.title} por $${budget.amount.toLocaleString('es-AR')}`
                          )}
                          className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                        >
                          <ChatBubbleLeftRightIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Negociar</span>
                          <span className="sm:hidden">💬</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No hay presupuestos</div>
              <p className="text-gray-500">
                {isClient ? 'Los presupuestos que recibas aparecerán aquí' : 'Los presupuestos que envíes aparecerán aquí'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RequestForm 
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        requestType={requestType}
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

export default BudgetManagement;