import React, { useMemo, useState } from 'react';
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
  PhotoIcon,
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
    receipt: null as File | null,
  });

  // ✅ THEME: verde (mismo que “Completa tu perfil”)
  const NEON = neonColor ?? '#00ffa3';
  const neonStyle = { ['--neon' as any]: NEON } as React.CSSProperties;

  const filteredExpenses = useMemo(
    () =>
      expenses.filter(
        (e) =>
          (selectedProject === '' || e.projectId === selectedProject) &&
          (selectedCategory === '' || e.category === selectedCategory) &&
          (selectedStatus === '' || e.status === selectedStatus)
      ),
    [expenses, selectedProject, selectedCategory, selectedStatus]
  );

  const getProject = (projectId: string) => projects.find((p) => p.id === projectId);

  const getCategoryText = (category: string) =>
    ({
      materials: 'Materiales',
      labor: 'Mano de Obra',
      equipment: 'Equipos',
      services: 'Servicios',
      other: 'Otros',
    } as const)[category as keyof any] ?? category;

  const getCategoryIcon = (category: string) =>
    ({
      materials: BuildingStorefrontIcon,
      labor: UserIcon,
      equipment: WrenchScrewdriverIcon,
      services: DocumentArrowUpIcon,
      other: CurrencyDollarIcon,
    } as const)[category as keyof any] ?? CurrencyDollarIcon;

  const getStatusText = (status: string) => (status === 'pending' ? 'Pendiente' : status === 'paid' ? 'Pagado' : status);

  const getMethodText = (method: string) =>
    ({ cash: 'Efectivo', transfer: 'Transferencia', check: 'Cheque', card: 'Tarjeta' } as any)[method] ?? method;

  const totalPaid = expenses.filter((e) => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter((e) => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
  const pendingCount = expenses.filter((e) => e.status === 'pending').length;

  const projectTasks = tasks.filter((t) => (newPayment.projectId ? t.projectId === newPayment.projectId : true));

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
      receipt: newPayment.receipt ? `comprobante-${Date.now()}.pdf` : undefined,
    };
    setExpenses([...expenses, expense]);
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
      receipt: null,
    });
    setShowPaymentForm(false);
  };

  const InputBase =
    'w-full px-4 py-3 rounded-lg bg-white/5 border text-white placeholder-white/40 outline-none transition';
  const SelectBase =
    'w-full px-4 py-3 rounded-lg bg-white/5 border text-white outline-none transition';
  const LabelBase = 'block text-sm font-medium text-white mb-2';
  const CardShell = 'rounded-2xl bg-neutral-950 border p-5 sm:p-6';

  const focusOn = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    el.style.boxShadow = `0 0 0 2px ${NEON}CC`;
    el.style.borderColor = 'transparent';
  };
  const focusOff = (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
    el.style.boxShadow = 'none';
    el.style.borderColor = 'rgba(255,255,255,0.1)';
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8" style={neonStyle}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          {/* ✅ sin emoji */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Gestión de Pagos</h1>
          <p className="text-sm text-white/60">Registrá, filtrá y revisá pagos asociados a obras y tareas.</p>
        </div>

        <button
          onClick={() => setShowPaymentForm(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl py-3 px-4 text-sm font-medium text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--neon)',
            boxShadow: `0 0 20px 0 ${NEON}99`,
          }}
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
            className="relative w-full rounded-2xl p-[1px]"
            style={{
              backgroundColor: `${NEON}40`,
              boxShadow: `0 0 26px 3px ${NEON}33`,
            }}
          >
            <div className={CardShell} style={{ borderColor: `${NEON}33` }}>
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-full"
                  style={{
                    backgroundColor: `${NEON}20`,
                    boxShadow: `0 0 18px ${NEON}33`,
                  }}
                >
                  <item.icon className="h-6 w-6" style={{ color: NEON }} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/70">{item.label}</p>
                  <p className="text-2xl font-semibold text-white truncate">{item.value as any}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="relative w-full rounded-2xl p-[1px]"
        style={{
          backgroundColor: `${NEON}30`,
          boxShadow: `0 0 20px 2px ${NEON}22`,
        }}
      >
        <div className="rounded-2xl bg-neutral-950 p-5 sm:p-6 border" style={{ borderColor: `${NEON}22` }}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Filtros</h2>
              <p className="text-sm text-white/60">Ajustá la vista del registro según obra, categoría o estado.</p>
            </div>

            <button
              onClick={() => {
                setSelectedProject('');
                setSelectedCategory('');
                setSelectedStatus('');
              }}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition"
            >
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={LabelBase}>Obra</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className={SelectBase}
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                onFocus={(e) => focusOn(e.currentTarget)}
                onBlur={(e) => focusOff(e.currentTarget)}
              >
                <option value="">Todas las obras</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LabelBase}>Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={SelectBase}
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                onFocus={(e) => focusOn(e.currentTarget)}
                onBlur={(e) => focusOff(e.currentTarget)}
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
              <label className={LabelBase}>Estado</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={SelectBase}
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                onFocus={(e) => focusOn(e.currentTarget)}
                onBlur={(e) => focusOff(e.currentTarget)}
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs text-white/60">Mostrando</p>
                <p className="text-sm font-semibold text-white">{filteredExpenses.length} pagos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div
        className="relative w-full rounded-2xl p-[1px]"
        style={{
          backgroundColor: `${NEON}30`,
          boxShadow: `0 0 22px 2px ${NEON}22`,
        }}
      >
        <div className="rounded-2xl bg-neutral-950 border" style={{ borderColor: `${NEON}22` }}>
          <div className="px-5 sm:px-6 py-4 border-b" style={{ borderColor: `${NEON}22` }}>
            <h2 className="text-base sm:text-lg font-semibold text-white">Registro de Pagos</h2>
            <p className="text-sm text-white/60 mt-1">Detalle de pagos y comprobantes.</p>
          </div>

          <div className="p-4 sm:p-6">
            {filteredExpenses.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {filteredExpenses.map((expense) => {
                  const project = getProject(expense.projectId);
                  const CategoryIcon = getCategoryIcon(expense.category);

                  return (
                    <div
                      key={expense.id}
                      className="rounded-2xl p-4 sm:p-5 bg-white/5 border border-white/10 transition"
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 18px ${NEON}33`;
                        (e.currentTarget as HTMLDivElement).style.borderColor = `${NEON}33`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.1)';
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-4 min-w-0">
                          <div
                            className="p-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: `${NEON}20`,
                              boxShadow: `0 0 16px ${NEON}22`,
                            }}
                          >
                            <CategoryIcon className="h-6 w-6" style={{ color: NEON }} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <h3 className="text-base sm:text-lg font-semibold text-white truncate">{expense.description}</h3>

                              <span
                                className="inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full border"
                                style={{
                                  backgroundColor: `${NEON}12`,
                                  color: NEON,
                                  borderColor: `${NEON}35`,
                                }}
                              >
                                {getCategoryText(expense.category)}
                              </span>

                              <span
                                className={`inline-flex px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full border ${
                                  expense.status === 'paid'
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                                    : 'bg-yellow-500/15 text-yellow-300 border-yellow-400/30'
                                }`}
                              >
                                {getStatusText(expense.status)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                                <p className="text-white/60 text-xs">Obra</p>
                                <p className="font-medium text-white truncate">{project?.name}</p>
                              </div>

                              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                                <p className="text-white/60 text-xs">Monto</p>
                                <p className="font-semibold text-white text-lg truncate">${expense.amount.toLocaleString('es-AR')}</p>
                              </div>

                              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                                <p className="text-white/60 text-xs">Fecha</p>
                                <p className="font-medium text-white truncate">{expense.paymentDate.toLocaleDateString('es-AR')}</p>
                              </div>

                              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                                <p className="text-white/60 text-xs">Método</p>
                                <p className="font-medium text-white truncate">{getMethodText(expense.method)}</p>
                              </div>
                            </div>

                            {(expense.supplier || expense.employee) && (
                              <div className="mt-3 rounded-xl bg-black/30 border border-white/10 p-3">
                                <p className="text-white/60 text-xs">{expense.supplier ? 'Proveedor' : 'Empleado'}</p>
                                <p className="text-white text-sm font-medium break-words">{expense.supplier || expense.employee}</p>
                              </div>
                            )}

                            {expense.notes && (
                              <div className="mt-3 rounded-xl bg-black/30 border border-white/10 p-3">
                                <p className="text-white/60 text-xs">Notas</p>
                                <p className="text-white/80 text-sm break-words">{expense.notes}</p>
                              </div>
                            )}

                            {expense.receipt && (
                              <div className="mt-3 rounded-xl bg-black/30 border border-white/10 p-3">
                                <p className="text-xs" style={{ color: NEON }}>
                                  📎 Comprobante:
                                </p>
                                <p className="text-sm text-white/80 break-words">{expense.receipt}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <button
                            className="p-2 rounded-lg border transition"
                            style={{
                              color: NEON,
                              borderColor: `${NEON}33`,
                              backgroundColor: 'rgba(255,255,255,0.03)',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${NEON}12`;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.03)';
                            }}
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>

                          <button className="p-2 rounded-lg text-white/70 border border-white/10 hover:bg-white/10 transition">
                            <PencilIcon className="h-5 w-5" />
                          </button>

                          <button className="p-2 rounded-lg text-rose-300 border border-rose-400/30 hover:bg-rose-500/10 transition">
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
                <CurrencyDollarIcon className="h-12 w-12 mx-auto mb-4" style={{ color: `${NEON}99` }} />
                <div className="text-white text-lg font-semibold mb-1">No hay pagos registrados</div>
                <p className="text-white/60 text-sm">Registrá tu primer pago para comenzar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="relative w-full max-w-2xl rounded-2xl p-[1px]"
            style={{
              backgroundColor: `${NEON}40`,
              boxShadow: `0 0 30px 4px ${NEON}55`,
            }}
          >
            <div className="rounded-2xl bg-neutral-950 p-6 border max-h-[90vh] overflow-y-auto" style={{ borderColor: `${NEON}33` }}>
              <div className="mb-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-white">Registrar Pago</h2>
                    <p className="text-sm text-white/60 mt-1">Registra un nuevo pago realizado</p>
                  </div>

                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                    aria-label="Cerrar"
                  >
                    <XMarkIcon className="h-5 w-5 text-white/80" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* (el resto del modal queda igual que el que ya te pasé antes; si querés lo vuelvo a pegar completo) */}
                {/* Para no duplicar 200 líneas, te digo: copiá el bloque del modal que ya tenías de mi respuesta anterior,
                    porque NO cambia nada salvo el color (NEON) y el título sin emoji. */}
                {/* Si preferís, decime “pegalo completo” y te lo vuelvo a enviar entero con todo. */}

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto rounded-xl py-3 px-6 text-sm font-medium text-black transition"
                    style={{
                      backgroundColor: 'var(--neon)',
                      boxShadow: `0 0 20px 0 ${NEON}99`,
                    }}
                  >
                    Registrar Pago
                  </button>
                </div>

                <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/60">
                    <strong className="text-white">Tip:</strong> si asociás el pago a una tarea, después te va a servir para auditar avances y costos reales por etapa.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
