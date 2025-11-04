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

type PaymentsProps = {
  /** Permite diferenciar dashboards (ej: '#00ffa3', '#00e5ff', '#ff3b7b') */
  neonColor?: string;
};

const Payments: React.FC<PaymentsProps> = ({ neonColor }) => {
  const { expenses, setExpenses, projects, tasks } = useApp();
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

  // === THEME (cian por defecto para "Pagos") ===
  const NEON = neonColor ?? '#00e5ff'; // cambia acá para otro color
  const neonStyle = { ['--neon' as any]: NEON } as React.CSSProperties;

  const filteredExpenses = expenses.filter(e =>
    (selectedProject === '' || e.projectId === selectedProject) &&
    (selectedCategory === '' || e.category === selectedCategory) &&
    (selectedStatus === '' || e.status === selectedStatus)
  );

  const getProject = (projectId: string) => projects.find(p => p.id === projectId);

  const getCategoryText = (category: string) => ({
    materials: 'Materiales',
    labor: 'Mano de Obra',
    equipment: 'Equipos',
    services: 'Servicios',
    other: 'Otros'
  } as const)[category as keyof any] ?? category;

  const getCategoryIcon = (category: string) => ({
    materials: BuildingStorefrontIcon,
    labor: UserIcon,
    equipment: WrenchScrewdriverIcon,
    services: DocumentArrowUpIcon,
    other: CurrencyDollarIcon
  } as const)[category as keyof any] ?? CurrencyDollarIcon;

  const getStatusText = (status: string) =>
    status === 'pending' ? 'Pendiente' : status === 'paid' ? 'Pagado' : status;

  const getMethodText = (method: string) =>
    ({ cash: 'Efectivo', transfer: 'Transferencia', check: 'Cheque', card: 'Tarjeta' } as any)[method] ?? method;

  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  const projectTasks = tasks.filter(t => (newPayment.projectId ? t.projectId === newPayment.projectId : true));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNewPayment({ ...newPayment, receipt: file });
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
    setNewPayment({
      projectId: '', taskId: '', category: 'materials', description: '', amount: '',
      method: 'transfer', paymentDate: new Date().toISOString().split('T')[0],
      supplier: '', employee: '', notes: '', receipt: null
    });
    setShowPaymentForm(false);
  };

  return (
    <div
      className="min-h-screen bg-black text-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8"
      style={neonStyle}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-[var(--neon)]/30 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--neon)] drop-shadow-[0_0_8px_var(--neon)]">
          💸 Gestión de Pagos
        </h1>
        <button
          onClick={() => setShowPaymentForm(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg
                     bg-[var(--neon)] text-black font-semibold
                     shadow-[0_0_10px_var(--neon)] hover:shadow-[0_0_18px_var(--neon)] transition-all"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrar Pago
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[
          { icon: CurrencyDollarIcon, label: 'Total Pagado', value: `$${totalPaid.toLocaleString('es-AR')}` },
          { icon: CalendarIcon, label: 'Pendiente de Pago', value: `$${totalPending.toLocaleString('es-AR')}` },
          { icon: DocumentArrowUpIcon, label: 'Pagos Pendientes', value: pendingCount },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-black rounded-xl p-4 sm:p-6 border border-[var(--neon)]/25
                       shadow-[0_0_10px_color-mix(in_srgb,var(--neon)_30%,transparent)]
                       hover:shadow-[0_0_20px_color-mix(in_srgb,var(--neon)_55%,transparent)]
                       transition-all"
          >
            <div className="flex items-center">
              <item.icon className="h-7 w-7 sm:h-8 sm:w-8 text-[var(--neon)] drop-shadow-[0_0_6px_var(--neon)]" />
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-[var(--neon)]">{item.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-black/70 rounded-xl border border-[var(--neon)]/20 p-4 sm:p-6 shadow-[0_0_12px_color-mix(in_srgb,var(--neon)_25%,transparent)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Obra</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
            >
              <option value="">Todas las obras</option>
              {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
            >
              <option value="">Todas</option>
              <option value="materials">Materiales</option>
              <option value="labor">Mano de Obra</option>
              <option value="equipment">Equipos</option>
              <option value="services">Servicios</option>
              <option value="other">Otros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                         focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setSelectedProject(''); setSelectedCategory(''); setSelectedStatus(''); }}
              className="w-full px-4 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                         hover:bg-[var(--neon)]/10 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-black/70 rounded-xl border border-[var(--neon)]/25 shadow-[0_0_12px_color-mix(in_srgb,var(--neon)_25%,transparent)]">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--neon)]/20">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--neon)]">Registro de Pagos</h2>
        </div>

        <div className="p-4 sm:p-6">
          {filteredExpenses.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredExpenses.map(expense => {
                const project = getProject(expense.projectId);
                const CategoryIcon = getCategoryIcon(expense.category);
                return (
                  <div
                    key={expense.id}
                    className="rounded-lg p-4 sm:p-6 bg-black/60
                               border border-[var(--neon)]/15 hover:shadow-[0_0_15px_var(--neon)]
                               transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full bg-[var(--neon)]/15 text-[var(--neon)]
                                        border border-[var(--neon)]/40">
                          <CategoryIcon className="h-6 w-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-white">{expense.description}</h3>
                            <span className="inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full
                                             bg-[var(--neon)]/12 text-[var(--neon)] border border-[var(--neon)]/35">
                              {getCategoryText(expense.category)}
                            </span>
                            <span className={`inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full
                                              ${expense.status === 'paid'
                                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                                                : 'bg-yellow-500/15 text-yellow-300 border border-yellow-400/30'}`}>
                              {getStatusText(expense.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Obra:</p>
                              <p className="font-medium text-white">{project?.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Monto:</p>
                              <p className="font-semibold text-white text-lg">
                                ${expense.amount.toLocaleString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Fecha de pago:</p>
                              <p className="font-medium text-white">
                                {expense.paymentDate.toLocaleDateString('es-AR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Método:</p>
                              <p className="font-medium text-white">{getMethodText(expense.method)}</p>
                            </div>
                          </div>

                          {(expense.supplier || expense.employee) && (
                            <div className="mt-2 sm:mt-3">
                              <p className="text-gray-400 text-xs sm:text-sm">
                                {expense.supplier ? 'Proveedor:' : 'Empleado:'}
                              </p>
                              <p className="text-gray-200 text-xs sm:text-sm font-medium">
                                {expense.supplier || expense.employee}
                              </p>
                            </div>
                          )}

                          {expense.notes && (
                            <div className="mt-2 sm:mt-3">
                              <p className="text-gray-400 text-xs sm:text-sm">Notas:</p>
                              <p className="text-gray-200 text-xs sm:text-sm">{expense.notes}</p>
                            </div>
                          )}

                          {expense.receipt && (
                            <div className="mt-2 sm:mt-3">
                              <p className="text-[var(--neon)] text-xs sm:text-sm break-words">
                                📎 Comprobante: {expense.receipt}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-2">
                        <button className="p-2 rounded-lg text-[var(--neon)] border border-[var(--neon)]/30 hover:bg-[var(--neon)]/10 transition">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 rounded-lg text-gray-300 border border-[var(--neon)]/20 hover:bg-white/5 transition">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 rounded-lg text-rose-400 border border-rose-400/30 hover:bg-rose-500/10 transition">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12">
              <CurrencyDollarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-[var(--neon)]/60 mx-auto mb-3 sm:mb-4" />
              <div className="text-[var(--neon)] text-base sm:text-lg mb-1">No hay pagos registrados</div>
              <p className="text-gray-500 text-sm">Registra tu primer pago para comenzar</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black rounded-xl border border-[var(--neon)]/30 shadow-[0_0_20px_var(--neon)]
                          max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[var(--neon)]/20">
              <div>
                <h2 className="text-xl font-semibold text-[var(--neon)]">Registrar Pago</h2>
                <p className="text-sm text-gray-400 mt-1">Registra un nuevo pago realizado</p>
              </div>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Proyecto *</label>
                  <select
                    value={newPayment.projectId}
                    onChange={(e) => setNewPayment({ ...newPayment, projectId: e.target.value, taskId: '' })}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                    required
                  >
                    <option value="">Seleccionar proyecto</option>
                    {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tarea (Opcional)</label>
                  <select
                    value={newPayment.taskId}
                    onChange={(e) => setNewPayment({ ...newPayment, taskId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                               disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                    disabled={!newPayment.projectId}
                  >
                    <option value="">Sin tarea específica</option>
                    {projectTasks.map(t => (<option key={t.id} value={t.id}>{t.title}</option>))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Categoría *</label>
                  <select
                    value={newPayment.category}
                    onChange={(e) => setNewPayment({ ...newPayment, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">Monto *</label>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción *</label>
                <input
                  type="text"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  placeholder="Ej: Pago de hormigón"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago *</label>
                  <select
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                    required
                  >
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="check">Cheque</option>
                    <option value="card">Tarjeta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Pago *</label>
                  <input
                    type="date"
                    value={newPayment.paymentDate}
                    onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                               focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newPayment.category === 'labor' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Empleado/Contratista</label>
                    <input
                      type="text"
                      value={newPayment.employee}
                      onChange={(e) => setNewPayment({ ...newPayment, employee: e.target.value })}
                      placeholder="Nombre del trabajador"
                      className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                                 focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Proveedor</label>
                    <input
                      type="text"
                      value={newPayment.supplier}
                      onChange={(e) => setNewPayment({ ...newPayment, supplier: e.target.value })}
                      placeholder="Nombre del proveedor"
                      className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                                 focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Comprobante</label>
                  <div className="flex items-center gap-2">
                    <input id="receipt-upload" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
                    <label
                      htmlFor="receipt-upload"
                      className="flex items-center px-4 py-2 rounded-lg cursor-pointer
                                 bg-black border border-[var(--neon)]/25 text-gray-200
                                 hover:bg-[var(--neon)]/10 transition"
                    >
                      <PhotoIcon className="h-4 w-4 mr-2" />
                      {newPayment.receipt ? newPayment.receipt.name : 'Subir archivo'}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (máx. 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notas Adicionales</label>
                <textarea
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  rows={3}
                  placeholder="Observaciones, detalles adicionales…"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-[var(--neon)]/25 text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-[var(--neon)]/60"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--neon)]/15">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-6 py-2 rounded-lg border border-[var(--neon)]/25 text-gray-200 hover:bg-white/5 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[var(--neon)] text-black font-semibold
                             shadow-[0_0_10px_var(--neon)] hover:shadow-[0_0_18px_var(--neon)] transition"
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
