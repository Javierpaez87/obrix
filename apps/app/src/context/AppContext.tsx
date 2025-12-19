import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  Project,
  Budget,
  BudgetRequest,
  Task,
  Payment,
  Collection,
  Expense,
  ChangeOrder,
  Contact,
  MaterialRequest,
} from '../types';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, role: 'constructor' | 'client', name?: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
  deleteAccount: () => Promise<any>;
  updateProfile: (updates: Partial<User>) => Promise<any>;

  projects: Project[];
  setProjects: (projects: Project[]) => void;
  budgets: Budget[];
  setBudgets: (budgets: Budget[]) => void;

  budgetRequests: BudgetRequest[];
  setBudgetRequests: (budgetRequests: BudgetRequest[]) => void;

  /** ✅ Refresca activos + eliminados */
  refreshBudgetRequests: () => Promise<void>;

  deletedRequests: BudgetRequest[];
  loadDeletedRequests: () => Promise<void>;
  restoreRequest: (requestId: string) => Promise<void>;

  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
  expenses: Expense[];
  setExpenses: (expenses: Expense[]) => void;
  changeOrders: ChangeOrder[];
  setChangeOrders: (changeOrders: ChangeOrder[]) => void;

  /** ✅ Contacts (privados por usuario) */
  contacts: Contact[];
  contactsLoading: boolean;
  fetchContacts: () => Promise<void>;
  addContact: (payload: Partial<Contact>) => Promise<void>;
  updateContact: (id: string, payload: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  materialRequests: MaterialRequest[];
  setMaterialRequests: (materialRequests: MaterialRequest[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const auth = useAuth();

  // (Opcional) log para ver auth en cada render
  // console.log('[AppContext] render auth:', { id: auth.user?.id, role: auth.user?.role, loading: auth.loading });

  const [projects, setProjects] = useState<Project[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [deletedRequests, setDeletedRequests] = useState<BudgetRequest[]>([]);

  // ✅ Ahora el ticket puede traer el join como ticket.profiles?.name
  const mapTicketToRequest = (ticket: any): BudgetRequest => ({
    id: ticket.id,
    projectId: ticket.project_id || '',
    title: ticket.title,
    description: ticket.description,
    requestedBy: ticket.created_by,

    // ✅ NUEVO: nombre del creador (si viene del join)
    creatorName: ticket?.profiles?.name ?? null,

    priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: ticket.due_date ? new Date(ticket.due_date) : undefined,
    status:
      ticket.status === 'pending'
        ? 'pending'
        : ticket.status === 'quoted'
        ? 'quoted'
        : ticket.status === 'approved'
        ? 'approved'
        : ticket.status === 'rejected'
        ? 'rejected'
        : 'pending',
    createdAt: new Date(ticket.created_at),
    requestType: ticket.creator_role === 'constructor' ? 'supplier' : 'constructor',
    type: ticket.type as 'labor' | 'materials' | 'combined',
  });

  const loadTicketsFromSupabase = async () => {
    try {
      console.log('[AppContext] Loading tickets from Supabase...');

      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          *,
          profiles:created_by (
            name
          )
        `
        )
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AppContext] Error loading tickets:', error);
        return;
      }

      console.log('[AppContext] Loaded tickets:', data?.length || 0, 'tickets');
      if (data) {
        const mappedRequests = data.map(mapTicketToRequest);
        setBudgetRequests(mappedRequests);
      } else {
        setBudgetRequests([]);
      }
    } catch (err) {
      console.error('[AppContext] Unexpected error loading tickets:', err);
    }
  };

  const loadDeletedTickets = async () => {
    try {
      console.log('[AppContext] Loading deleted tickets from Supabase...');

      const { data, error } = await supabase
        .from('tickets')
        .select(
          `
          *,
          profiles:created_by (
            name
          )
        `
        )
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error('[AppContext] Error loading deleted tickets:', error);
        return;
      }

      console.log('[AppContext] Loaded deleted tickets:', data?.length || 0, 'tickets');
      if (data) {
        const mappedRequests = data.map(mapTicketToRequest);
        setDeletedRequests(mappedRequests);
      } else {
        setDeletedRequests([]);
      }
    } catch (err) {
      console.error('[AppContext] Unexpected error loading deleted tickets:', err);
    }
  };

  /** ✅ FIX CLAVE: refresca activos + eliminados */
  const refreshBudgetRequests = async () => {
    await Promise.all([loadTicketsFromSupabase(), loadDeletedTickets()]);
  };

  useEffect(() => {
    if (auth.user?.id) {
      console.log('[AppContext] User authenticated, loading tickets for user:', auth.user.id);
      refreshBudgetRequests();
    } else {
      console.log('[AppContext] No user authenticated, clearing tickets');
      setBudgetRequests([]);
      setDeletedRequests([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id]);

  const restoreTicket = async (requestId: string) => {
    try {
      const { error } = await supabase.from('tickets').update({ deleted_at: null }).eq('id', requestId);

      if (error) {
        console.error('Error restoring ticket:', error);
        throw error;
      }

      await refreshBudgetRequests();
    } catch (err) {
      console.error('Unexpected error restoring ticket:', err);
      throw err;
    }
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);

  // ============================
  // ✅ CONTACTS (Privados por user_id)
  // ============================
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const mapDbContactToContact = (c: any): Contact => ({
    id: c.id,
    name: c.name,
    company: c.company,
    phone: c.phone,
    email: c.email ?? undefined,
    category: c.category,
    subcategory: c.subcategory,
    notes: c.notes ?? undefined,
    rating: c.rating ?? undefined,
    lastContact: c.last_contact ? new Date(c.last_contact) : undefined,
    createdAt: c.created_at ? new Date(c.created_at) : new Date(),
  });

  const fetchContacts = async () => {
    console.log('[Contacts] fetchContacts called. auth.user?.id =', auth.user?.id);

    if (!auth.user?.id) {
      console.warn('[Contacts] fetchContacts: no auth user -> skip');
      return;
    }

    setContactsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false });

      console.log('[Contacts] fetchContacts result:', { count: data?.length ?? 0, error });

      if (error) throw error;

      setContacts((data ?? []).map(mapDbContactToContact));
    } catch (e) {
      console.error('[Contacts] Error fetching contacts:', e);
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const addContact = async (payload: Partial<Contact>) => {
    console.log('[Contacts] addContact called. auth.user?.id =', auth.user?.id, 'payload:', payload);

    if (!auth.user?.id) throw new Error('No authenticated user');

    // 🔎 Verifica que el usuario de Supabase Auth existe (para RLS)
    // (Si esto da null pero auth.user.id existe, tu login NO es Supabase Auth)
    try {
      const { data: authData } = await supabase.auth.getUser();
      console.log('[Contacts] supabase.auth.getUser():', authData?.user?.id);
    } catch (e) {
      console.warn('[Contacts] supabase.auth.getUser() failed:', e);
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        user_id: auth.user.id,
        name: payload.name,
        company: payload.company,
        phone: payload.phone,
        email: payload.email ?? null,
        category: payload.category,
        subcategory: payload.subcategory,
        notes: payload.notes ?? null,
        rating: payload.rating ?? null,
        last_contact: null,
      })
      .select('*')
      .single();

    console.log('[Contacts] addContact result:', { data, error });

    if (error) throw error;

    const mapped = mapDbContactToContact(data);
    setContacts(prev => [mapped, ...prev]);
  };

  const updateContact = async (id: string, payload: Partial<Contact>) => {
    console.log('[Contacts] updateContact called:', { id, payload });

    const { data, error } = await supabase
      .from('contacts')
      .update({
        name: payload.name,
        company: payload.company,
        phone: payload.phone,
        email: payload.email ?? null,
        category: payload.category,
        subcategory: payload.subcategory,
        notes: payload.notes ?? null,
        rating: payload.rating ?? null,
      })
      .eq('id', id)
      .select('*')
      .single();

    console.log('[Contacts] updateContact result:', { data, error });

    if (error) throw error;

    const mapped = mapDbContactToContact(data);
    setContacts(prev => prev.map(c => (c.id === id ? mapped : c)));
  };

  const deleteContact = async (id: string) => {
    console.log('[Contacts] deleteContact called:', id);

    const { error } = await supabase.from('contacts').delete().eq('id', id);

    console.log('[Contacts] deleteContact result:', { error });

    if (error) throw error;

    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // ✅ Load contacts when user changes
  useEffect(() => {
    if (auth.user?.id) {
      fetchContacts();
    } else {
      setContacts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user?.id]);

  return (
    <AppContext.Provider
      value={{
        user: auth.user,
        loading: auth.loading,
        isAuthenticated: auth.isAuthenticated,
        signUp: auth.signUp,
        signIn: auth.signIn,
        signInWithGoogle: auth.signInWithGoogle,
        signOut: auth.signOut,
        resetPassword: auth.resetPassword,
        updatePassword: auth.updatePassword,
        deleteAccount: auth.deleteAccount,
        updateProfile: auth.updateProfile,

        projects,
        setProjects,
        budgets,
        setBudgets,
        budgetRequests,
        setBudgetRequests,

        refreshBudgetRequests,

        deletedRequests,
        loadDeletedRequests: loadDeletedTickets,
        restoreRequest: restoreTicket,

        tasks,
        setTasks,
        payments,
        setPayments,
        collections,
        setCollections,
        expenses,
        setExpenses,
        changeOrders,
        setChangeOrders,

        contacts,
        contactsLoading,
        fetchContacts,
        addContact,
        updateContact,
        deleteContact,

        materialRequests,
        setMaterialRequests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

