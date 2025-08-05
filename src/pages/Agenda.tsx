import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Contact } from '../types';
import { 
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const Agenda: React.FC = () => {
  const { contacts, setContacts, user } = useApp();
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'materials' | 'labor' | 'clients'>('materials');
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    company: '',
    phone: '',
    email: '',
    category: 'materials',
    subcategory: '',
    notes: '',
    rating: 0
  });

  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';


  const materialsContacts = contacts.filter(c => c.category === 'materials');
  const laborContacts = contacts.filter(c => c.category === 'labor');
  const clientContacts = contacts.filter(c => c.category === 'clients');

  const getSubcategoryLabel = (subcategory: string, category: string) => {
    const labels = {
      materials: {
        'corralon': 'Corralón',
        'ferreteria': 'Ferretería',
        'ceramicos': 'Cerámicos',
        'sanitarios': 'Sanitarios',
        'electricidad': 'Electricidad',
        'pintureria': 'Pinturería'
      },
      labor: {
        'constructor': 'Constructor',
        'albanil': 'Albañil',
        'plomero': 'Plomero',
        'electricista': 'Electricista',
        'carpintero': 'Carpintero',
        'pintor': 'Pintor',
        'techista': 'Techista'
      }
    };
    return labels[category as keyof typeof labels]?.[subcategory as keyof any] || subcategory;
  };

  const openWhatsApp = (phone: string, name: string, company: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hola ${name}! Te contacto desde ConstructorApp. Me gustaría solicitar un presupuesto.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.company && newContact.phone && newContact.subcategory) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name!,
        company: newContact.company!,
        phone: newContact.phone!,
        email: newContact.email,
        category: newContact.category!,
        subcategory: newContact.subcategory!,
        notes: newContact.notes,
        rating: newContact.rating,
        createdAt: new Date()
      };
      
      setContacts([...contacts, contact]);
      setNewContact({
        name: '',
        company: '',
        phone: '',
        email: '',
        category: 'materials',
        subcategory: '',
        notes: '',
        rating: 0
      });
      setShowAddContact(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">📞 Agenda</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {isClient ? 'Gestiona tus proveedores y solicita presupuestos' : 'Gestiona tus proveedores y clientes'}
          </p>
        </div>
        <button
          onClick={() => setShowAddContact(true)}
          className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Agregar Contacto</span>
          <span className="sm:hidden">Agregar</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-50 text-blue-600">
              🏗️
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-blue-600">Proveedores de Materiales</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{materialsContacts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-50 text-green-600">
              👷‍♂️
            </div>
            <div className="ml-2 sm:ml-3">
              <p className="text-xs sm:text-sm font-medium text-green-600">Proveedores de Mano de Obra</p>
              <p className="text-xl sm:text-2xl font-bold text-green-900">{laborContacts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Agenda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-3 sm:p-6">
          {/* Category Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4 sm:mb-6 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('materials')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'materials'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="hidden sm:inline">🏗️ Proveedores de Materiales ({materialsContacts.length})</span>
              <span className="sm:hidden">🏗️ Materiales ({materialsContacts.length})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('labor')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'labor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="hidden sm:inline">👷‍♂️ Proveedores de Mano de Obra ({laborContacts.length})</span>
              <span className="sm:hidden">👷‍♂️ M. Obra ({laborContacts.length})</span>
            </button>
            {isConstructor && (
              <button
                onClick={() => setSelectedCategory('clients')}
                className={`flex-1 py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === 'clients'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="hidden sm:inline">👤 Clientes ({clientContacts.length})</span>
                <span className="sm:hidden">👤 Clientes ({clientContacts.length})</span>
              </button>
            )}
          </div>

          {/* Contacts List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {(selectedCategory === 'materials' ? materialsContacts : 
              selectedCategory === 'labor' ? laborContacts : clientContacts).map((contact) => (
              <div key={contact.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">{contact.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{contact.company}</p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      selectedCategory === 'materials' ? 'bg-blue-100 text-blue-800' :
                      selectedCategory === 'labor' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {getSubcategoryLabel(contact.subcategory, contact.category)}
                    </span>
                  </div>
                  {contact.rating && contact.rating > 0 && (
                    <div className="ml-2">
                      {renderStars(contact.rating)}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs sm:text-sm text-gray-600">
                    <PhoneIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    {contact.phone}
                  </div>
                  {contact.email && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <EnvelopeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {contact.email}
                    </div>
                  )}
                  {contact.lastContact && (
                    <div className="text-xs text-gray-500">
                      Último contacto: {contact.lastContact.toLocaleDateString('es-AR')}
                    </div>
                  )}
                </div>

                {contact.notes && (
                  <div className="mb-4 p-2 bg-gray-50 rounded text-xs sm:text-sm text-gray-700">
                    {contact.notes}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => openWhatsApp(contact.phone, contact.name, contact.company)}
                    className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-green-500 text-white text-xs sm:text-sm rounded-md hover:bg-green-600 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    WhatsApp
                  </button>
                  {selectedCategory !== 'clients' ? (
                    <button className="flex items-center justify-center px-2 sm:px-3 py-2 bg-blue-500 text-white text-xs sm:text-sm rounded-md hover:bg-blue-600 transition-colors">
                      💰 Presupuesto
                    </button>
                  ) : (
                    <button className="flex items-center justify-center px-2 sm:px-3 py-2 bg-purple-500 text-white text-xs sm:text-sm rounded-md hover:bg-purple-600 transition-colors">
                      📋 Proyecto
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {(selectedCategory === 'materials' ? materialsContacts : 
            selectedCategory === 'labor' ? laborContacts : clientContacts).length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-base sm:text-lg mb-2">
                {selectedCategory === 'materials' ? '🏗️' : 
                 selectedCategory === 'labor' ? '👷‍♂️' : '👤'} No hay contactos
              </div>
              <p className="text-sm sm:text-base text-gray-500">
                Agrega tu primer {selectedCategory === 'materials' ? 'proveedor de materiales' : 
                                 selectedCategory === 'labor' ? 'proveedor de mano de obra' : 'cliente'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Agregar Contacto</h3>
              <button
                onClick={() => setShowAddContact(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={newContact.category}
                    onChange={(e) => setNewContact({ ...newContact, category: e.target.value as 'materials' | 'labor' | 'clients', subcategory: '' })}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  >
                    <option value="materials">Materiales</option>
                    <option value="labor">Mano de Obra</option>
                    {isConstructor && <option value="clients">Clientes</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newContact.subcategory}
                    onChange={(e) => setNewContact({ ...newContact, subcategory: e.target.value })}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {newContact.category === 'materials' ? (
                      <>
                        <option value="corralon">Corralón</option>
                        <option value="ferreteria">Ferretería</option>
                        <option value="ceramicos">Cerámicos</option>
                        <option value="sanitarios">Sanitarios</option>
                        <option value="electricidad">Electricidad</option>
                        <option value="pintureria">Pinturería</option>
                      </>
                    ) : newContact.category === 'labor' ? (
                      <>
                        <option value="constructor">Constructor</option>
                        <option value="albanil">Albañil</option>
                        <option value="plomero">Plomero</option>
                        <option value="electricista">Electricista</option>
                        <option value="carpintero">Carpintero</option>
                        <option value="pintor">Pintor</option>
                        <option value="techista">Techista</option>
                      </>
                    ) : (
                      <>
                        <option value="particular">Cliente Particular</option>
                        <option value="empresa">Empresa</option>
                        <option value="inmobiliaria">Inmobiliaria</option>
                        <option value="gobierno">Gobierno</option>
                        <option value="cooperativa">Cooperativa</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Empresa *
                </label>
                <input
                  type="text"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Calificación
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewContact({ ...newContact, rating: star })}
                      className="focus:outline-none"
                    >
                      {star <= (newContact.rating || 0) ? (
                        <StarIconSolid className="h-6 w-6 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-6 w-6 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  rows={3}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
                  placeholder="Especialidades, horarios, observaciones..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              <button
                onClick={() => setShowAddContact(false)}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddContact}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Agregar Contacto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;