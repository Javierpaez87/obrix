import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget, BudgetItem, PaymentPlanItem } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface QuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ isOpen, onClose, requestId }) => {
  const { budgetRequests, setBudgetRequests, budgets, setBudgets, user } = useApp();
  const request = budgetRequests.find(r => r.id === requestId);

  const [formData, setFormData] = useState({
    type: 'combined' as const,
    estimatedDays: '',
    showTimelineToClient: true,
    notes: ''
  });

  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0, category: '' }
  ]);

  const [paymentPlan, setPaymentPlan] = useState<PaymentPlanItem[]>([
    { id: '1', percentage: 40, executionPercentage: 0, amount: 0, description: 'Adelanto antes del inicio' }
  ]);

  const [usePaymentPlan, setUsePaymentPlan] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const updateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const newItems = [...items];
    newItems[index].total = quantity * unitPrice;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      category: ''
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const addPaymentStep = () => {
    setPaymentPlan([...paymentPlan, {
      id: Date.now().toString(),
      percentage: 0,
      executionPercentage: 0,
      amount: 0,
      description: ''
    }]);
  };

  const removePaymentStep = (index: number) => {
    if (paymentPlan.length > 1) {
      setPaymentPlan(paymentPlan.filter((_, i) => i !== index));
    }
  };

  const updatePaymentAmount = (index: number, percentage: number) => {
    const newPlan = [...paymentPlan];
    newPlan[index].percentage = percentage;
    newPlan[index].amount = (totalAmount * percentage) / 100;
    setPaymentPlan(newPlan);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!request) return;

    const newBudget: Budget = {
      id: Date.now().toString(),
      projectId: request.projectId,
      title: `Presupuesto: ${request.title}`,
      description: request.description,
      type: formData.type,
      amount: totalAmount,
      status: 'sent',
      items: items,
      estimatedDays: formData.estimatedDays ? parseInt(formData.estimatedDays) : undefined,
      showTimelineToClient: formData.showTimelineToClient,
      paymentPlan: usePaymentPlan ? paymentPlan : undefined,
      requestedAt: request.createdAt,
      requestedBy: request.requestedBy,
      respondedAt: new Date(),
      notes: formData.notes,
      clientApproved: false,
      constructorApproved: true
    };

    setBudgets([...budgets, newBudget]);
    
    // Update request status
    const updatedRequests = budgetRequests.map(r => 
      r.id === requestId ? { ...r, status: 'quoted' as const } : r
    );
    setBudgetRequests(updatedRequests);
    
    onClose();
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Crear Presupuesto</h2>
            <p className="text-sm text-gray-600 mt-1">{request.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Presupuesto
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
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
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                placeholder="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showTimeline"
                checked={formData.showTimelineToClient}
                onChange={(e) => setFormData({ ...formData, showTimelineToClient: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showTimeline" className="ml-2 text-sm text-gray-700">
                Mostrar cronograma al cliente
              </label>
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Detalle del Presupuesto</h3>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Agregar Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].description = e.target.value;
                        setItems(newItems);
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
                        const newItems = [...items];
                        newItems[index].quantity = quantity;
                        setItems(newItems);
                        updateItemTotal(index, quantity, item.unitPrice);
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
                        const newItems = [...items];
                        newItems[index].unitPrice = unitPrice;
                        setItems(newItems);
                        updateItemTotal(index, item.quantity, unitPrice);
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
                        const newItems = [...items];
                        newItems[index].category = e.target.value;
                        setItems(newItems);
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
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      disabled={items.length === 1}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total del Presupuesto:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${totalAmount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Plan */}
          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="usePaymentPlan"
                checked={usePaymentPlan}
                onChange={(e) => setUsePaymentPlan(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="usePaymentPlan" className="ml-2 text-lg font-medium text-gray-900">
                Incluir Plan de Pagos
              </label>
            </div>

            {usePaymentPlan && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-700">Cronograma de Pagos</h4>
                  <button
                    type="button"
                    onClick={addPaymentStep}
                    className="flex items-center px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar Pago
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentPlan.map((payment, index) => (
                    <div key={payment.id} className="grid grid-cols-12 gap-3 items-end p-4 bg-green-50 rounded-lg">
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <input
                          type="text"
                          value={payment.description}
                          onChange={(e) => {
                            const newPlan = [...paymentPlan];
                            newPlan[index].description = e.target.value;
                            setPaymentPlan(newPlan);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          % Ejecución
                        </label>
                        <input
                          type="number"
                          value={payment.executionPercentage}
                          onChange={(e) => {
                            const newPlan = [...paymentPlan];
                            newPlan[index].executionPercentage = parseInt(e.target.value) || 0;
                            setPaymentPlan(newPlan);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max="100"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          % Pago
                        </label>
                        <input
                          type="number"
                          value={payment.percentage}
                          onChange={(e) => {
                            const percentage = parseFloat(e.target.value) || 0;
                            updatePaymentAmount(index, percentage);
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max="100"
                          step="0.1"
                          required
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Monto
                        </label>
                        <div className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md">
                          ${payment.amount.toLocaleString('es-AR')}
                        </div>
                      </div>

                      <div className="col-span-1">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                      </div>

                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removePaymentStep(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          disabled={paymentPlan.length === 1}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Total planificado:</strong> {paymentPlan.reduce((sum, p) => sum + p.percentage, 0)}% 
                    (${paymentPlan.reduce((sum, p) => sum + p.amount, 0).toLocaleString('es-AR')})
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales (Opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Condiciones especiales, garantías, observaciones..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              Enviar Presupuesto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;