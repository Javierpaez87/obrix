import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Budget, Task } from '../types';
import {
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
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

const NEON = '#00FFA3';

const chipBase = 'inline-flex px-2 py-1 text-xs font-medium rounded-full border';
const cardBase = 'bg-zinc-900/80 border border-white/10 rounded-xl p-4 sm:p-6 shadow-sm';
const iconPill = 'p-2 sm:p-3 rounded-full bg-zinc-800 border border-white/10';

const getStatusClasses = (status: string) => {
  // Un solo esquema cromático; usamos grises y acento neón SOLO para "approved".
  switch (status) {
    case 'approved':
      return `${chipBase} text-[${NEON}] border-[${NEON}] bg-zinc-900/60`;
    case 'pending':
      return `${chipBase} text-white/80 border-white/20 bg-zinc-800`;
    case 'quoted':
    case 'sent':
      return `${chipBase} text-white/80 border-white/20 bg-zinc-800`;
    case 'rejected':
      return `${chipBase} text-white/70 border-white/20 bg-zinc-800 line-through`;
    case 'counter_offer':
    case 'negotiating':
      return `${chipBase} text-white/80 border-white/20 bg-zinc-800`;
    default:
      return `${chipBase} text-white/75 border-white/20 bg-zinc-800`;
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

const BudgetManagement: React.FC = () => {
  const { budgetRequests, budgets, projects, user, tasks, setTasks } = useApp();
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
      assignedTo: isClient ? '1' : budget.requestedBy,
      createdAt: new Date(),
      paymentPlan: budget.paymentPlan,
      materialRequests: []
    };

    setTasks([...tasks, newTask]);
    navigate('/projects');
  };

  const getProject = (projectId: string) => projects.find(p => p.id === projectId);

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
    <div className="space-y-4 sm:space-y-6 bg-black/0 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestión de Presupuestos</h1>
          <p className="text-sm text-white/70 mt-1">
            {isClient ? 'Solicita y gestiona tus presupuestos' : 'Gestiona solicitudes y envía presupuestos'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => handleNewRequest('constructor')}
            className="flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg text-black font-medium text-sm
                       bg-[--neon] hover:opacity-90 transition
                       ring-1 ring-[--neon]/30 shadow-[0_0_15px_rgba(0,255,163,0.35)]"
            style={{ ['--neon' as any]: NEON }}
          >
            <PlusIcon className="h-4 w-4 mr-1 sm:mr-2 stroke-black" />
            <span className="hidden sm:inline">Solicitar a Constructor</span>
            <span className="sm:hidden">Constructor</span>
          </button>

          <button
            onClick={() => handleNewRequest('supplier')}
            className="flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg text-[--neon] text-sm
                       border border-[--neon]/60 hover:bg-[--neon]/10 transition"
            style={{ ['--neon' as any]: NEON }}
          >
            <PlusIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Solicitar Materiales</span>
            <span className="sm:hidden">Materiales</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className={cardBase}>
          <div className="flex items-center">
            <div className={iconPill}>
              <ClockIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/80" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-white/70">Pendientes</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {myRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className={cardBase}>
          <div className="flex items-center">
            <div className={iconPill}>
              <DocumentTextIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/80" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-white/70">Cotizados</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {receivedBudgets.filter(b => b.status === 'sent').length}
              </p>
            </div>
          </div>
        </div>

        <div className={cardBase}>
          <div className="flex items-center">
            <div className={iconPill}>
              <CheckCircleIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/80" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-white/70">Aprobados</p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {receivedBudgets.filter(b => b.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className={cardBase}>
          <div className="flex items-center">
            <div className={iconPill}>
              <CurrencyDollarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/80" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-white/70">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-[--neon]" style={{ ['--neon' as any]: NEON }}>
                ${receivedBudgets.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.amount, 0).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition
              ${activeTab === 'requests'
                ? 'border-[--neon] text-[--neon]'
                : 'border-transparent text-white/60 hover:text-white/90 hover:border-white/20'
              }`}
            style={{ ['--neon' as any]: NEON }}
          >
            {isClient ? 'Mis Solicitudes' : 'Solicitudes Recibidas'} ({myRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition
              ${activeTab === 'quotes'
                ? 'border-[--neon] text-[--neon]'
                : 'border-transparent text-white/60 hover:text-white/90 hover:border-white/20'
              }`}
            style={{ ['--neon' as any]: NEON }}
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
                  <div key={request.id} className={cardBase}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{request.title}</h3>
                        <p className="text-xs sm:text-sm text-white/70 mb-2">{project?.name}</p>
                        <p className="text-xs sm:text-sm text-white/60 line-clamp-2">{request.description}</p>
                      </div>
                      <span className={getStatusClasses(request.status)}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/70">Solicitado:</span>
                        <span className="text-white">{request.createdAt.toLocaleDateString('es-AR')}</span>
                      </div>
                      {request.dueDate && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-white/70">Fecha límite:</span>
                          <span className="text-white">{request.dueDate.toLocaleDateString('es-AR')}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-white/10">
                      <div className="flex gap-2">
                        <button className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm
                                           bg-zinc-800 border border-white/10 text-white/90 rounded-md
                                           hover:bg-zinc-700 transition-colors flex-1 sm:flex-none">
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Ver</span>
                        </button>

                        {isConstructor && request.status === 'pending' && (
                          <button
                            onClick={() => handleCreateQuote(request.id)}
                            className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm
                                       text-[--neon] border border-[--neon]/60 rounded-md
                                       hover:bg-[--neon]/10 transition-colors flex-1 sm:flex-none"
                            style={{ ['--neon' as any]: NEON }}
                          >
                            <DocumentTextIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            <span className="hidden sm:inline">Cotizar</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          openWhatsApp(
                            getContactPhone(isClient ? 'constructor' : 'client'),
                            `Hola! Quería conversar sobre la solicitud: ${request.title}`
                          )
                        }
                        className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm
                                   bg-zinc-800 border border-white/10 text-white/90 rounded-md
                                   hover:bg-zinc-700 transition-colors"
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
              <ClockIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <div className="text-white/60 text-lg mb-2">No hay solicitudes</div>
              <p className="text-white/50">
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
                  <div key={budget.id} className={cardBase}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={iconPill}>
                          <TypeIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/85" />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                              {budget.title}
                            </h3>
                            <div className="flex gap-2">
                              <span className={`${chipBase} text-white/80 border-white/20 bg-zinc-800`}>
                                {getTypeText(budget.type)}
                              </span>
                              <span className={getStatusClasses(budget.status)}>
                                {getStatusText(budget.status)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                            <div>
                              <p className="text-white/70">Obra:</p>
                              <p className="font-medium text-white">{project?.name}</p>
                            </div>
                            <div>
                              <p className="text-white/70">Monto:</p>
                              <p className="font-medium text-white text-base sm:text-lg">
                                ${budget.amount.toLocaleString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-white/70">Duración:</p>
                              <p className="font-medium text-white">
                                {budget.estimatedDays ? `${budget.estimatedDays} días` : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-white/60 mb-3">{budget.description}</p>

                          <div className="text-xs text-white/60">
                            Enviado el {budget.requestedAt.toLocaleDateString('es-AR')}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:ml-4">
                        <button
                          onClick={() => handleViewBudget(budget)}
                          className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm
                                     bg-zinc-800 border border-white/10 text-white/90 rounded-md
                                     hover:bg-zinc-700 transition-colors"
                        >
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Ver Detalle</span>
                          <span className="sm:hidden">Ver</span>
                        </button>

                        {budget.status === 'approved' && (
                          <button
                            onClick={() => createTaskFromBudget(budget)}
                            className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm
                                       text-black bg-[--neon] rounded-md hover:opacity-90 transition
                                       ring-1 ring-[--neon]/30 shadow-[0_0_15px_rgba(0,255,163,0.35)]"
                            style={{ ['--neon' as any]: NEON }}
                          >
                            <ArrowRightIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 stroke-black" />
                            <span className="hidden sm:inline">Ir a Tarea</span>
                            <span className="sm:hidden">Tarea</span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            openWhatsApp(
                              getContactPhone(isClient ? 'constructor' : 'client'),
                              `Hola! Quería conversar sobre el presupuesto: ${budget.title} por $${budget.amount.toLocaleString('es-AR')}`
                            )
                          }
                          className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm
                                     text-[--neon] border border-[--neon]/60 rounded-md
                                     hover:bg-[--neon]/10 transition"
                          style={{ ['--neon' as any]: NEON }}
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
              <DocumentTextIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <div className="text-white/60 text-lg mb-2">No hay presupuestos</div>
              <p className="text-white/50">
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
