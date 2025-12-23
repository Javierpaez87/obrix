import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  XMarkIcon,
} from '@heroicons/react/24/outline';
import RequestForm from '../components/BudgetRequests/RequestForm';
import QuoteForm from '../components/BudgetRequests/QuoteForm';
import BudgetReview from '../components/BudgetRequests/BudgetReview';
import { useNavigate, useLocation } from 'react-router-dom';

// ✅ Import del cliente Supabase (ajustá si tu ruta es distinta)
import { supabase } from '../lib/supabase';

const NEON = '#00FFA3';

type ReceivedRequestRow = {
  id: string;
  status: string;
  accepted_at?: string | null;
  rejected_at?: string | null;
  offer_amount?: number | null;
  offer_message?: string | null;
  offer_estimated_days?: number | null;
  ticket: {
    id: string;
    title: string;
    description: string;
    type?: string | null;
    priority?: string | null;
    created_at: string;
    created_by?: string | null;
    deleted_at?: string | null;
  } | null;
};

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
  const { budgetRequests, budgets, projects, user, tasks, setTasks, contacts, deletedRequests, refreshBudgetRequests } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'requests' | 'quotes' | 'sent' | 'received' | 'deleted'>(
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

  const [receivedRequests, setReceivedRequests] = useState<ReceivedRequestRow[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(false);

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

  // ✅ IDs únicos de creadores presentes en receivedRequests
const receivedCreatorIds = useMemo(() => {
  const ids = new Set<string>();
  receivedRequests.forEach((row) => {
    const id = row.ticket?.created_by || null;
    if (id) ids.add(id);
  });
  return Array.from(ids);
}, [receivedRequests]);

  // ✅ Traer profiles(name) para esos IDs
  useEffect(() => {
    let isMounted = true;

    const fetchProfiles = async () => {
      try {
        const allCreatorIds = Array.from(
  new Set([...creatorIds, ...receivedCreatorIds])
);
if (!allCreatorIds.length) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', allCreatorIds);

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

  useEffect(() => {
    const fetchReceivedRequests = async () => {
      if (!user?.id) return;

      try {
        setReceivedLoading(true);

        const { data, error } = await supabase
          .from('ticket_recipients')
          .select(`
            id,
            status,
            accepted_at,
            rejected_at,
            offer_amount,
            offer_message,
            offer_estimated_days,
            ticket:ticket_id (
              id,
              title,
              description,
              type,
              priority,
              created_at,
              created_by,
              deleted_at
            )
          `)
          .eq('recipient_profile_id', user.id)
          .is('ticket.deleted_at', null)
          .order('id', { ascending: false });

        if (error) {
          console.error('[BudgetManagement] Error fetching received requests:', error);
          return;
        }

        const cleaned = (data || []).filter((row: any) => row.ticket);
        setReceivedRequests(cleaned as any);

        console.log('[BudgetManagement] Received requests:', cleaned);
      } catch (err) {
        console.error('[BudgetManagement] Unexpected error fetching received requests:', err);
      } finally {
        setReceivedLoading(false);
      }
    };

    fetchReceivedRequests();
  }, [user?.id]);

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

  const handleDeleteRequest = async (requestId: string) => {
    console.log('[BudgetManagement] Soft delete ticket:', requestId);

    const { data, error } = await supabase
      .from('tickets') // 👈 tu tabla real
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select();

    console.log('[SoftDelete] data:', data);
    console.log('[SoftDelete] error:', error);

    if (error) {
      alert('No se pudo eliminar la solicitud');
      return;
    }

    // 🔁 refrescar listas
    await refreshBudgetRequests();
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

      const recipientProfileId = contact.id || null;

      const { data: existingRecipient } = await supabase
        .from('ticket_recipients')
        .select('id')
        .eq('ticket_id', sendRequest.id)
        .eq('recipient_profile_id', recipientProfileId)
        .maybeSingle();

      if (!existingRecipient) {
        const { error } = await supabase
          .from('ticket_recipients')
          .insert({
            ticket_id: sendRequest.id,
            ticket_creator_id: user.id,
            recipient_profile_id: recipientProfileId,
            recipient_phone: phone || null,
            recipient_email: email || null,
            status: 'sent',
          });

        if (error) {
          console.error('Error creating recipient:', error);
          alert('Error al registrar el envío');
          return;
        }
      } else {
        console.log('Recipient already exists, reusing:', existingRecipient);
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

  // ✅ NUEVO: wiring de deep-links desde TicketDetail
  // /budget-management?tab=deleted
  // /budget-management?edit=<ticketId>
  // /budget-management?edit=<ticketId>&send=1
  const lastHandledKeyRef = useRef<string>('');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = (params.get('tab') || '').toLowerCase();
    const editId = params.get('edit') || '';
    const send = params.get('send') || '';

    const key = `${tab}|${editId}|${send}|${myRequests.length}|${deletedRequests.length}`;
    if (lastHandledKeyRef.current === key) return;

    // tab
    if (tab === 'deleted') {
      setActiveTab('deleted');
    } else if (tab === 'received') {
      setActiveTab('received');
    } else if (tab === 'quotes') {
      setActiveTab('quotes');
    } else if (tab === 'requests') {
      setActiveTab('requests');
    }

    // edit + send
    if (editId) {
      // si todavía no llegó myRequests, esperamos al próximo render
      const req = myRequests.find((r: any) => String(r.id) === String(editId));
      if (req) {
        // requestType coherente con el tipo
        const inferredType: 'constructor' | 'supplier' =
          req?.type === 'materials' ? 'supplier' : 'constructor';

        setRequestType(inferredType);
        setEditingRequest(req);

        // si send=1, abrimos modal de envío (y NO forzamos abrir RequestForm)
        if (send === '1' || send === 'true') {
          setSendRequest(req);
          setShowSendModal(true);
          setShowRequestForm(false);
        } else {
          setShowRequestForm(true);
        }

        // si venimos a editar, tiene sentido mostrar la tab requests
        setActiveTab('requests');

        lastHandledKeyRef.current = key;
        return;
      }
    }

    lastHandledKeyRef.current = key;
  }, [location.search, myRequests, deletedRequests.length]);

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
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('requests')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('requests');
            }
          }}
          className={`${cardBase} cursor-pointer transition-all hover:brightness-110 ${
            activeTab === 'requests'
              ? 'border-[--neon] shadow-[0_0_20px_rgba(0,255,163,0.3)]'
              : 'hover:border-white/20'
          }`}
          style={{ ['--neon' as any]: NEON }}
        >
          <div className="flex items-center">
            <div className={iconPill}>
              <DocumentTextIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/80" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-white/70">
                {isClient ? 'Mis Solicitudes' : 'Solicitudes Recibidas'}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {myRequests.length}
              </p>
            </div>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('quotes')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('quotes');
            }
          }}
          className={`${cardBase} cursor-pointer transition-all hover:brightness-110 ${
            activeTab === 'quotes'
              ? 'border-[--neon] shadow-[0_0_20px_rgba(0,255,163,0.3)]'
              : 'hover:border-white/20'
          }`}
          style={{ ['--neon' as any]: NEON }}
        >
          <div className="flex items-center">
            <div className={iconPill}>
              <CurrencyDollarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/80" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-white/70">
                {isClient ? 'Presupuestos Recibidos' : 'Presupuestos Enviados'}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {receivedBudgets.length}
              </p>
            </div>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('received')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('received');
            }
          }}
          className={`${cardBase} cursor-pointer transition-all hover:brightness-110 ${
            activeTab === 'received'
              ? 'border-[--neon] shadow-[0_0_20px_rgba(0,255,163,0.3)]'
              : 'hover:border-white/20'
          }`}
          style={{ ['--neon' as any]: NEON }}
        >
          <div className="flex items-center">
            <div className={iconPill}>
              <ChatBubbleLeftRightIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/80" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-white/70">
                Solicitudes recibidas
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {receivedRequests.length}
              </p>
            </div>
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveTab('deleted')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveTab('deleted');
            }
          }}
          className={`${cardBase} cursor-pointer transition-all hover:brightness-110 ${
            activeTab === 'deleted'
              ? 'border-[--neon] shadow-[0_0_20px_rgba(0,255,163,0.3)]'
              : 'hover:border-white/20'
          }`}
          style={{ ['--neon' as any]: NEON }}
        >
          <div className="flex items-center">
            <div className={iconPill}>
              <TrashIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white/80" />
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-white/70">
                Eliminados
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white">
                {deletedRequests.length}
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

          <button
            onClick={() => setActiveTab('received')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition
              ${
                activeTab === 'received'
                  ? 'border-[--neon] text-[--neon]'
                  : 'border-transparent text-white/60 hover:text-white/90 hover:border-white/20'
              }`}
            style={{ ['--neon' as any]: NEON }}
          >
            Solicitudes recibidas ({receivedRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('deleted')}
            className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition
              ${
                activeTab === 'deleted'
                  ? 'border-[--neon] text-[--neon]'
                  : 'border-transparent text-white/60 hover:text-white/90 hover:border-white/20'
              }`}
            style={{ ['--neon' as any]: NEON }}
          >
            Eliminados ({deletedRequests.length})
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
                  <div
                    key={request.id}
                    className={`${cardBase} cursor-pointer transition-all hover:border-[--neon]/60 hover:shadow-[0_0_25px_rgba(0,255,163,0.25)] active:scale-[0.99]`}
                    style={{
                      ['--neon' as any]: NEON,
                      borderColor: `${NEON}30`,
                      boxShadow: `0 0 20px rgba(0,255,163,0.15)`
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/tickets/${request.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/tickets/${request.id}`);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
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

                    <div className="flex justify-end">
                      <span
                        className="text-[10px] text-white/30"
                        title={request.id}
                      >
                        ID: {request.id.substring(0, 8)}
                      </span>
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

      {/* Received Requests Tab */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedRequests.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <div className="text-white/60 text-lg mb-2">No tenés solicitudes recibidas</div>
              <p className="text-white/50">
                Cuando otros usuarios te envíen solicitudes de presupuesto, aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {receivedRequests.map((row) => (
                <div key={row.id} className={cardBase}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                        {row.ticket?.title || 'Solicitud'}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 mb-2">
                        {row.ticket?.description || ''}
                      </p>
                    </div>
                    <span className={getStatusClasses(row.status)}>
                      {getStatusText(row.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-white/70">Estado:</span>
                      <span className="text-white font-medium">{row.status}</span>
                    </div>
                    {row.offer_amount != null && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/70">Monto ofertado:</span>
                        <span className="text-white font-medium">
                          ${row.offer_amount.toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}
                    {row.offer_estimated_days != null && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/70">Días estimados:</span>
                        <span className="text-white font-medium">
                          {row.offer_estimated_days} días
                        </span>
                      </div>
                    )}
                    {row.accepted_at && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/70">Aceptado:</span>
                        <span className="text-white">
                          {new Date(row.accepted_at).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    )}
                    {row.rejected_at && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-white/70">Rechazado:</span>
                        <span className="text-white">
                          {new Date(row.rejected_at).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-3 border-t border-white/10">
                    <button
                      onClick={() => navigate(`/tickets/${row.ticket?.id}`)}
                      className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm
                                 bg-zinc-800 border border-white/10 text-white/90 rounded-md
                                 hover:bg-zinc-700 transition-colors"
                    >
                      <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deleted Requests Tab */}
      {activeTab === 'deleted' && (
        <div className="space-y-4">
          {deletedRequests.length === 0 ? (
            <div className="text-center py-12">
              <TrashIcon className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <div className="text-white/60 text-lg mb-2">No hay solicitudes eliminadas</div>
              <p className="text-white/50">
                Las solicitudes que elimines aparecerán aquí temporalmente
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {deletedRequests.map((req) => (
                <div key={req.id} className={`${cardBase} opacity-70`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                        {req.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/70 mb-2">
                        {req.description}
                      </p>
                    </div>
                    <span className={`${chipBase} text-red-400 border-red-500/50 bg-red-900/30`}>
                      Eliminado
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-white/70">Creado:</span>
                      <span className="text-white">
                        {req.createdAt?.toLocaleDateString
                          ? req.createdAt.toLocaleDateString('es-AR')
                          : new Date(req.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-white/10">
                    <button
                      onClick={() => navigate(`/tickets/${req.id}`)}
                      className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm
                                 bg-zinc-800 border border-white/10 text-white/60 rounded-md
                                 hover:bg-zinc-700 transition-colors"
                    >
                      <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Ver detalle
                    </button>
                  </div>
                </div>
              ))}
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
