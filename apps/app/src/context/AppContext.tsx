import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Project, Budget, BudgetRequest, Task, Payment, Collection, Expense, ChangeOrder, Contact, MaterialRequest } from '../types';
import { useAuth } from '../hooks/useAuth';

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

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Casa Familia Rodríguez',
      description: 'Construcción de vivienda unifamiliar de 120m²',
      clientId: '2',
      constructorId: '1',
      status: 'in_progress',
      startDate: new Date('2024-01-15'),
      budget: 85000,
      spent: 45000,
      address: 'Av. Libertador 1234, CABA',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '2',
      name: 'Reforma Oficina Central',
      description: 'Renovación completa de oficinas corporativas',
      clientId: '3',
      constructorId: '1',
      status: 'planning',
      startDate: new Date('2024-03-01'),
      budget: 120000,
      spent: 15000,
      address: 'Av. Corrientes 890, CABA',
      createdAt: new Date('2024-02-01')
    }
  ]);

  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: '1',
      projectId: '1',
      title: 'Presupuesto Fundaciones',
      description: 'Excavación y fundaciones para la casa',
      type: 'combined',
      amount: 25000,
      status: 'approved',
      items: [
        { id: '1', description: 'Excavación', quantity: 120, unitPrice: 50, total: 6000, category: 'Movimiento de suelos' },
        { id: '2', description: 'Hormigón para fundaciones', quantity: 15, unitPrice: 800, total: 12000, category: 'Materiales' },
        { id: '3', description: 'Mano de obra fundaciones', quantity: 40, unitPrice: 175, total: 7000, category: 'Mano de obra' }
      ],
      estimatedDays: 15,
      showTimelineToClient: true,
      requestedAt: new Date('2024-01-12'),
      requestedBy: '2',
      respondedAt: new Date('2024-01-14'),
      approvedAt: new Date('2024-01-15'),
      clientApproved: true,
      constructorApproved: true
    }
  ]);

  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([
    {
      id: '1',
      projectId: '1',
      title: 'Colocación de cerámicos',
      description: 'Necesito presupuesto para colocación de cerámicos en baños y cocina. Superficie aproximada: 45m²',
      requestedBy: '2',
      priority: 'medium',
      dueDate: new Date('2024-02-20'),
      status: 'pending',
      createdAt: new Date('2024-02-10')
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      projectId: '1',
      title: 'Solicitar permiso municipal',
      description: 'Tramitar permisos de construcción en la municipalidad',
      status: 'completed',
      priority: 'high',
      requestedBy: '2',
      dueDate: new Date('2024-01-20'),
      completedAt: new Date('2024-01-18'),
      createdAt: new Date('2024-01-10')
    }
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      projectId: '1',
      budgetId: '1',
      amount: 12500,
      method: 'transfer',
      status: 'completed',
      dueDate: new Date('2024-01-20'),
      paidDate: new Date('2024-01-18'),
      notes: 'Anticipo 50% fundaciones',
      type: 'collection'
    }
  ]);

  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      projectId: '1',
      budgetId: '1',
      amount: 12500,
      method: 'transfer',
      receivedDate: new Date('2024-01-18'),
      notes: 'Anticipo 50% fundaciones',
      paidBy: '2',
      receivedBy: '1',
      receipt: 'comprobante-001.pdf'
    }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      projectId: '1',
      category: 'materials',
      description: 'Cemento y arena para fundaciones',
      amount: 8500,
      method: 'transfer',
      paymentDate: new Date('2024-01-20'),
      supplier: 'Corralón Central',
      status: 'paid',
      receipt: 'factura-001.pdf'
    }
  ]);

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
      phone: '+54 9 11 5678-9012',
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