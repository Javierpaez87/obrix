import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BudgetRequest } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  requestType?: 'constructor' | 'supplier';
}

const RequestForm: React.FC<RequestFormProps> = ({ isOpen, onClose, projectId, requestType = 'constructor' }) => {
  const { budgetRequests, setBudgetRequests, projects, user } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    priority: 'medium' as const,
    dueDate: '',
    type: 'combined' as 'labor' | 'materials' | 'combined'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRequest: BudgetRequest = {
      id: Date.now().toString(),
      projectId: formData.projectId,
      title: formData.title,
      description: formData.description,
      requestedBy: user?.id || '',
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      status: 'pending',
      createdAt: new Date(),
      requestType: requestType
    };

    setBudgetRequests([...budgetRequests, newRequest]);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      projectId: projectId || '',
      priority: 'medium',
      dueDate: '',
      type: 'combined'
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {requestType === 'constructor' ? 'Solicitar Presupuesto a Constructor' : 'Solicitar Presupuesto de Materiales'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {requestType === 'constructor' ? 'Mano de obra y/o materiales' : 'Corralones, ferreterías, etc.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de Presupuesto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Presupuesto
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {requestType === 'constructor' ? (
                <>
                  <option value="labor">Solo Mano de Obra</option>
                  <option value="combined">Mano de Obra + Materiales</option>
                </>
              ) : (
                <option value="materials">Solo Materiales</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obra
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar obra</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {requestType === 'constructor' ? 'Título del Trabajo' : 'Lista de Materiales'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={requestType === 'constructor' ? 'Ej: Colocación de cerámicos' : 'Ej: Materiales para fundación'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Detallada
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={
                requestType === 'constructor' 
                  ? 'Describe en detalle lo que necesitas: superficie, especificaciones técnicas, materiales incluidos, etc.'
                  : 'Lista detallada de materiales: cantidades, especificaciones, marcas preferidas, etc.'
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Límite (Opcional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;