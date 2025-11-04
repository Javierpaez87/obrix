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
} from '@heroicons/react/24/outline';

// =====================
// 🎨 Neon theme helpers
// =====================
const NEON_HEX = '#00FFA3'; // verde neón referencia
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

// badge helpers (estatus)
const pill = (bg = 'bg-white/5', extra = '') =>
  `inline-flex px-2 py-1 text-[10px] font-medium rounded-full border border-white/10 ${bg} ${extra}`;

// =====================

const Projects: React.FC = () => {
  const { projects, tasks, user, setProjects, budgets, setBudgets } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [showCreateMaterialRequest, setShowCreateMaterialRequest] = useState(false);
  const [showProvidersList, setShowProvidersList] = useState(false);

  // Form estados
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

  // =====================
  //   Computados / utils
  // =====================
  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.address.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [projects, searchTerm]
  );

  const projectTasks = useMemo(
    () => tasks.filter((t) => (user?.role === 'client' ? t.requestedBy === user?.id : true)),
    [tasks, user]
  );

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
  const handleMarkAsPurchased = (req: MaterialRequest) => console.log('Marcando como comprado:', req.title);
  const handleMarkAsDelivered = (req: MaterialRequest) => console.log('Marcando como entregado:', req.title);

  const addMaterialItem = () =>
    setNewMaterialRequest((prev) => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, unit: 'unidad', specifications: '', brand: '' }],
    }));

  const removeMaterialItem = (index: number) =>
    setNewMaterialRequest((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }));

  const handleCreateMaterialRequest = () => {
    if (selectedTask && newMaterialRequest.title && newMaterialRequest.items.some((i) => i.description)) {
      const materialRequest: MaterialRequest = {
        id: Date.now().toString(),
        taskId: selectedTask.id,
        projectId: selectedTask.projectId,
        title: newMaterialRequest.title,
        description: newMaterialRequest.description,
        items: newMaterialRequest.items.filter((i) => i.description),
        status: 'sent_to_client',
        requestedBy: user?.id || '1',
        requestedAt: new Date(),
        estimatedDeliveryDate: newMaterialRequest.estimatedDeliveryDate ? new Date(newMaterialRequest.estimatedDeliveryDate) : undefined,
        notes: newMaterialRequest.notes,
      };
      console.log('Nueva solicitud de materiales:', materialRequest);
      setNewMaterialRequest({
        title: '',
        description: '',
        items: [{ id: '1', description: '', quantity: 1, unit: 'unidad', specifications: '', brand: '' }],
        notes: '',
        estimatedDeliveryDate: '',
      });
      setShowCreateMaterialRequest(false);
    }
  };

  // ====== helpers mínimos para presupuesto/proyecto (para compilar) ======
  const addBudgetItem = () =>
    setNewProject((prev) => ({
      ...prev,
      budgetItems: [...prev.budgetItems, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0, category: '' }],
    }));

  const removeBudgetItem = (index: number) =>
    setNewProject((prev) => ({
      ...prev,
      budgetItems: prev.budgetItems.length > 1 ? prev.budgetItems.filter((_, i) => i !== index) : prev.budgetItems,
    }));

  const updateBudgetItemTotal = (index: number, quantity: number, unitPrice: number) =>
    setNewProject((prev) => {
      const copy = [...prev.budgetItems];
      copy[index] = { ...copy[index], quantity, unitPrice, total: (quantity || 0) * (unitPrice || 0) };
      return { ...prev, budgetItems: copy };
    });

  const handleCreateProject = () => {
    // Hook para tu lógica real (Firestore, etc.)
    console.log('Crear/Enviar presupuesto (MVP)', newProject);
    setShowProjectForm(false);
  };

  const handleEditProject = (p: Project) => {
    setEditingProject(p);
    setShowProjectForm(true);
  };

  // ====== UI components mini (inline) ======
  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div
      className={`bg-black/60 ${neonBorder} border-white/10 ${neonText} p-4 sm:p-6 ${className || ''}`}
      style={{ borderColor: NEON_HEX }}
    >
      {children}
    </div>
  );

  const Section = ({ title, cta, onClick }: { title: string; cta?: string; onClick?: () => void }) => (
    <div className="flex items-center justify-between">
      <h1 className={`text-2xl sm:text-3xl font-bold ${neonText}`} style={{ textShadow: '0 0 12px rgba(0,255,163,0.35)' }}>
        {title}
      </h1>
      {cta && (
        <button className={neonCTA} style={neonCTAStyle} onClick={onClick}>
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{cta}</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      )}
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
      <Section title="Proyectos y Tareas" cta="Nuevo Proyecto" onClick={() => setShowProjectForm(true)} />

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
        {projectTasks.map((task) => {
          const project = projects.find((p) => p.id === task.projectId);
          return (
            <Card key={task.id} className="border-2" >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <CheckCircleIcon className="h-4 w-4 mr-2" style={{ color: NEON_HEX }} />
                    <span className={`${neonChip}`}>TAREA</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">{task.title}</h3>
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
                <button onClick={() => handleTaskClick(task)} className={neonButton}>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Ver Tarea</span>
                  <span className="sm:hidden">Ver</span>
                </button>
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
        {filteredProjects.map((project) => {
          const spentPct = (project.spent / project.budget) * 100;
          return (
            <Card key={project.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <TruckIcon className="h-4 w-4 mr-2" style={{ color: NEON_HEX }} />
                    <span className={`${neonChip}`}>PROYECTO</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-1">{project.name}</h3>
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

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex gap-2">
                  <button className={neonButton} onClick={() => { setSelectedProject(project); setShowProjectDetail(true); }}>
                    <EyeIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Ver</span>
                    <span className="sm:hidden">Ver</span>
                  </button>
                  <button className={neonButton} onClick={() => handleEditProject(project)}>
                    <PencilIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Editar</span>
                    <span className="sm:hidden">Edit</span>
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

      {filteredProjects.length === 0 && projectTasks.length === 0 && (
        <Card>
          <div className="text-center py-10">
            <div className={`${neonMuted} text-lg mb-2`}>No se encontraron proyectos</div>
            <p className={neonSubtle}>Intenta ajustar los filtros de búsqueda</p>
          </div>
        </Card>
      )}

      {/* ===== Modales ===== */}

      {/* Task Detail */}
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
                          {user?.role === 'client' && req.status === 'sent_to_client' && (
                            <button className={neonButton} onClick={() => handleSendToSuppliers(req)}>
                              <ShoppingCartIcon className="h-4 w-4 mr-2" />
                              Enviar a Proveedores
                            </button>
                          )}
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

      {/* Project Detail */}
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
                  handleEditProject(selectedProject);
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

      {/* Create/Edit Project */}
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

              {/* Presupuesto resumido (optimo) */}
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

                  {/* Items */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`${neonSubtle} text-sm font-medium`}>Detalle del Presupuesto</h4>
                      <button type="button" onClick={addBudgetItem} className={neonButton}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Agregar Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {newProject.budgetItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-black/30 border border-white/10 rounded-xl">
                          <div className="col-span-4">
                            <label className={`${neonMuted} block text-xs mb-1`}>Descripción</label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const items = [...newProject.budgetItems];
                                items[index].description = e.target.value;
                                setNewProject({ ...newProject, budgetItems: items });
                              }}
                              className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-white/10 text-white"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <label className={`${neonMuted} block text-xs mb-1`}>Cantidad</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const qty = parseFloat(e.target.value) || 0;
                                const items = [...newProject.budgetItems];
                                items[index].quantity = qty;
                                setNewProject({ ...newProject, budgetItems: items });
                                updateBudgetItemTotal(index, qty, item.unitPrice);
                              }}
                              className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-white/10 text-white"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <label className={`${neonMuted} block text-xs mb-1`}>Precio Unit.</label>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const up = parseFloat(e.target.value) || 0;
                                const items = [...newProject.budgetItems];
                                items[index].unitPrice = up;
                                setNewProject({ ...newProject, budgetItems: items });
                                updateBudgetItemTotal(index, item.quantity, up);
                              }}
                              className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-white/10 text-white"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <label className={`${neonMuted} block text-xs mb-1`}>Categoría</label>
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => {
                                const items = [...newProject.budgetItems];
                                items[index].category = e.target.value;
                                setNewProject({ ...newProject, budgetItems: items });
                              }}
                              className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-white/10 text-white"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className={`${neonMuted} block text-xs mb-1`}>Total</label>
                            <div className="px-3 py-2 text-sm bg-black/30 border border-white/10 rounded-md text-white">
                              ${item.total.toLocaleString('es-AR')}
                            </div>
                          </div>

                          <div className="col-span-1">
                            <button
                              type="button"
                              onClick={() => removeBudgetItem(index)}
                              className="p-2 text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                              disabled={newProject.budgetItems.length === 1}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

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

                  <div>
                    <label className={`${neonMuted} block text-sm mb-2`}>Notas</label>
                    <textarea
                      value={newProject.budgetNotes}
                      onChange={(e) => setNewProject({ ...newProject, budgetNotes: e.target.value })}
                      placeholder="Condiciones, observaciones..."
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => { setShowProjectForm(false); setEditingProject(null); }} className={neonButton}>
                Cancelar
              </button>
              <button onClick={handleCreateProject} className={neonCTA} style={neonCTAStyle}>
                {editingProject ? 'Actualizar Proyecto' : 'Crear Proyecto y Enviar Presupuesto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Material Request */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`${neonMuted} block text-sm mb-2`}>Título de la Lista *</label>
                  <input
                    type="text"
                    value={newMaterialRequest.title}
                    onChange={(e) => setNewMaterialRequest({ ...newMaterialRequest, title: e.target.value })}
                    placeholder="Ej: Materiales para fundación"
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className={`${neonMuted} block text-sm mb-2`}>Fecha Estimada de Entrega</label>
                  <input
                    type="date"
                    value={newMaterialRequest.estimatedDeliveryDate}
                    onChange={(e) => setNewMaterialRequest({ ...newMaterialRequest, estimatedDeliveryDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className={`${neonMuted} block text-sm mb-2`}>Descripción</label>
                <textarea
                  value={newMaterialRequest.description}
                  onChange={(e) => setNewMaterialRequest({ ...newMaterialRequest, description: e.target.value })}
                  placeholder="Descripción general de los materiales necesarios..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                />
              </div>

              {/* Lista de Materiales */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Lista de Materiales</h3>
                  <button type="button" onClick={addMaterialItem} className={neonButton}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Agregar Material
                  </button>
                </div>

                <div className="space-y-3">
                  {newMaterialRequest.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-black/30 border border-white/10 rounded-xl">
                      <div className="col-span-4">
                        <label className={`${neonMuted} block text-xs mb-1`}>Material *</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const items = [...newMaterialRequest.items];
                            items[index].description = e.target.value;
                            setNewMaterialRequest({ ...newMaterialRequest, items });
                          }}
                          placeholder="Ej: Cemento Portland"
                          className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-white/10 text-white"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className={`${neonMuted} block text-xs mb-1`}>Cantidad *</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const items = [...newMaterialRequest.items];
                            items[index].quantity = parseFloat(e.target.value) || 0;
                            setNewMaterialRequest({ ...newMaterialRequest, items });
                          }}
                          className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-white/10 text-white"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className={`${neonMuted} block text-xs mb-1`}>Unidad</label>
                        <select
                          value={item.unit}
                          onChange={(e) => {
                            const items = [...newMaterialRequest.items];
                            items[index].unit = e.target.value;
                            setNewMaterialRequest({ ...newMaterialRequest, items });
                          }}
                          className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-white/10 text-white"
                        >
                          <option value="unidad">unidad</option>
                          <option value="kg">kg</option>
                          <option value="m">m</option>
                          <option value="m²">m²</option>
                          <option value="m³">m³</option>
                          <option value="litros">litros</option>
                          <option value="bolsas">bolsas</option>
                          <option value="cajas">cajas</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className={`${neonMuted} block text-xs mb-1`}>Especificaciones</label>
                        <input
                          type="text"
                          value={item.specifications}
                          onChange={(e) => {
                            const items = [...newMaterialRequest.items];
                            items[index].specifications = e.target.value;
                            setNewMaterialRequest({ ...newMaterialRequest, items });
                          }}
                          placeholder="Ej: 50kg"
                          className="w-full px-3 py-2 text-sm rounded-md bg-black/40 border border-white/10 text-white"
                        />
                      </div>

                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeMaterialItem(index)}
                          className="p-2 text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                          disabled={newMaterialRequest.items.length === 1}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={`${neonMuted} block text-sm mb-2`}>Notas Adicionales</label>
                <textarea
                  value={newMaterialRequest.notes}
                  onChange={(e) => setNewMaterialRequest({ ...newMaterialRequest, notes: e.target.value })}
                  placeholder="Observaciones especiales, urgencia, etc..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => setShowCreateMaterialRequest(false)} className={neonButton}>
                Cancelar
              </button>
              <button onClick={handleCreateMaterialRequest} className={neonCTA} style={neonCTAStyle}>
                Enviar Lista al Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Providers (placeholder UI, igual estilo) */}
      {showProvidersList && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`bg-[#0f0f0f] ${neonBorder} border-white/10 ${neonShadowStrong} max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto rounded-2xl`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Proveedores de Materiales</h2>
              <button onClick={() => setShowProvidersList(false)} className="text-white/70 hover:text-white">✕</button>
            </div>
            <div className="p-6">
              <p className={`${neonSubtle} mb-4`}>Selecciona proveedores de tu agenda para enviar la lista por WhatsApp:</p>
              <div className="space-y-3">
                {[
                  { name: 'Corralón Central', phone: '+54 9 11 2345-6789' },
                  { name: 'Ferretería MN', phone: '+54 9 11 3456-7890' },
                ].map((p) => (
                  <div key={p.phone} className="flex items-center justify-between p-3 bg-black/30 border border-white/10 rounded-xl">
                    <div>
                      <p className="font-medium text-white">{p.name}</p>
                      <p className={`${neonSubtle} text-sm`}>{p.phone}</p>
                    </div>
                    <button className={neonCTA} style={neonCTAStyle} onClick={() => openWhatsApp(p.phone)}>
                      WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
