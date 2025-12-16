import React, { useEffect, useMemo, useState } from 'react';
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
  ArrowRightIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import RequestForm from '../components/BudgetRequests/RequestForm';
import QuoteForm from '../components/BudgetRequests/QuoteForm';
import BudgetReview from '../components/BudgetRequests/BudgetReview';
import { useNavigate } from 'react-router-dom';

// ✅ Import del cliente Supabase (ajustá si tu ruta es distinta)
import { supabase } from '../lib/supabase';

const NEON = '#00FFA3';

const chipBase = 'inline-flex px-2 py-1 text-xs font-medium rounded-full border';
const cardBase =
  'bg-zinc-900/80 border border-white/10 rounded-xl p-4 sm:p-6 shadow-sm';
const iconPill =
  'p-2 sm:p-3 rounded-full bg-zinc-800 border border-white/10';

const getStatusClasses = (status: string) => {
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
    case 'pending':
      return 'Pendiente';
    case 'quoted':
      return 'Cotizado';
    case 'sent':
      return 'Enviado';
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    case 'counter_offer':
      return 'Contraoferta';
    case 'negotiating':
      return 'Negociando';
    default:
      return status;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'labor':
      return UserIcon;
    case 'materials':
      return BuildingStorefrontIcon;
    case 'combined':
      return WrenchScrewdriverIcon;
    default:
      return DocumentTextIcon;
  }
};

const getTypeText = (type: string) => {
  switch (type) {
    case 'labor':
      return 'Mano de Obra';
    case 'materials':
      return 'Materiales';
    case 'combined':
      return 'M.O. + Materiales';
    default:
      return type;
  }
};

const BudgetManagement: React.FC = () => {
  const { budgetRequests, budgets, projects, user, tasks, setTasks, contacts } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'requests' | 'quotes' | 'sent'>(
    'requests',
  );
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showBudgetReview, setShowBudgetReview] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [requestType, setRequestType] =
    useState<'constructor' | 'supplier'>('constructor');

  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendRequest, setSendRequest] = useState<any>(null);
  const [recipientsSummary, setRecipientsSummary] = useState<Record<string, any>>({});

  // ✅ Mapa id -> name traído desde profiles
  const [profileNameById, setProfileNameById] = useState<Record<string, string>>(
    {},
  );

  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';

  const getProject = (projectId: string) =>
    projects.find((p) => p.id === projectId);

  // ✅ Helper tolerante para obtener el creator id desde el request
  const getCreatorIdFromRequest = (req: any): string | null => {
    return (
      req?.created_by ??
      req?.createdBy ??
      req?.creator_id ??
      req?.creatorId ??
      null
    );
  };

  // ✅ IDs únicos de creadores presentes en budgetRequests
  const creatorIds = useMemo(() => {
    const ids = new Set<string>();
    (budgetRequests as any[]).forEach((r) => {
      const id = getCreatorIdFromRequest(r);
      if (id) ids.add(id);
    });
    return Array.from(ids);
  }, [budgetRequests]);

  // ✅ Traer profiles(name) para esos IDs
  useEffect(() => {
    let isMounted = true;

    const fetchProfiles = async () => {
      try {
        if (!creatorIds.length) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', creatorIds);

        if (error) {
          console.error('Error trayendo profiles:', error.message);
          return;
        }

        const nextMap: Record<string, string> = {};
        (data || []).forEach((p: any) => {
          if (p?.id) nextMap[p.id] = p?.name ?? '';
        });

        if (isMounted) {
          setProfileNameById((prev) => ({ ...prev, ...nextMap }));
        }
      } catch (e) {
        console.error('Error inesperado trayendo profiles:', e);
      }
    };

    fetchProfiles();

    return () => {
      isMounted = false;
    };
  }, [creatorIds]);

  useEffect(() => {
    let isMounted = true;

    const fetchRecipientsSummary = async () => {
      try {
        const ticketIds = budgetRequests.map((r: any) => r.id);
        if (!ticketIds.length) return;

        const { data, error } = await supabase
          .from('ticket_recipients')
          .select('ticket_id, status')
          .in('ticket_id', ticketIds);

        if (error) {
          console.error('Error fetching recipients summary:', error.message);
          return;
        }

        const summary: Record<string, any> = {};
        (data || []).forEach((r: any) => {
          if (!summary[r.ticket_id]) {
            summary[r.ticket_id] = {
              sent: 0,
              accepted: 0,
              rejected: 0,
              in_review: 0,
            };
          }
          if (r.status === 'sent') summary[r.ticket_id].sent++;
          else if (r.status === 'accepted') summary[r.ticket_id].accepted++;
          else if (r.status === 'rejected') summary[r.ticket_id].rejected++;
          else if (r.status === 'in_review') summary[r.ticket_id].in_review++;
        });

        if (isMounted) {
          setRecipientsSummary(summary);
        }
      } catch (e) {
        console.error('Error inesperado fetching recipients summary:', e);
      }
    };

    fetchRecipientsSummary();

    return () => {
      isMounted = false;
    };
  }, [budgetRequests]);

  // ✅ Enriquecer requests con creatorName (sin tocar el contexto)
  const budgetRequestsEnriched = useMemo(() => {
    return (budgetRequests as any[]).map((r) => {
      const creatorId = getCreatorIdFromRequest(r);
      const nameFromProfiles = creatorId ? profileNameById[creatorId] : '';
      return {
        ...r,
        creatorName: r?.creatorName ?? nameFromProfiles ?? r?.creator_name ?? '',
      };
    });
  }, [budgetRequests, profileNameById]);

  const myRequests = budgetRequestsEnriched.filter((req: any) =>
    isClient ? req.requestedBy === user?.id : true,
  );

  const receivedBudgets = budgets.filter((budget) =>
    isClient ? budget.requestedBy === user?.id : budget.requestedBy !== user?.id,
  );

  const sentBudgets = budgets.filter((budget) =>
    isConstructor
      ? budget.requestedBy !== user?.id
      : budget.requestedBy === user?.id,
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
      materialRequests: [],
    };

    setTasks([...tasks, newTask]);
    navigate('/projects');
  };

  const openWhatsApp = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      '_blank',
    );
  };

  const getContactPhone = (contactType: 'constructor' | 'client' | 'supplier') => {
    switch (contactType) {
      case 'constructor':
        return '+54 9 11 1234-5678';
      case 'client':
        return '+54 9 11 9876-5432';
      case 'supplier':
        return '+54 9 11 2345-6789';
      default:
        return '+54 9 11 1234-5678';
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

  const handleViewRequest = (requestId: string) => {
    const request = myRequests.find((r: any) => r.id === requestId);
    if (request) {
      setEditingRequest(request);
      setShowRequestForm(true);
    } else {
      console.error('Request not found:', requestId);
    }
  };

  const handleDeleteRequest = (requestId: string) => {
    console.log('Eliminar (futuro: basurero) solicitud con id:', requestId);
  };

  const handleNewRequest = (type: 'constructor' | 'supplier') => {
    setEditingRequest(null);
    setRequestType(type);
    setShowRequestForm(true);
  };

  const handleSendRequest = (request: any) => {
    setSendRequest(request);
    setShowSendModal(true);
  };

  const sendWhatsAppToContact = async (contact: any) => {
    if (!user?.id || !sendRequest) return;

    try {
      const phone = contact.phone?.replace(/\D/g, '') || '';
      const email = contact.email || '';

      const { error } = await supabase
        .from('ticket_recipients')
        .insert({
          ticket_id: sendRequest.id,
          ticket_creator_id: user.id,
          recipient_phone: phone || null,
          recipient_email: email || null,
          status: 'sent',
        });

      if (error) {
        console.error('Error creating recipient:', error);
        alert('Error al registrar el envío');
        return;
      }

      const origin = window.location.origin;
      const ticketLink = `${origin}/tickets/${sendRequest.id}`;
      const message = `Hola! Te comparto una solicitud de presupuesto desde Obrix:\n\nTítulo: ${sendRequest.title}\nDescripción: ${sendRequest.description}\n\nVer detalle: ${ticketLink}`;

      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        '_blank',
      );

      setShowSendModal(false);
      setSendRequest(null);
    } catch (err) {
      console.error('Error sending WhatsApp:', err);
      alert('Error al enviar por WhatsApp');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-black/0 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Gestión de Presupuestos
          </h1>
          <p className="text-sm text-white/70 mt-1">
            {isClient
              ? 'Solicita y gestiona tus presupuestos'
              : 'Gestiona solicitudes y envía presupuestos'}
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
              <p className="text-xs sm:text-sm font-medium text-white/70">
                Pendientes
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {myRequests.filter((r: any) => r.status === 'pending').length}
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
              <p className="text-xs sm:text-sm font-medium text-white/70">
                Cotizados
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {receivedBudgets.filter((b) => b.status === 'sent').length}
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
              <p className="text-xs sm:text-sm font-medium text-white/70">
                Aprobados
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {receivedBudgets.filter((b) => b.status === 'approved').length}
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
              <p className="text-xs sm:text-sm font-medium text-white/70">
                Total
              </p>
              <p
                className="text-lg sm:text-2xl font-bold text-[--neon]"
                style={{ ['--neon' as any]: NEON }}
              >
                $
                {receivedBudgets
                  .filter((b) => b.status === 'approved')
                  .reduce((sum, b) => sum + b.amount, 0)
                  .toLocaleString('es-AR')}
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
              ${
                activeTab === 'requests'
                  ? 'border-[--neon] text-[--neon]'
                  : 'border-transparent text-white/60 hover:text-white/90 hover:border-white/20'
              }`}
            style={{ ['--neon' as any]: NEON }}
          >
            {isClient ? 'Mis Solicitudes' : 'Solicitudes Recibidas'} (
            {myRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition
              ${
                activeTab === 'quotes'
                  ? 'border-[--neon] text-[--neon]'
                  : 'border-transparent text-white/60 hover:text-white/90 hover:border-white/20'
              }`}
            style={{ ['--neon' as any]: NEON }}
          >
            {isClient ? 'Presupuestos Recibidos' : 'Presupuestos Enviados'} (
            {receivedBudgets.length})
          </button>
        </nav>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {myRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {myRequests.map((request: any) => {
                const project = getProject(request.projectId);

                // ✅ Fallback final: si no vino creatorName, lo buscamos por created_by en profileNameById
                const creatorId = getCreatorIdFromRequest(request);
                const creatorName =
                  request.creatorName ||
                  (creatorId ? profileNameById[creatorId] : '') ||
                  '—';

                return (
                  <div key={request.id} className={cardBase}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3
                          className="text-base sm:text-lg font-semibold text-white mb-1 cursor-pointer hover:text-[--neon] transition-colors"
                          onClick={() => navigate(`/tickets/${request.id}`)}
                          style={{ ['--neon' as any]: NEON }}
                        >
                          {request.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/70 mb-2">
                          {project?.name}
                        </p>

                        <p className="text-xs sm:text-sm text-white/50 mb-2">
                          Creado por{' '}
                          <span className="text-white/80 font-medium">
                            {creatorName}
                          </span>
                        </p>

                        <p className="text-xs sm:text-sm text-white/60 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                      <span className={getStatusClasses(request.status)}>
                        {getStatusText(request.status)}
                      </span>
                    </div>

                    {recipientsSummary[request.id] && (
                      <div className="mb-3 p-3 bg-zinc-800/50 rounded-lg border border-white/10">
                        <p className="text-xs font-medium text-white/70 mb-2">
                          Estado de respuestas:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recipientsSummary[request.id].sent > 0 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-zinc-700 text-white/80 rounded">
                              Enviado sin respuesta: {recipientsSummary[request.id].sent}
                            </span>
                          )}
                          {recipientsSummary[request.id].accepted > 0 && (
                            <span
                              className="inline-flex items-center px-2 py-1 text-xs rounded"
                              style={{
                                backgroundColor: `${NEON}20`,
                                color: NEON,
                              }}
                            >
                              Aceptado: {recipientsSummary[request.id].accepted}
                            </span>
                          )}
                          {recipientsSummary[request.id].rejected > 0 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded">
                              Rechazado: {recipientsSummary[request.id].rejected}
                            </span>
                          )}
                          {recipientsSummary[request.id].in_review > 0 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded">
                              En revisión: {recipientsSummary[request.id].in_review}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/70">Solicitado:</span>
                        <span className="text-white">
                          {request.createdAt?.toLocaleDateString
                            ? request.createdAt.toLocaleDateString('es-AR')
                            : new Date(request.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      {request.dueDate && (
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-white/70">Fecha límite:</span>
                          <span className="text-white">
                            {request.dueDate?.toLocaleDateString
                              ? request.dueDate.toLocaleDateString('es-AR')
                              : new Date(request.dueDate).toLocaleDateString('es-AR')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-white/10">
                      <div className="flex gap-2">
                        {/* Ver / editar */}
                        <button
                          onClick={() => handleViewRequest(request.id)}
                          className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm
                                           bg-zinc-800 border border-white/10 text-white/90 rounded-md
                                           hover:bg-zinc-700 transition-colors flex-1 sm:flex-none"
                        >
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Ver / editar</span>
                          <span className="sm:hidden">Ver</span>
                        </button>

                        {/* Cotizar (solo constructor, estado pendiente) */}
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

                        {/* Eliminar (de momento solo UI + console.log) */}
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm
                                     bg-zinc-800 border border-red-500/50 text-red-400 rounded-md
                                     hover:bg-zinc-800/80 transition-colors flex-1 sm:flex-none"
                        >
                          <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Eliminar</span>
                          <span className="sm:hidden">🗑</span>
                        </button>
                      </div>

                      {/* Enviar */}
                      {isClient && (
                        <button
                          onClick={() => handleSendRequest(request)}
                          className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm
                                     bg-zinc-800 border border-white/10 text-white/90 rounded-md
                                     hover:bg-zinc-700 transition-colors"
                        >
                          <ChatBubbleLeftRightIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Enviar</span>
                          <span className="sm:hidden">💬</span>
                        </button>
                      )}
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

                          <p className="text-xs sm:text-sm text-white/60 mb-3">
                            {budget.description}
                          </p>

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
                              `Hola! Quería conversar sobre el presupuesto: ${
                                budget.title
                              } por $${budget.amount.toLocaleString('es-AR')}`,
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
                {isClient
                  ? 'Los presupuestos que recibas aparecerán aquí'
                  : 'Los presupuestos que envíes aparecerán aquí'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <RequestForm
        key={editingRequest?.id || 'new'}
        isOpen={showRequestForm}
        onClose={() => {
          setShowRequestForm(false);
          setEditingRequest(null);
        }}
        requestType={requestType}
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

      {showSendModal && sendRequest && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowSendModal(false)}
          />

          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Seleccionar Destinatario
                </h3>
                <p className="text-sm text-white/70 mt-1">
                  Elegí un contacto para enviar esta solicitud por WhatsApp
                </p>
              </div>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-5">
              {contacts && contacts.length > 0 ? (
                <div className="space-y-3">
                  {contacts
                    .filter((c: any) => c.category === 'labor')
                    .map((contact: any) => (
                      <div
                        key={contact.id}
                        onClick={() => sendWhatsAppToContact(contact)}
                        className="p-4 bg-zinc-800/50 border border-white/10 rounded-lg cursor-pointer hover:border-[--neon]/50 hover:bg-zinc-800/70 transition-all"
                        style={{ ['--neon' as any]: NEON }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">
                              {contact.name}
                            </h4>
                            {contact.company && (
                              <p className="text-sm text-white/70">
                                {contact.company}
                              </p>
                            )}
                            <p className="text-sm text-white/60 mt-1">
                              {contact.phone}
                            </p>
                            {contact.subcategory && (
                              <span
                                className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium text-black"
                                style={{ backgroundColor: NEON }}
                              >
                                {contact.subcategory}
                              </span>
                            )}
                          </div>
                          <ArrowRightIcon className="h-5 w-5 text-white/50 ml-3" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/60">No hay contactos disponibles</p>
                  <p className="text-sm text-white/50 mt-2">
                    Agregá contactos en la sección Agenda
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 border border-white/10 text-white hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;
