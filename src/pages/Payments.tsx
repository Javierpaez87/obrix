import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Expense } from '../types';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentArrowUpIcon,
  BuildingStorefrontIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const Payments: React.FC = () => {
  const { expenses, setExpenses, projects, tasks, user } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({
    projectId: '',
    taskId: '',
    category: 'materials' as const,
    description: '',
    amount: '',
    method: 'transfer' as const,
    paymentDate: new Date().toISOString().split('T')[0],
    supplier: '',
    employee: '',
    notes: '',
    receipt: null as File | null
  });

  const filteredExpenses = expenses.filter(expense => {
    return (selectedProject === '' || expense.projectId === selectedProject) &&
           (selectedCategory === '' || expense.category === selectedCategory) &&
           (selectedStatus === '' || expense.status === selectedStatus);
  });

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'materials': return 'bg-blue-100 text-blue-800';
      case 'labor': return 'bg-green-100 text-green-800';
      case 'equipment': return 'bg-yellow-100 text-yellow-800';
      case 'services': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'materials': return 'Materiales';
      case 'labor': return 'Mano de Obra';
      case 'equipment': return 'Equipos';
      case 'services': return 'Servicios';
      case 'other': return 'Otros';
      default: return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'materials': return BuildingStorefrontIcon;
      case 'labor': return UserIcon;
      case 'equipment': return WrenchScrewdriverIcon;
      case 'services': return DocumentArrowUpIcon;
      default: return CurrencyDollarIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'paid': return 'Pagado';
      default: return status;
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Efectivo';
      case 'transfer': return 'Transferencia';
      case 'check': return 'Cheque';
      case 'card': return 'Tarjeta';
      default: return method;
    }
  };

  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  const getProject = (projectId: string) => {
    return projects.find(p => p.id === projectId);
  };

  const getTask = (taskId: string) => {
    return tasks.find(t => t.id === taskId);
  };

  const projectTasks = tasks.filter(task => 
    newPayment.projectId ? task.projectId === newPayment.projectId : true
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPayment({ ...newPayment, receipt: file });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPayment.description || !newPayment.amount || !newPayment.projectId) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      projectId: newPayment.projectId,
      taskId: newPayment.taskId || undefined,
      category: newPayment.category,
      description: newPayment.description,
      amount: parseFloat(newPayment.amount),
      method: newPayment.method,
      paymentDate: new Date(newPayment.paymentDate),
      supplier: newPayment.supplier || undefined,
      employee: newPayment.employee || undefined,
      notes: newPayment.notes || undefined,
      status: 'paid',
      receipt: newPayment.receipt ? `comprobante-${Date.now()}.pdf` : undefined
    };

    setExpenses([...expenses, expense]);
    
    // Reset form
    setNewPayment({
      projectId: '',
      taskId: '',
      category: 'materials',
      description: '',
      amount: '',
      method: 'transfer',
      paymentDate: new Date().toISOString().split('T')[0],
      supplier: '',
      employee: '',
      notes: '',
      receipt: null
    });
    
    setShowPaymentForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Pagos</h1>
        <button 
          onClick={() => setShowPaymentForm(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrar Pago
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Total Pagado</p>
              <p className="text-2xl font-bold text-red-900">
                ${totalPaid.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Pendiente de Pago</p>
              <p className="text-2xl font-bold text-yellow-900">
                ${totalPending.toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DocumentArrowUpIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-blue-900">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obra
            </label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las obras</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              <option value="materials">Materiales</option>
              <option value="labor">Mano de Obra</option>
              <option value="equipment">Equipos</option>
              <option value="services">Servicios</option>
              <option value="other">Otros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSelectedProject('');
                setSelectedCategory('');
                setSelectedStatus('');
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Registro de Pagos</h2>
        </div>
        
        <div className="p-6">
          {filteredExpenses.length > 0 ? (
            <div className="space-y-4">
              {filteredExpenses.map((expense) => {
                const project = getProject(expense.projectId);
                const CategoryIcon = getCategoryIcon(expense.category);
                
                return (
                  <div key={expense.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${getCategoryColor(expense.category)}`}>
                          <CategoryIcon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {expense.description}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                              {getCategoryText(expense.category)}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                              {getStatusText(expense.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Obra:</p>
                              <p className="font-medium text-gray-900">{project?.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Monto:</p>
                              <p className="font-medium text-gray-900 text-lg">
                                ${expense.amount.toLocaleString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Fecha de pago:</p>
                              <p className="font-medium text-gray-900">
                                {expense.paymentDate.toLocaleDateString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Método:</p>
                              <p className="font-medium text-gray-900">{getMethodText(expense.method)}</p>
                            </div>
                          </div>
                          
                          {(expense.supplier || expense.employee) && (
                            <div className="mt-3">
                              <p className="text-gray-600 text-sm">
                                {expense.supplier ? 'Proveedor:' : 'Empleado:'}
                              </p>
                              <p className="text-gray-900 text-sm font-medium">
                                {expense.supplier || expense.employee}
                              </p>
                            </div>
                          )}
                          
                          {expense.notes && (
                            <div className="mt-3">
                              <p className="text-gray-600 text-sm">Notas:</p>
                              <p className="text-gray-900 text-sm">{expense.notes}</p>
                            </div>
                          )}
                          
                          {expense.receipt && (
                            <div className="mt-3">
                              <p className="text-blue-600 text-sm">
                                📎 Comprobante: {expense.receipt}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-400 text-lg mb-2">No hay pagos registrados</div>
              <p className="text-gray-500">Registra tu primer pago para comenzar</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Registration Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Registrar Pago</h2>
                <p className="text-sm text-gray-600 mt-1">Registra un nuevo pago realizado</p>
              </div>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Project and Task Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proyecto *
                  </label>
                  <select
                    value={newPayment.projectId}
                    onChange={(e) => setNewPayment({ ...newPayment, projectId: e.target.value, taskId: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar proyecto</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarea (Opcional)
                  </label>
                  <select
                    value={newPayment.taskId}
                    onChange={(e) => setNewPayment({ ...newPayment, taskId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!newPayment.projectId}
                  >
                    <option value="">Sin tarea específica</option>
                    {projectTasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={newPayment.category}
                    onChange={(e) => setNewPayment({ ...newPayment, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="materials">Materiales</option>
                    <option value="labor">Mano de Obra</option>
                    <option value="equipment">Equipos</option>
                    <option value="services">Servicios</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto *
                  </label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  placeholder="Ej: Compra de cemento y arena"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago *
                  </label>
                  <select
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="check">Cheque</option>
                    <option value="card">Tarjeta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Pago *
                  </label>
                  <input
                    type="date"
                    value={newPayment.paymentDate}
                    onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Supplier or Employee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newPayment.category === 'labor' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empleado/Contratista
                    </label>
                    <input
                      type="text"
                      value={newPayment.employee}
                      onChange={(e) => setNewPayment({ ...newPayment, employee: e.target.value })}
                      placeholder="Nombre del trabajador"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proveedor
                    </label>
                    <input
                      type="text"
                      value={newPayment.supplier}
                      onChange={(e) => setNewPayment({ ...newPayment, supplier: e.target.value })}
                      placeholder="Nombre del proveedor"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Receipt Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprobante
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-300"
                    >
                      <PhotoIcon className="h-4 w-4 mr-2" />
                      {newPayment.receipt ? newPayment.receipt.name : 'Subir archivo'}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG (máx. 5MB)
                  </p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder="Observaciones, detalles adicionales..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;