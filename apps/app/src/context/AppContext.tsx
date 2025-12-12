import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Project, Budget, BudgetRequest, Task, Payment, Collection, Expense, ChangeOrder, Contact, MaterialRequest } from '../types';
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
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
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

  const [projects, setProjects] = useState<Project[]>([]);

  const [budgets, setBudgets] = useState<Budget[]>([]);

  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [deletedRequests, setDeletedRequests] = useState<BudgetRequest[]>([]);

  // Load tickets from Supabase when user is authenticated
  useEffect(() => {
    if (auth.user?.id) {
      loadTicketsFromSupabase();
      loadDeletedTickets();
    }
  }, [auth.user?.id]);

  const mapTicketToRequest = (ticket: any): BudgetRequest => ({
    id: ticket.id,
    projectId: ticket.project_id || '',
    title: ticket.title,
    description: ticket.description,
    requestedBy: ticket.created_by,
    priority: ticket.priority as 'low' | 'medium' | 'high' | 'urgent',
    dueDate: ticket.due_date ? new Date(ticket.due_date) : undefined,
    status: ticket.status === 'pending' ? 'pending' :
            ticket.status === 'quoted' ? 'quoted' :
            ticket.status === 'approved' ? 'approved' :
            ticket.status === 'rejected' ? 'rejected' : 'pending',
    createdAt: new Date(ticket.created_at),
    requestType: ticket.creator_role === 'constructor' ? 'supplier' : 'constructor',
    type: ticket.type as 'labor' | 'materials' | 'combined',
  });

  const loadTicketsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tickets:', error);
        return;
      }

      if (data) {
        const mappedRequests = data.map(mapTicketToRequest);
        setBudgetRequests(mappedRequests);
      }
    } catch (err) {
      console.error('Unexpected error loading tickets:', err);
    }
  };

  const loadDeletedTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error('Error loading deleted tickets:', error);
        return;
      }

      if (data) {
        const mappedRequests = data.map(mapTicketToRequest);
        setDeletedRequests(mappedRequests);
      }
    } catch (err) {
      console.error('Unexpected error loading deleted tickets:', err);
    }
  };

  const restoreTicket = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ deleted_at: null })
        .eq('id', requestId);

      if (error) {
        console.error('Error restoring ticket:', error);
        throw error;
      }

      await loadTicketsFromSupabase();
      await loadDeletedTickets();
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

  const [contacts, setContacts] = useState<Contact[]>([
    // Proveedores de Materiales
    {
      id: '1',
      name: 'Carlos Mendoza',
      company: 'Corralón Quen',
      phone: '+54 9 11 2345-6789',
      email: 'carlos@corralonquen.com',
      category: 'materials',
      subcategory: 'corralon',
      notes: 'Buen precio en cemento y arena. Entrega rápida.',
      rating: 4,
      lastContact: new Date('2024-01-15'),
      createdAt: new Date('2023-12-01')
    },
    {
      id: '2',
      name: 'Ana García',
      company: 'Corralon Austral',
      phone: '+54 9 11 3456-7890',
      email: 'ana@ferreteriasmn.com',
      category: 'materials',
      subcategory: 'ferreteria',
      notes: 'Especialista en herramientas y tornillería.',
      rating: 5,
      lastContact: new Date('2024-01-20'),
      createdAt: new Date('2023-11-15')
    },
    {
      id: '3',
      name: 'Roberto Salva',
      company: 'Materiales El Salva',
      phone: '+54 9 11 4567-8901',
      category: 'materials',
      subcategory: 'ceramicos',
      notes: 'Gran variedad de cerámicos y porcelanatos.',
      rating: 4,
      createdAt: new Date('2024-01-05')
    },
    // Proveedores de Mano de Obra
    {
      id: '4',
      name: 'Charo Berta',
      company: 'Torres Construcciones',
      phone: '+54 9 11 6133-9102',
      email: 'berta@bertaconstrucciones.com',
      category: 'labor',
      subcategory: 'constructor',
      notes: 'Constructor con 15 años de experiencia. Muy responsable.',
      rating: 5,
      lastContact: new Date('2024-01-18'),
      createdAt: new Date('2023-10-20')
    },
    {
      id: '5',
      name: 'Fabian Guayquillan',
      company: 'Albañilería Guayquillan',
      phone: '+54 9 11 6789-0123',
      category: 'labor',
      subcategory: 'albanil',
      notes: 'Especialista en mampostería y revoques.',
      rating: 4,
      lastContact: new Date('2024-01-12'),
      createdAt: new Date('2023-12-10')
    },
    {
      id: '6',
      name: 'Chango Cardenas',
      company: 'Plomería Cardenas',
      phone: '+54 9 11 7890-1234',
      email: 'luis@plomeriacardenas.com',
      category: 'labor',
      subcategory: 'plomero',
      notes: 'Plomero matriculado. Disponible para emergencias.',
      rating: 5,
      createdAt: new Date('2024-01-08')
    },
    {
      id: '7',
      name: 'Aldo',
      company: 'Carpintería Aldo',
      phone: '+54 9 11 8901-2345',
      category: 'labor',
      subcategory: 'carpintero',
      notes: 'Carpintero especializado en muebles a medida.',
      rating: 4,
      createdAt: new Date('2023-11-25')
    },
    // Clientes (para constructores)
    {
      id: '8',
      name: 'María Rodríguez',
      company: 'Cliente Particular',
      phone: '+54 9 11 9876-5432',
      email: 'maria@gmail.com',
      category: 'clients',
      subcategory: 'particular',
      notes: 'Cliente de casa unifamiliar. Muy detallista con los acabados.',
      rating: 5,
      lastContact: new Date('2024-01-22'),
      createdAt: new Date('2024-01-01')
    },
    {
      id: '9',
      name: 'Carlos Empresas',
      company: 'Empresas del Sur SA',
      phone: '+54 9 11 1111-2222',
      email: 'carlos@empresasdelsur.com',
      category: 'clients',
      subcategory: 'empresa',
      notes: 'Cliente corporativo. Proyectos de oficinas y locales comerciales.',
      rating: 4,
      lastContact: new Date('2024-01-20'),
      createdAt: new Date('2023-12-15')
    },
    {
      id: '10',
      name: 'Ana Constructora',
      company: 'Inmobiliaria Central',
      phone: '+54 9 11 3333-4444',
      email: 'ana@inmobiliariacentral.com',
      category: 'clients',
      subcategory: 'inmobiliaria',
      notes: 'Inmobiliaria con múltiples proyectos. Pagos puntuales.',
      rating: 5,
      createdAt: new Date('2023-11-01')
    }
  ]);

  return (
    <AppContext.Provider value={{
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
      projects, setProjects,
      budgets, setBudgets,
      budgetRequests, setBudgetRequests,
      refreshBudgetRequests: loadTicketsFromSupabase,
      deletedRequests,
      loadDeletedRequests: loadDeletedTickets,
      restoreRequest: restoreTicket,
      tasks, setTasks,
      payments, setPayments,
      collections, setCollections,
      expenses, setExpenses,
      changeOrders, setChangeOrders,
      contacts, setContacts,
      materialRequests, setMaterialRequests
    }}>
      {children}
    </AppContext.Provider>
  );
};
