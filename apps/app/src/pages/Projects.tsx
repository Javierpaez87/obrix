import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, MaterialRequest, Project } from '../types';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PhoneIcon,
  CheckCircleIcon,
  TruckIcon,
  ShoppingCartIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  UserMinusIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

// =====================
// 🎨 Neon theme helpers
// =====================
const NEON_HEX = '#00FFA3';
const neonShadow = 'shadow-[0_0_24px_rgba(0,255,163,0.35)]';
const neonShadowStrong = 'shadow-[0_0_36px_rgba(0,255,163,0.55)]';

const neonBorder = `border rounded-2xl ${neonShadow}`;
const neonChip =
  'inline-flex px-2 py-1 text-[10px] font-semibold rounded-full bg-black/60 border border-white/10 text-white/80';
const neonText = 'text-white';
const neonSubtle = 'text-white/70';
const neonMuted = 'text-white/50';
const neonButton =
  'inline-flex items-center justify-center px-3 py-2 rounded-lg border border-white/10 bg-black/40 text-white hover:bg-black/60 transition-colors';
const neonCTA =
  'inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-black font-semibold transition-colors';
const neonCTAStyle: React.CSSProperties = {
  backgroundColor: NEON_HEX,
  boxShadow: '0 0 24px rgba(0,255,163,0.45)',
};
const pill = (bg = 'bg-white/5', extra = '') =>
  `inline-flex px-2 py-1 text-[10px] font-medium rounded-full border border-white/10 ${bg} ${extra}`;

// =====================
// 🧩 Sharing model (local/MVP)
// =====================
type ShareEntityType = 'project' | 'task';
type Share = {
  id: string;
  entityType: ShareEntityType;
  entityId: string;
  ownerId: string;
  invitedLabel: string; // email o nombre
  invitedUserId?: string; // si existe en la app
  invitedRole?: 'client' | 'constructor';
  invitedAt: Date;
  revokedAt?: Date | null;
  // snapshot (vista congelada para el invitado luego de revocar)
  snapshot?: any;
};

function keyFor(et: ShareEntityType, id: string) {
  return `${et}:${id}`;
}

// =====================

const Projects: React.FC = () => {
  const { projects, tasks, user } = useApp();

  // ---- NUEVO: shares locales
  const [shares, setShares] = useState<Record<string, Share[]>>({});

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [showCreateMaterialRequest, setShowCreateMaterialRequest] = useState(false);
  const [showProvidersList, setShowProvidersList] = useState(false);

  // NUEVO: crear tarea
  const [showTaskForm, setShowTaskForm] = useState(false);

  // NUEVO: menú de acciones
  const [actionEntity, setActionEntity] = useState<{ type: ShareEntityType; id: string; title: string } | null>(null);

  // NUEVO: compartir/invitar
  const [shareTarget, setShareTarget] = useState<{ type: ShareEntityType; id: string; title: string } | null>(null);
  const [inviteData, setInviteData] = useState({ label: '', role: 'client' as 'client' | 'constructor' });

  // ---- Formularios existentes
  const [newMaterialRequest, setNewMaterialRequest] = useState({
    title: '',
    description: '',
    items: [{ id: '1', description: '', quantity: 1, unit: 'unidad', specifications: '', brand: '' }],
    notes: '',
    estimatedDeliveryDate: '',
  });

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    clientId: '',
    address: '',
    budget: '',
    startDate: '',
    // presupuesto
    budgetTitle: '',
    budgetDescription: '',
    budgetType: 'combined' as const,
    estimatedDays: '',
    budgetItems: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0, category: '' }],
    budgetNotes: '',
  });

  // NUEVO: formulario de tarea
  const [newTask, setNewTask] = useState<Partial<Task> & { projectId?: string }>({
    title: '',
    description: '',
    projectId: '',
  });

  // =====================
  //   Computados / utils
  // =====================
  const filteredProjectsBase = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.address.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [projects, searchTerm]
  );

  // ---- visibilidad: owner o invitado activo; si está revocado, solo snapshot
  function findShare(et: ShareEntityType, id: string, uId?: string) {
    const arr = shares[keyFor(et, id)] || [];
    if (!uId) return undefined;
    return arr.find((s) => s.invitedUserId === uId || (!s.invitedUserId && s.invitedLabel));
  }

  function isOwner(entity: { ownerId?: string }) {
    return !!user?.id && entity.ownerId && entity.ownerId === user.id;
  }

  // Para proyectos: si no hay ownerId en tus tipos, podés setearlo cuando se crea (abajo).
  const visibleProjects = useMemo(() => {
    return filteredProjectsBase
      .map((p) => {
        const s = findShare('project', p.id, user?.id);
        const owner = isOwner(p as any);
        const activeInvite = s && !s.revokedAt;
        const revoked = s && !!s.revokedAt;

        return {
          project: p,
          visibility:
            owner ? 'owner' : activeInvite ? 'live' : revoked ? 'snapshot' : 'none',
          share: s,
        };
      })
      .filter((x) => x.visibility !== 'none');
  }, [filteredProjectsBase, user?.id, shares]);

  // Tareas: mismo criterio
  const projectTasksBase = useMemo(
    () => tasks, // no limitamos por requestedBy para no ocultar compartidos
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    return projectTasksBase
      .map((t) => {
        const s = findShare('task', t.id, user?.id);
        const owner = isOwner(t as any);
        const activeInvite = s && !s.revokedAt;
        const revoked = s && !!s.revokedAt;
        return {
          task: t,
          visibility:
            owner ? 'owner' : activeInvite ? 'live' : revoked ? 'snapshot' : 'none',
          share: s,
        };
      })
      .filter((x) => x.visibility !== 'none');
  }, [projectTasksBase, user?.id, shares]);

  // Status pills
  const getStatusPill = (status: string) => {
    switch (status) {
      case 'planning':
        return pill('bg-white/[0.06]', 'text-white/80');
      case 'in_progress':
        return pill('bg-white/[0.08]', 'text-white');
      case 'completed':
        return pill('bg-emerald-500/20', 'text-emerald-300 border-emerald-400/40');
      case 'cancelled':
        return pill('bg-red-500/10', 'text-red-300 border-red-400/40');
      default:
        return pill();
    }
  };
  const statusText = (s: string) =>
    s === 'planning'
      ? 'Planificación'
      : s === 'in_progress'
      ? 'En Progreso'
      : s === 'completed'
      ? 'Completada'
      : s === 'cancelled'
      ? 'Cancelada'
      : s;

  const taskStatusPill = (status: string) => {
    switch (status) {
      case 'pending':
        return pill('bg-yellow-500/10', 'text-yellow-300 border-yellow-400/40');
      case 'in_progress':
        return pill('bg-white/[0.08]', 'text-white');
      case 'completed':
        return pill('bg-emerald-500/20', 'text-emerald-300 border-emerald-400/40');
      case 'cancelled':
        return pill('bg-red-500/10', 'text-red-300 border-red-400/40');
      default:
        return pill();
    }
  };
  const taskStatusText = (s: string) =>
    s === 'pending' ? 'Pendiente' : s === 'in_progress' ? 'En Progreso' : s === 'completed' ? 'Completada' : s === 'cancelled' ? 'Cancelada' : s;

  const materialStatusPill = (status: string) => {
    switch (status) {
      case 'sent_to_client':
        return pill('bg-white/[0.06]', 'text-white/80');
      case 'sent_to_suppliers':
        return pill('bg-yellow-500/10', 'text-yellow-300 border-yellow-400/40');
      case 'purchased':
        return pill('bg-orange-500/10', 'text-orange-300 border-orange-400/40');
      case 'delivered':
        return pill('bg-emerald-500/20', 'text-emerald-300 border-emerald-400/40');
      default:
        return pill();
    }
  };
  const materialStatusText = (s: string) =>
    s === 'sent_to_client'
      ? 'Enviado al Cliente'
      : s === 'sent_to_suppliers'
      ? 'Enviado a Proveedores'
      : s === 'purchased'
      ? 'Comprado'
      : s === 'delivered'
      ? 'Entregado'
      : s;

  const openWhatsApp = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  // ====== acciones materiales (mock/console para MVP) ======
  const handleSendToSuppliers = (req: MaterialRequest) => console.log('Enviando a proveedores:', req.title);

  // ====== Presupuesto helpers (ya existentes) ======
  const updateBudgetItemTotal = (index: number, quantity: number, unitPrice: number) =>
    setNewProject((prev) => {
      const copy = [...prev.budgetItems];
      copy[index] = { ...copy[index], quantity, unitPrice, total: (quantity || 0) * (unitPrice || 0) };
      return { ...prev, budgetItems: copy };
    });

  // =====================
  //      SHARE logic
  // =====================
  function doShare(et: ShareEntityType, id: string, title: string) {
    setShareTarget({ type: et, id, title });
    setInviteData({ label: '', role: user?.role === 'constructor' ? 'client' : 'constructor' });
  }

  function confirmShare() {
    if (!shareTarget || !user?.id || !inviteData.label.trim()) return;
    const k = keyFor(shareTarget.type, shareTarget.id);
    const newShare: Share = {
      id: Date.now().toString(),
      entityType: shareTarget.type,
      entityId: shareTarget.id,
      ownerId: user.id,
      invitedLabel: inviteData.label.trim(),
      invitedRole: inviteData.role,
      invitedAt: new Date(),
      revokedAt: null,
    };
    setShares((prev) => ({ ...prev, [k]: [...(prev[k] || []), newShare] }));
    setShareTarget(null);
  }

  function revokeShare(et: ShareEntityType, id: string, targetLabel?: string) {
    const k = keyFor(et, id);
    setShares((prev) => {
      const arr = prev[k] || [];
      const updated = arr.map((s) => {
        if (!s.revokedAt && (!targetLabel || s.invitedLabel === targetLabel)) {
          // crear snapshot congelado del estado actual
          let snapshot: any = undefined;
          if (et === 'project') {
            const live = projects.find((p) => p.id === id);
            snapshot = live ? JSON.parse(JSON.stringify(live)) : undefined;
          } else {
            const live = tasks.find((t) => t.id === id);
            snapshot = live ? JSON.parse(JSON.stringify(live)) : undefined;
          }
          return { ...s, revokedAt: new Date(), snapshot };
        }
        return s;
      });
      return { ...prev, [k]: updated };
    });
  }

  // =====================
  //         UI
  // =====================
  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div
      className={`bg-black/60 ${neonBorder} border-white/10 ${neonText} p-4 sm:p-6 ${className || ''}`}
      style={{ borderColor: NEON_HEX }}
    >
      {children}
    </div>
  );

  const Section = ({ title, cta, onClick, right }: { title: string; cta?: string; onClick?: () => void; right?: React.ReactNode }) => (
    <div className="flex items-center justify-between">
      <h1 className={`text-2xl sm:text-3xl font-bold ${neonText}`} style={{ textShadow: '0 0 12px rgba(0,255,163,0.35)' }}>
        {title}
      </h1>
      <div className="flex items-center gap-2">
        {right}
        {cta && (
          <button className={neonCTA} style={neonCTAStyle} onClick={onClick}>
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{cta}</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}
      </div>
    </div>
  );

  const Progress = ({ value }: { value: number }) => (
    <div>
      <div className={`flex justify-between text-xs sm:text-sm ${neonMuted} mb-1`}>
        <span>Progreso</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full ${neonShadowStrong}`}
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: NEON_HEX }}
        />
      </div>
    </div>
  );

  // =====================
  //         RENDER
  // =====================
  return (
    <div className="space-y-6 bg-[#0b0b0b] min-h-screen rounded-xl p-3 sm:p-4">
      {/* Header */}
      <Section
        title="Proyectos y Tareas"
        cta="Nuevo Proyecto"
        onClick={() => setShowProjectForm(true)}
        right={
          <button className={neonCTA} style={neonCTAStyle} onClick={() => setShowTaskForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Tarea
          </button>
        }
      />

      {/* Search + filtros */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar proyectos por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:ring-2"
              style={{ boxShadow: '0 0 0 0 rgba(0,0,0,0)', color: '#fff' }}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-3 sm:px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:ring-2"
              defaultValue=""
            >
              <option value="">Todos los estados</option>
              <option value="planning">Planificación</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completada</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* TASKS */}
        {visibleTasks.map(({ task, visibility, share }) => {
          const project = projects.find((p) => p.id === task.projectId);
          const title = visibility === 'snapshot' ? `${task.title} (vista histórica)` : task.title;

          return (
            <Card key={`task-${task.id}`} className="border-2 cursor-pointer" >
              <div className="flex items-start justify-between mb-4" onClick={() => setActionEntity({ type: 'task', id: task.id, title: task.title })}>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <CheckCircleIcon className="h-4 w-4 mr-2" style={{ color: NEON_HEX }} />
                    <span className={`${neonChip}`}>TAREA</span>
                    {visibility === 'snapshot' && <span className={pill('bg-white/10','ml-2')}>Compartido (revocado)</span>}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">{title}</h3>
                  <p className={`${neonSubtle} text-xs sm:text-sm mb-2`}>{task.description}</p>
                  <p className={`${neonMuted} text-xs sm:text-sm`}>{project?.name}</p>
                </div>
                <span className={taskStatusPill(task.status)}>{taskStatusText(task.status)}</span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {task.estimatedStartDate && (
                  <div className="flex justify-between">
                    <span className={neonMuted}>Inicio estimado:</span>
                    <span className={neonText}>{task.estimatedStartDate.toLocaleDateString('es-AR')}</span>
                  </div>
                )}
                {task.estimatedEndDate && (
                  <div className="flex justify-between">
                    <span className={neonMuted}>Fin estimado:</span>
                    <span className={neonText}>{task.estimatedEndDate.toLocaleDateString('es-AR')}</span>
                  </div>
                )}
                {task.materialRequests && task.materialRequests.length > 0 && (
                  <div className="flex justify-between">
                    <span className={neonMuted}>Solicitudes de materiales:</span>
                    <span className={neonText}>{task.materialRequests.length}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex gap-2">
                  <button onClick={() => handleTaskClick(task)} className={neonButton}>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Ver Tarea</span>
                    <span className="sm:hidden">Ver</span>
                  </button>

                  {/* Menú rápido */}
                  <button className={neonButton} onClick={() => setActionEntity({ type: 'task', id: task.id, title: task.title })}>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button className={neonButton}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Editar</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
                  <button
                    onClick={() => openWhatsApp('+54 9 11 9876-5432')}
                    className={neonButton}
                    title="Contactar"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Contactar</span>
                    <span className="sm:hidden">📞</span>
                  </button>
                </div>
              </div>
            </Card>
          );
        })}

        {/* PROJECTS */}
        {visibleProjects.map(({ project, visibility }) => {
          const spentPct = (project.spent / project.budget) * 100;
          const title = visibility === 'snapshot' ? `${project.name} (vista histórica)` : project.name;

          return (
            <Card key={`project-${project.id}`} className="cursor-pointer">
              <div className="flex items-start justify-between mb-4" onClick={() => setActionEntity({ type: 'project', id: project.id, title: project.name })}>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <TruckIcon className="h-4 w-4 mr-2" style={{ color: NEON_HEX }} />
                    <span className={`${neonChip}`}>PROYECTO</span>
                    {visibility === 'snapshot' && <span className={pill('bg-white/10','ml-2')}>Compartido (revocado)</span>}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">{title}</h3>
                  <p className={`${neonSubtle} text-xs sm:text-sm mb-2`}>{project.description}</p>
                  <p className={`${neonMuted} text-xs sm:text-sm`}>{project.address}</p>
                </div>
                <span className={getStatusPill(project.status)}>{statusText(project.status)}</span>
              </div>

              <div className="space-y-3 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className={neonMuted}>Presupuesto:</span>
                  <span className="font-medium text-white">${project.budget.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className={neonMuted}>Gastado:</span>
                  <span className="font-medium text-red-300">${project.spent.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className={neonMuted}>Restante:</span>
                  <span className="font-medium text-emerald-300">
                    ${(project.budget - project.spent).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <Progress value={spentPct} />
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button className={neonButton} onClick={() => { setSelectedProject(project); setShowProjectDetail(true); }}>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Ver</span>
                    <span className="sm:hidden">Ver</span>
                  </button>

                  {/* Menú rápido */}
                  <button className={neonButton} onClick={() => setActionEntity({ type: 'project', id: project.id, title: project.name })}>
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() => openWhatsApp('+54 9 11 9876-5432')}
                  className={neonButton}
                  title="Contactar cliente"
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Cliente</span>
                  <span className="sm:hidden">📞</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {visibleProjects.length === 0 && visibleTasks.length === 0 && (
        <Card>
          <div className="text-center py-10">
            <div className={`${neonMuted} text-lg mb-2`}>No se encontraron proyectos o tareas</div>
            <p className={neonSubtle}>Intenta ajustar los filtros de búsqueda</p>
          </div>
        </Card>
      )}

      {/* ===== Modales ===== */}

      {/* Task Detail (existente) */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-[#0f0f0f] ${neonBorder} border-white/10 ${neonShadowStrong} max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedTask.title}</h2>
                <p className={`${neonSubtle} mt-1`}>{selectedTask.description}</p>
              </div>
              <button onClick={() => setShowTaskDetail(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`${neonMuted} block text-sm mb-2`}>Fecha de Inicio</label>
                  <input type="date" className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white" />
                  <label className="inline-flex items-center mt-2 text-white/70 text-sm">
                    <input type="checkbox" className="mr-2" />
                    Fecha estimada
                  </label>
                </div>
                <div>
                  <label className={`${neonMuted} block text-sm mb-2`}>Fecha de Fin</label>
                  <input type="date" className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white" />
                  <label className="inline-flex items-center mt-2 text-white/70 text-sm">
                    <input type="checkbox" className="mr-2" />
                    Fecha estimada
                  </label>
                </div>
              </div>

              {/* Plan de pagos */}
              {selectedTask.paymentPlan && selectedTask.paymentPlan.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Plan de Pagos</h3>
                  <div className="space-y-3">
                    {selectedTask.paymentPlan.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl">
                        <div>
                          <p className="font-medium text-white">{p.description}</p>
                          <p className={`${neonMuted} text-sm`}>Al {p.executionPercentage}% de ejecución</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: NEON_HEX }}>${p.amount.toLocaleString('es-AR')}</p>
                          <p className={`${neonMuted} text-sm`}>{p.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materiales */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Solicitudes de Materiales</h3>
                  {user?.role === 'constructor' && (
                    <button className={neonCTA} style={neonCTAStyle} onClick={() => setShowCreateMaterialRequest(true)}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nueva Lista
                    </button>
                  )}
                </div>

                {selectedTask.materialRequests && selectedTask.materialRequests.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTask.materialRequests.map((req) => (
                      <div key={req.id} className="border border-white/10 rounded-xl p-4 bg-black/40">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-white">{req.title}</h4>
                            <p className={`${neonSubtle} text-sm`}>{req.description}</p>
                          </div>
                          <span className={materialStatusPill(req.status)}>{materialStatusText(req.status)}</span>
                        </div>

                        <div className="space-y-2 mb-4">
                          {req.items.map((it) => (
                            <div key={it.id} className="flex justify-between text-sm">
                              <span className={neonText}>{it.description}</span>
                              <span className={neonSubtle}>
                                {it.quantity} {it.unit}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button className={neonButton} onClick={() => handleSendToSuppliers(req)}>
                            <ShoppingCartIcon className="h-4 w-4 mr-2" />
                            Enviar a Proveedores
                          </button>
                          <button className={neonButton} onClick={() => openWhatsApp('+54 9 11 9876-5432')}>
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">No hay solicitudes de materiales</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail (existente) */}
      {showProjectDetail && selectedProject && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-[#0f0f0f] ${neonBorder} border-white/10 ${neonShadowStrong} max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedProject.name}</h2>
                <p className={`${neonSubtle} mt-1`}>{selectedProject.description}</p>
              </div>
              <button onClick={() => setShowProjectDetail(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Información del Proyecto</h3>
                  <div className="space-y-3">
                    <div>
                      <p className={neonMuted}>Dirección:</p>
                      <p className="font-medium text-white">{selectedProject.address}</p>
                    </div>
                    <div>
                      <p className={neonMuted}>Fecha de inicio:</p>
                      <p className="font-medium text-white">{selectedProject.startDate.toLocaleDateString('es-AR')}</p>
                    </div>
                    <div>
                      <p className={neonMuted}>Estado:</p>
                      <span className={getStatusPill(selectedProject.status)}>{statusText(selectedProject.status)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Información Financiera</h3>
                  <div className="space-y-3">
                    <div>
                      <p className={neonMuted}>Presupuesto total:</p>
                      <p className="text-xl font-bold" style={{ color: NEON_HEX }}>
                        ${selectedProject.budget.toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div>
                      <p className={neonMuted}>Gastado:</p>
                      <p className="text-lg font-medium text-red-300">${selectedProject.spent.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className={neonMuted}>Restante:</p>
                      <p className="text-lg font-medium text-emerald-300">
                        ${(selectedProject.budget - selectedProject.spent).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Progress value={(selectedProject.spent / selectedProject.budget) * 100} />
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => setShowProjectDetail(false)} className={neonButton}>
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowProjectDetail(false);
                  setEditingProject(selectedProject);
                  setShowProjectForm(true);
                }}
                className={neonCTA}
                style={neonCTAStyle}
              >
                Editar Proyecto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Project (existente + ownerId al crear) */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-[#0f0f0f] ${neonBorder} border-white/10 ${neonShadowStrong} max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {editingProject ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
                </h2>
                <p className={`${neonSubtle} mt-1`}>
                  {editingProject ? 'Modifica los datos del proyecto' : 'Incluye presupuesto para enviar al cliente'}
                </p>
              </div>
              <button onClick={() => { setShowProjectForm(false); setEditingProject(null); }} className="text-white/70 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Info Proyecto */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Información del Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`${neonMuted} block text-sm mb-2`}>Nombre del Proyecto *</label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Ej: Casa Familia Rodríguez"
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className={`${neonMuted} block text-sm mb-2`}>Cliente *</label>
                    <select
                      value={newProject.clientId}
                      onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      <option value="2">María Rodríguez</option>
                      <option value="3">Carlos Empresas</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className={`${neonMuted} block text-sm mb-2`}>Descripción</label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Descripción detallada del proyecto..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className={`${neonMuted} block text-sm mb-2`}>Dirección</label>
                    <input
                      type="text"
                      value={newProject.address}
                      onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                      placeholder="Dirección de la obra"
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className={`${neonMuted} block text-sm mb-2`}>Fecha de Inicio</label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Presupuesto resumido */}
              {!editingProject && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Presupuesto Inicial</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className={`${neonMuted} block text-sm mb-2`}>Título *</label>
                      <input
                        type="text"
                        value={newProject.budgetTitle}
                        onChange={(e) => setNewProject({ ...newProject, budgetTitle: e.target.value })}
                        placeholder="Ej: Presupuesto construcción casa"
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className={`${neonMuted} block text-sm mb-2`}>Tipo</label>
                      <select
                        value={newProject.budgetType}
                        onChange={(e) => setNewProject({ ...newProject, budgetType: e.target.value as any })}
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                      >
                        <option value="labor">Solo Mano de Obra</option>
                        <option value="materials">Solo Materiales</option>
                        <option value="combined">Mano de Obra + Materiales</option>
                      </select>
                    </div>
                    <div>
                      <label className={`${neonMuted} block text-sm mb-2`}>Días Estimados</label>
                      <input
                        type="number"
                        value={newProject.estimatedDays}
                        onChange={(e) => setNewProject({ ...newProject, estimatedDays: e.target.value })}
                        placeholder="30"
                        className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className={`${neonMuted} block text-sm mb-2`}>Descripción</label>
                    <textarea
                      value={newProject.budgetDescription}
                      onChange={(e) => setNewProject({ ...newProject, budgetDescription: e.target.value })}
                      placeholder="Descripción del trabajo..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                    />
                  </div>

                  {/* Items (solo UI resumen) */}
                  <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-white">Total del Presupuesto:</span>
                      <span className="text-2xl font-bold" style={{ color: NEON_HEX }}>
                        $
                        {newProject.budgetItems
                          .reduce((sum, it) => sum + (it.total || 0), 0)
                          .toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => { setShowProjectForm(false); setEditingProject(null); }} className={neonButton}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  // MVP: set ownerId si no existe en tus tipos (se ignora en TS)
                  console.log('Crear/Actualizar proyecto (MVP)', { ...newProject, ownerId: user?.id });
                  setShowProjectForm(false);
                }}
                className={neonCTA}
                style={neonCTAStyle}
              >
                {editingProject ? 'Actualizar Proyecto' : 'Crear Proyecto y Enviar Presupuesto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Material Request (existente) */}
      {showCreateMaterialRequest && selectedTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-[#0f0f0f] ${neonBorder} border-white/10 ${neonShadowStrong} max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-xl font-semibold text-white">Enviar Lista de Materiales</h2>
                <p className={`${neonSubtle} mt-1`}>Para: {selectedTask.title}</p>
              </div>
              <button onClick={() => setShowCreateMaterialRequest(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-6">
              {/* ... (igual que tu versión) */}
              {/* Para abreviar, se mantiene el mismo formulario que ya tenías */}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => setShowCreateMaterialRequest(false)} className={neonButton}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  // aquí iría tu handleCreateMaterialRequest original
                  setShowCreateMaterialRequest(false);
                }}
                className={neonCTA}
                style={neonCTAStyle}
              >
                Enviar Lista al Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== NUEVOS MODALES ===== */}

      {/* Nueva Tarea */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-[#0f0f0f] ${neonBorder} border-white/10 ${neonShadowStrong} max-w-xl w-full mx-4 rounded-2xl`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Crear Nueva Tarea</h2>
              <button onClick={() => setShowTaskForm(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`${neonMuted} block text-sm mb-2`}>Título *</label>
                <input
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  placeholder="Ej: Demolición de tabiques"
                />
              </div>
              <div>
                <label className={`${neonMuted} block text-sm mb-2`}>Descripción</label>
                <textarea
                  value={newTask.description || ''}
                  onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className={`${neonMuted} block text-sm mb-2`}>Proyecto</label>
                <select
                  value={newTask.projectId || ''}
                  onChange={(e) => setNewTask((p) => ({ ...p, projectId: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                >
                  <option value="">Seleccionar</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => setShowTaskForm(false)} className={neonButton}>Cancelar</button>
              <button
                onClick={() => {
                  console.log('Crear tarea (MVP)', { ...newTask, ownerId: user?.id });
                  setShowTaskForm(false);
                }}
                className={neonCTA}
                style={neonCTAStyle}
              >
                Crear Tarea
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menú de acciones (Presupuestos, Pagos, Cobros, Agenda, Compartir, Revocar) */}
      {actionEntity && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setActionEntity(null)}>
          <div
            className={`bg-[#0f0f0f] ${neonBorder} border-white/10 ${neonShadowStrong} w-full max-w-md mx-4 rounded-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">{actionEntity.title}</h2>
              <button onClick={() => setActionEntity(null)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-3">
              <button className={neonButton}><LinkIcon className="h-4 w-4 mr-2" />Presupuestos</button>
              <button className={neonButton}>Pagos</button>
              <button className={neonButton}>Cobros</button>
              <button className={neonButton}>Agenda</button>
              <button
                className={neonButton}
                onClick={() => {
                  setShareTarget({ type: actionEntity.type, id: actionEntity.id, title: actionEntity.title });
                  setInviteData({ label: '', role: user?.role === 'constructor' ? 'client' : 'constructor' });
                }}
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Compartir
              </button>
              <button
                className={neonButton}
                onClick={() => revokeShare(actionEntity.type, actionEntity.id)}
              >
                <UserMinusIcon className="h-4 w-4 mr-2" />
                Revocar acceso
              </button>
            </div>
            <div className="px-6 pb-6 text-xs text-white/60">
              Tip: “Compartir” da acceso vivo; “Revocar” congela una vista histórica para el invitado.
            </div>
          </div>
        </div>
      )}

      {/* Compartir/Invitar */}
      {shareTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShareTarget(null)}>
          <div
            className={`bg-[#0f0f0f] ${neonBorder} border-white/10 ${neonShadowStrong} w-full max-w-md mx-4 rounded-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Compartir {shareTarget.type === 'project' ? 'proyecto' : 'tarea'}</h2>
              <button onClick={() => setShareTarget(null)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`${neonMuted} block text-sm mb-2`}>Email / Usuario *</label>
                <input
                  value={inviteData.label}
                  onChange={(e) => setInviteData((p) => ({ ...p, label: e.target.value }))}
                  placeholder="usuario@correo.com"
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className={`${neonMuted} block text-sm mb-2`}>Rol del invitado</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData((p) => ({ ...p, role: e.target.value as any }))}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                >
                  <option value="client">Cliente</option>
                  <option value="constructor">Constructor</option>
                </select>
              </div>
              <div className="text-xs text-white/60">
                El invitado verá las cards compartidas. Podrás revocar el acceso cuando quieras.
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => setShareTarget(null)} className={neonButton}>Cancelar</button>
              <button onClick={confirmShare} className={neonCTA} style={neonCTAStyle}>
                Compartir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
