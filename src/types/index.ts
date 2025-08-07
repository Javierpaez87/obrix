// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'constructor' | 'client' | 'admin';
  company?: string;
  avatar?: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  clientId: string;
  constructorId: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  budget: number;
  spent: number;
  address: string;
  createdAt: Date;
}

// Budget types
export interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

export interface PaymentPlanItem {
  id: string;
  percentage: number;
  executionPercentage: number;
  amount: number;
  description: string;
}

export interface Budget {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: 'labor' | 'materials' | 'combined';
  amount: number;
  status: 'sent' | 'approved' | 'rejected' | 'negotiating' | 'counter_offer';
  items: BudgetItem[];
  estimatedDays?: number;
  showTimelineToClient: boolean;
  paymentPlan?: PaymentPlanItem[];
  requestedAt: Date;
  requestedBy: string;
  respondedAt?: Date;
  approvedAt?: Date;
  notes?: string;
  counterOfferNotes?: string;
  clientApproved: boolean;
  constructorApproved: boolean;
}

export interface BudgetRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  requestedBy: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  status: 'pending' | 'quoted' | 'approved' | 'rejected';
  createdAt: Date;
  requestType?: 'constructor' | 'supplier';
  type?: 'labor' | 'materials' | 'combined';
}

// Task types
export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  requestedBy: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
}

// Payment types
export interface Payment {
  id: string;
  projectId: string;
  budgetId?: string;
  amount: number;
  method: 'cash' | 'transfer' | 'check' | 'card';
  status: 'pending' | 'completed' | 'failed' | 'overdue';
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  type: 'collection' | 'expense';
}

// Collection types (dinero que recibe el constructor)
export interface Collection {
  id: string;
  projectId: string;
  budgetId?: string;
  amount: number;
  method: 'cash' | 'transfer' | 'check' | 'card';
  receivedDate: Date;
  notes?: string;
  paidBy: string; // cliente que paga
  receivedBy: string; // constructor que recibe
  receipt?: string; // comprobante
}

// Expense types (dinero que paga el constructor)
export interface Expense {
  id: string;
  projectId: string;
  category: 'materials' | 'labor' | 'equipment' | 'services' | 'other';
  description: string;
  amount: number;
  method: 'cash' | 'transfer' | 'check' | 'card';
  paymentDate: Date;
  supplier?: string; // para materiales, equipos, servicios
  employee?: string; // para mano de obra
  notes?: string;
  status: 'pending' | 'paid';
  receipt?: string; // comprobante
}

// Change Order types
export interface ChangeOrder {
  id: string;
  projectId: string;
  title: string;
  description: string;
  impact: 'cost' | 'time' | 'scope';
  estimatedCost?: number;
  estimatedDays?: number;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  requestedBy: string;
  approvedBy?: string;
  createdAt: Date;
  approvedAt?: Date;
}

// Contact types for client agenda
export interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email?: string;
  category: 'materials' | 'labor' | 'clients';
  subcategory: string; // For materials: 'corralon', 'ferreteria', etc. For labor: 'constructor', 'albanil', etc.
  notes?: string;
  rating?: number; // 1-5 stars
  lastContact?: Date;
  createdAt: Date;
}