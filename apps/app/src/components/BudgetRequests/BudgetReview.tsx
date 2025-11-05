import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget } from '../../types';
import { 
  XMarkIcon, 
  CheckIcon, 
  XCircleIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface BudgetReviewProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
}

const BudgetReview: React.FC<BudgetReviewProps> = ({ isOpen, onClose, budget }) => {
  const { budgets, setBudgets, user } = useApp();
  const [counterOfferNotes, setCounterOfferNotes] = useState('');
  const [showCounterOffer, setShowCounterOffer] = useState(false);

  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';

  const handleApprove = () => {
    const updatedBudgets = budgets.map(b => 
      b.id === budget.id 
        ? { 
            ...b, 
            status: 'approved' as const,
            clientApproved: isClient ? true : b.clientApproved,
            constructorApproved: isConstructor ? true : b.constructorApproved,
            approvedAt: new Date()
          }
        : b
    );
    setBudgets(updatedBudgets);
    onClose();
  };

  const handleReject = () => {
    const updatedBudgets = budgets.map(b => 
      b.id === budget.id 
        ? { ...b, status: 'rejected' as const }
        : b
    );
    setBudgets(updatedBudgets);
    onClose();
  };

  const handleCounterOffer = () => {
    const updatedBudgets = budgets.map(b => 
      b.id === budget.id 
        ? { 
            ...b, 
            status: 'counter_offer' as const,
            counterOfferNotes: counterOfferNotes,
            clientApproved: false,
            constructorApproved: false
          }
        : b
    );
    setBudgets(updatedBudgets);
    onClose();
  };

  const openWhatsApp = () => {
    const phone = isClient ? '+54 9 11 1234-5678' : '+54 9 11 9876-5432';
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hola! Quería conversar sobre el presupuesto: ${budget.title}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{budget.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{budget.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Monto Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${budget.amount.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">Duración</p>
                  <p className="text-2xl font-bold text-green-900">
                    {budget.estimatedDays || 'N/A'} días
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Tipo</p>
                <p className="text-lg font-bold text-purple-900">
                  {budget.type === 'labor' ? 'Mano de Obra' :
                   budget.type === 'materials' ? 'Materiales' : 'Combinado'}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Estado</p>
                <p className="text-lg font-bold text-yellow-900 capitalize">
                  {budget.status === 'sent' ? 'Enviado' :
                   budget.status === 'approved' ? 'Aprobado' :
                   budget.status === 'rejected' ? 'Rechazado' :
                   budget.status === 'counter_offer' ? 'Contraoferta' : budget.status}
                </p>
              </div>
            </div>
          </div>

          {/* Items Detail */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle del Presupuesto</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {budget.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${item.unitPrice.toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ${item.total.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Plan Timeline */}
          {budget.paymentPlan && budget.paymentPlan.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Plan de Pagos</h3>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                <div className="space-y-6">
                  {budget.paymentPlan.map((payment, index) => (
                    <div key={payment.id} className="relative flex items-start">
                      <div className="flex-shrink-0 w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {payment.executionPercentage}%
                      </div>
                      <div className="ml-6 flex-1 bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">
                              {payment.description}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Al {payment.executionPercentage}% de ejecución
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              ${payment.amount.toLocaleString('es-AR')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payment.percentage}% del total
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {budget.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-2">Notas del Constructor</h4>
              <p className="text-sm text-gray-700">{budget.notes}</p>
            </div>
          )}

          {/* Counter Offer Notes */}
          {budget.counterOfferNotes && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-md font-medium text-yellow-800 mb-2">Notas de Contraoferta</h4>
              <p className="text-sm text-yellow-700">{budget.counterOfferNotes}</p>
            </div>
          )}

          {/* Counter Offer Form */}
          {showCounterOffer && isClient && budget.status === 'sent' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-md font-medium text-blue-800 mb-3">Proponer Contraoferta</h4>
              <textarea
                value={counterOfferNotes}
                onChange={(e) => setCounterOfferNotes(e.target.value)}
                placeholder="Describe los cambios que te gustaría proponer..."
                rows={3}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex justify-end space-x-2 mt-3">
                <button
                  onClick={() => setShowCounterOffer(false)}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCounterOffer}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Enviar Contraoferta
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {budget.status === 'sent' && (
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {isClient && (
                <>
                  <button
                    onClick={handleApprove}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Aprobar Presupuesto
                  </button>
                  
                  <button
                    onClick={handleReject}
                    className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    Rechazar
                  </button>
                  
                  <button
                    onClick={() => setShowCounterOffer(!showCounterOffer)}
                    className="flex items-center px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Contraoferta
                  </button>
                </>
              )}
              
              <button
                onClick={openWhatsApp}
                className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                Conversar por WhatsApp
              </button>
            </div>
          )}

          {budget.status === 'approved' && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckIcon className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <h4 className="text-md font-medium text-green-800">Presupuesto Aprobado</h4>
                  <p className="text-sm text-green-600">
                    Aprobado el {budget.approvedAt?.toLocaleDateString('es-AR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetReview;