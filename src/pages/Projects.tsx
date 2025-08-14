import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, MaterialRequest } from '../types';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';

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
  const [newMaterialRequest, setNewMaterialRequest] = useState({
    title: '',
    description: '',
    items: [{ id: '1', description: '', quantity: 1, unit: 'unidad', specifications: '', brand: '' }],
    notes: '',
    estimatedDeliveryDate: ''
  });

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    clientId: '',
    address: '',
    budget: '',
    startDate: '',
    // Presupuesto incluido
    budgetTitle: '',
    budgetDescription: '',
    budgetType: 'combined' as const,
    estimatedDays: '',
    budgetItems: [
      { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0, category: '' }
    ],
    budgetNotes: ''
  });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const projectTasks = tasks.filter(task => 
    user?.role === 'client' ? task.requestedBy === user?.id : true
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Planificación';
      case 'in_progress': return 'En Progress';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getMaterialStatusColor = (status: string) => {
    switch (status) {
      case 'sent_to_client': return 'bg-blue-100 text-blue-800';
      case 'sent_to_suppliers': return 'bg-yellow-100 text-yellow-800';
      case 'purchased': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaterialStatusText = (status: string) => {
    switch (status) {
      case 'sent_to_client': return 'Enviado al Cliente';
      case 'sent_to_suppliers': return 'Enviado a Proveedores';
      case 'purchased': return 'Comprado';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };
  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleSendToSuppliers = (request: MaterialRequest) => {
    // Actualizar estado a 'sent_to_suppliers'
    console.log('Enviando a proveedores:', request.title);
    // Aquí se actualizaría el estado en el contexto
  };

  const handleMarkAsPurchased = (request: MaterialRequest) => {
    // Actualizar estado a 'purchased'
    console.log('Marcando como comprado:', request.title);
  };

  const handleMarkAsDelivered = (request: MaterialRequest) => {
    // Actualizar estado a 'delivered'
    console.log('Marcando como entregado:', request.title);
  };

  const openMaterialWhatsApp = (request: MaterialRequest) => {
    const phone = user?.role === 'client' ? '+54 9 11 1234-5678' : '+54 9 11 9876-5432';
    const itemsList = request.items.map(item => 
      `• ${item.description} - ${item.quantity} ${item.unit}${item.specifications ? ` (${item.specifications})` : ''}${item.brand ? ` - ${item.brand}` : ''}`
    ).join('\n');
    
    const message = `Hola! Sobre la lista de materiales: ${request.title}\n\n${itemsList}\n\n¿Podrías cotizar estos materiales?`;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const addMaterialItem = () => {
    setNewMaterialRequest({
      ...newMaterialRequest,
      items: [...newMaterialRequest.items, {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unit: 'unidad',
        specifications: '',
        brand: ''
      }]
    });
  };

  const removeMaterialItem = (index: number) => {
    if (newMaterialRequest.items.length > 1) {
      setNewMaterialRequest({
        ...newMaterialRequest,
        items: newMaterialRequest.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleCreateMaterialRequest = () => {
    if (selectedTask && newMaterialRequest.title && newMaterialRequest.items.some(item => item.description)) {
      const materialRequest: MaterialRequest = {
        id: Date.now().toString(),
        taskId: selectedTask.id,
        projectId: selectedTask.projectId,
        title: newMaterialRequest.title,
        description: newMaterialRequest.description,
        items: newMaterialRequest.items.filter(item => item.description),
        status: 'sent_to_client',
        requestedBy: user?.id || '1',
        requestedAt: new Date(),
        estimatedDeliveryDate: newMaterialRequest.estimatedDeliveryDate ? new Date(newMaterialRequest.estimatedDeliveryDate) : undefined,
        notes: newMaterialRequest.notes
      };

      // Aquí se agregaría al contexto
      console.log('Nueva solicitud de materiales:', materialRequest);
      
      // Reset form
      setNewMaterialRequest({
        title: '',
        description: '',
        items: [{ id: '1', description: '', quantity: 1, unit: 'unidad', specifications: '', brand: '' }],
        notes: '',
        estimatedDeliveryDate: ''
      });
      setShowCreateMaterialRequest(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Proyectos y Tareas</h1>
        <button className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Nuevo Proyecto</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar proyectos por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base">
              <option value="">Todos los estados</option>
              <option value="planning">Planificación</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects and Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Tasks from approved budgets */}
        {projectTasks.map((task) => {
          const project = projects.find(p => p.id === task.projectId);
          return (
            <div key={task.id} className="bg-white rounded-lg shadow-sm border-2 border-green-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-xs font-medium text-green-600">TAREA</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{task.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">{task.description}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{project?.name}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTaskStatusColor(task.status)}`}>
                  {getTaskStatusText(task.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {task.estimatedStartDate && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Inicio estimado:</span>
                    <span className="text-gray-900">{task.estimatedStartDate.toLocaleDateString('es-AR')}</span>
                  </div>
                )}
                {task.estimatedEndDate && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Fin estimado:</span>
                    <span className="text-gray-900">{task.estimatedEndDate.toLocaleDateString('es-AR')}</span>
                  </div>
                )}
                {task.materialRequests && task.materialRequests.length > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Solicitudes de materiales:</span>
                    <span className="text-gray-900">{task.materialRequests.length}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex gap-1 sm:gap-2">
                  <button 
                    onClick={() => handleTaskClick(task)}
                    className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors flex-1 sm:flex-none"
                  >
                    <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Ver Tarea</span>
                  </button>
                  <button className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex-1 sm:flex-none">
                    <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                </div>
                <button 
                  onClick={() => openWhatsApp('+54 9 11 9876-5432')}
                  className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                  title="Contactar"
                >
                  <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Contactar</span>
                  <span className="sm:hidden">📞</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Regular Projects */}
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <TruckIcon className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-xs font-medium text-blue-600">PROYECTO</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">{project.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">{project.description}</p>
                <p className="text-xs sm:text-sm text-gray-500">{project.address}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Presupuesto:</span>
                <span className="font-medium text-gray-900">${project.budget.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Gastado:</span>
                <span className="font-medium text-red-600">${project.spent.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Restante:</span>
                <span className="font-medium text-green-600">
                  ${(project.budget - project.spent).toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{Math.round((project.spent / project.budget) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex gap-1 sm:gap-2">
                <button className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors flex-1 sm:flex-none">
                  <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Ver</span>
                </button>
                <button className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors flex-1 sm:flex-none">
                  <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Editar</span>
                </button>
              </div>
              <button 
                onClick={() => openWhatsApp('+54 9 11 9876-5432')}
                className="flex items-center justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                title="Contactar cliente"
              >
                <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Cliente</span>
                <span className="sm:hidden">📞</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && projectTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No se encontraron proyectos</div>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedTask.description}</p>
              </div>
              <button
                onClick={() => setShowTaskDetail(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <label className="inline-flex items-center mt-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2 text-sm text-gray-600">Fecha estimada</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <label className="inline-flex items-center mt-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2 text-sm text-gray-600">Fecha estimada</span>
                  </label>
                </div>
              </div>

              {/* Payment Plan */}
              {selectedTask.paymentPlan && selectedTask.paymentPlan.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Plan de Pagos</h3>
                  <div className="space-y-3">
                    {selectedTask.paymentPlan.map((payment, index) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{payment.description}</p>
                          <p className="text-sm text-gray-600">Al {payment.executionPercentage}% de ejecución</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${payment.amount.toLocaleString('es-AR')}</p>
                          <p className="text-sm text-gray-500">{payment.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Requests */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Solicitudes de Materiales</h3>
                  {user?.role === 'constructor' && (
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nueva Lista
                    </button>
                  )}
                </div>

                {selectedTask.materialRequests && selectedTask.materialRequests.length > 0 ? (
                  <div className="space-y-4">
                    {selectedTask.materialRequests.map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{request.title}</h4>
                            <p className="text-sm text-gray-600">{request.description}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMaterialStatusColor(request.status)}`}>
                            {getMaterialStatusText(request.status)}
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          {request.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.description}</span>
                              <span>{item.quantity} {item.unit}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          {user?.role === 'client' && request.status === 'sent_to_client' && (
                            <button className="flex items-center px-3 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
                              <ShoppingCartIcon className="h-4 w-4 mr-1" />
                              Enviar a Proveedores
                            </button>
                          )}
                          <button className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No hay solicitudes de materiales
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Project Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProject ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {editingProject ? 'Modifica los datos del proyecto' : 'Incluye presupuesto para enviar al cliente'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  setEditingProject(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Información del Proyecto */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Proyecto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Proyecto *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Ej: Casa Familia Rodríguez"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente *
                    </label>
                    <select
                      value={newProject.clientId}
                      onChange={(e) => setNewProject({ ...newProject, clientId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      <option value="2">María Rodríguez</option>
                      <option value="3">Carlos Empresas</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Descripción detallada del proyecto..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={newProject.address}
                      onChange={(e) => setNewProject({ ...newProject, address: e.target.value })}
                      placeholder="Dirección de la obra"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      value={newProject.startDate}
                      onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Presupuesto (solo para nuevos proyectos) */}
              {!editingProject && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Presupuesto Inicial</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Presupuesto *
                      </label>
                      <input
                        type="text"
                        value={newProject.budgetTitle}
                        onChange={(e) => setNewProject({ ...newProject, budgetTitle: e.target.value })}
                        placeholder="Ej: Presupuesto construcción casa"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Presupuesto
                      </label>
                      <select
                        value={newProject.budgetType}
                        onChange={(e) => setNewProject({ ...newProject, budgetType: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="labor">Solo Mano de Obra</option>
                        <option value="materials">Solo Materiales</option>
                        <option value="combined">Mano de Obra + Materiales</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Días Estimados
                      </label>
                      <input
                        type="number"
                        value={newProject.estimatedDays}
                        onChange={(e) => setNewProject({ ...newProject, estimatedDays: e.target.value })}
                        placeholder="30"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción del Presupuesto
                    </label>
                    <textarea
                      value={newProject.budgetDescription}
                      onChange={(e) => setNewProject({ ...newProject, budgetDescription: e.target.value })}
                      placeholder="Descripción detallada del trabajo a realizar..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Items del Presupuesto */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-700">Detalle del Presupuesto</h4>
                      <button
                        type="button"
                        onClick={addBudgetItem}
                        className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Agregar Item
                      </button>
                    </div>

                    <div className="space-y-3">
                      {newProject.budgetItems.map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-lg">
                          <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Descripción
                            </label>
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...newProject.budgetItems];
                                newItems[index].description = e.target.value;
                                setNewProject({ ...newProject, budgetItems: newItems });
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Cantidad
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const quantity = parseFloat(e.target.value) || 0;
                                const newItems = [...newProject.budgetItems];
                                newItems[index].quantity = quantity;
                                setNewProject({ ...newProject, budgetItems: newItems });
                                updateBudgetItemTotal(index, quantity, item.unitPrice);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Precio Unit.
                            </label>
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const unitPrice = parseFloat(e.target.value) || 0;
                                const newItems = [...newProject.budgetItems];
                                newItems[index].unitPrice = unitPrice;
                                setNewProject({ ...newProject, budgetItems: newItems });
                                updateBudgetItemTotal(index, item.quantity, unitPrice);
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Categoría
                            </label>
                            <input
                              type="text"
                              value={item.category}
                              onChange={(e) => {
                                const newItems = [...newProject.budgetItems];
                                newItems[index].category = e.target.value;
                                setNewProject({ ...newProject, budgetItems: newItems });
                              }}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>

                          <div className="col-span-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Total
                            </label>
                            <div className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md">
                              ${item.total.toLocaleString('es-AR')}
                            </div>
                          </div>

                          <div className="col-span-1">
                            <button
                              type="button"
                              onClick={() => removeBudgetItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              disabled={newProject.budgetItems.length === 1}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-900">Total del Presupuesto:</span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${newProject.budgetItems.reduce((sum, item) => sum + item.total, 0).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas del Presupuesto
                    </label>
                    <textarea
                      value={newProject.budgetNotes}
                      onChange={(e) => setNewProject({ ...newProject, budgetNotes: e.target.value })}
                      placeholder="Condiciones especiales, garantías, observaciones..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowProjectForm(false);
                  setEditingProject(null);
                }}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProject ? 'Actualizar Proyecto' : 'Crear Proyecto y Enviar Presupuesto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetail && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setShowProjectDetail(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Proyecto</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Dirección:</p>
                      <p className="font-medium text-gray-900">{selectedProject.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de inicio:</p>
                      <p className="font-medium text-gray-900">{selectedProject.startDate.toLocaleDateString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado:</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedProject.status)}`}>
                        {getStatusText(selectedProject.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información Financiera</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Presupuesto total:</p>
                      <p className="text-xl font-bold text-blue-600">${selectedProject.budget.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gastado:</p>
                      <p className="text-lg font-medium text-red-600">${selectedProject.spent.toLocaleString('es-AR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Restante:</p>
                      <p className="text-lg font-medium text-green-600">${(selectedProject.budget - selectedProject.spent).toLocaleString('es-AR')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso del Presupuesto</span>
                  <span>{Math.round((selectedProject.spent / selectedProject.budget) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full" 
                    style={{ width: `${Math.min((selectedProject.spent / selectedProject.budget) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowProjectDetail(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowProjectDetail(false);
                  handleEditProject(selectedProject);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar Proyecto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Material Request Modal */}
      {showCreateMaterialRequest && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Enviar Lista de Materiales</h2>
                <p className="text-sm text-gray-600 mt-1">Para: {selectedTask.title}</p>
              </div>
              <button
                onClick={() => setShowCreateMaterialRequest(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Lista *
                  </label>
                  <input
                    type="text"
                    value={newMaterialRequest.title}
                    onChange={(e) => setNewMaterialRequest({ ...newMaterialRequest, title: e.target.value })}
                    placeholder="Ej: Materiales para fundación"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Estimada de Entrega
                  </label>
                  <input
                    type="date"
                    value={newMaterialRequest.estimatedDeliveryDate}
                    onChange={(e) => setNewMaterialRequest({ ...newMaterialRequest, estimatedDeliveryDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={newMaterialRequest.description}
                  onChange={(e) => setNewMaterialRequest({ ...newMaterialRequest, description: e.target.value })}
                  placeholder="Descripción general de los materiales necesarios..."
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Lista de Materiales */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Lista de Materiales</h3>
                  <button
                    type="button"
                    onClick={addMaterialItem}
                    className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar Material
                  </button>
                </div>

                <div className="space-y-3">
                  {newMaterialRequest.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-lg">
                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Material *
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...newMaterialRequest.items];
                            newItems[index].description = e.target.value;
                            setNewMaterialRequest({ ...newMaterialRequest, items: newItems });
                          }}
                          placeholder="Ej: Cemento Portland"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...newMaterialRequest.items];
                            newItems[index].quantity = parseFloat(e.target.value) || 0;
                            setNewMaterialRequest({ ...newMaterialRequest, items: newItems });
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Unidad
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => {
                            const newItems = [...newMaterialRequest.items];
                            newItems[index].unit = e.target.value;
                            setNewMaterialRequest({ ...newMaterialRequest, items: newItems });
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Especificaciones
                        </label>
                        <input
                          type="text"
                          value={item.specifications}
                          onChange={(e) => {
                            const newItems = [...newMaterialRequest.items];
                            newItems[index].specifications = e.target.value;
                            setNewMaterialRequest({ ...newMaterialRequest, items: newItems });
                          }}
                          placeholder="Ej: 50kg"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeMaterialItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={newMaterialRequest.notes}
                  onChange={(e) => setNewMaterialRequest({ ...newMaterialRequest, notes: e.target.value })}
                  placeholder="Observaciones especiales, urgencia, etc..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateMaterialRequest(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateMaterialRequest}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar Lista al Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Providers List Modal */}
      {showProvidersList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Proveedores de Materiales</h2>
              <button
                onClick={() => setShowProvidersList(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Selecciona proveedores de tu agenda para enviar la lista por WhatsApp:</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Corralón Central</p>
                    <p className="text-sm text-gray-600">+54 9 11 2345-6789</p>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    WhatsApp
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Ferretería MN</p>
                    <p className="text-sm text-gray-600">+54 9 11 3456-7890</p>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;