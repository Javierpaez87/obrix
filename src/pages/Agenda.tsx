import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Contact } from '../types';
import {
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  TrashIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  BuildingOffice2Icon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';

const NEON = '#00FFA3';
const card = 'bg-zinc-900/80 border border-white/10 rounded-xl p-4 shadow-sm';
const tabBtn =
  'flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap';
const field =
  'w-full px-3 sm:px-4 py-2 rounded-md bg-zinc-900/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[--neon]';
const label = 'block text-xs sm:text-sm font-medium text-white/80 mb-1';

const Agenda: React.FC = () => {
  const { contacts, setContacts, user } = useApp();
  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'materials' | 'labor' | 'clients'>('materials');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    company: '',
    phone: '',
    email: '',
    category: 'materials',
    subcategory: '',
    notes: '',
    rating: undefined
  });

  const isClient = user?.role === 'client';
  const isConstructor = user?.role === 'constructor';

  const materialsContacts = contacts.filter(c => c.category === 'materials');
  const laborContacts = contacts.filter(c => c.category === 'labor');
  const clientContacts = contacts.filter(c => c.category === 'clients');

  const getSubcategoryLabel = (subcategory: string, category: string) => {
    const labels = {
      materials: {
        corralon: 'Corralón',
        ferreteria: 'Ferretería',
        ceramicos: 'Cerámicos',
        sanitarios: 'Sanitarios',
        electricidad: 'Electricidad',
        pintureria: 'Pinturería'
      },
      labor: {
        constructor: 'Constructor',
        albanil: 'Albañil',
        plomero: 'Plomero',
        electricista: 'Electricista',
        carpintero: 'Carpintero',
        pintor: 'Pintor',
        techista: 'Techista'
      }
    } as const;
    // @ts-ignore
    return labels[category]?.[subcategory] || subcategory;
  };

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hola ${name}! Te contacto desde Obrix. Me gustaría solicitar un presupuesto.`;
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
        rating: undefined
      });
      setShowAddContact(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      company: contact.company,
      phone: contact.phone,
      email: contact.email,
      category: contact.category,
      subcategory: contact.subcategory,
      notes: contact.notes,
      rating: contact.rating
    });
    setShowEditContact(true);
  };

  const handleUpdateContact = () => {
    if (editingContact && newContact.name && newContact.company && newContact.phone && newContact.subcategory) {
      const updatedContacts = contacts.map(contact =>
        contact.id === editingContact.id
          ? {
              ...contact,
              name: newContact.name!,
              company: newContact.company!,
              phone: newContact.phone!,
              email: newContact.email,
              subcategory: newContact.subcategory!,
              notes: newContact.notes,
              rating: newContact.rating
            }
          : contact
      );
      setContacts(updatedContacts);
      setNewContact({
        name: '',
        company: '',
        phone: '',
        email: '',
        category: 'materials',
        subcategory: '',
        notes: '',
        rating: undefined
      });
      setEditingContact(null);
      setShowEditContact(false);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      setContacts(updatedContacts);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-white/25'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.175 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const list =
    selectedCategory === 'materials' ? materialsContacts :
    selectedCategory === 'labor' ? laborContacts : clientContacts;

  return (
    <div className="space-y-6 text-white" style={{ ['--neon' as any]: NEON }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Agenda</h1>
          <p className="text-sm sm:text-base text-white/70 mt-1">
            {isClient ? 'Gestioná tus proveedores y solicitá presupuestos' : 'Gestioná tus proveedores y clientes'}
          </p>
        </div>
        <button
          onClick={() => setShowAddContact(true)}
          className="flex items-center px-3 sm:px-4 py-2 rounded-lg text-black bg-[--neon] hover:opacity-90 transition
                     ring-1 ring-[--neon]/30"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 stroke-black" />
          <span>Agregar contacto</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={card}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800 border border-white/10">
              <BuildingOffice2Icon className="h-5 w-5 text-[--neon]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/70">Proveedores de materiales</p>
              <p className="text-xl sm:text-2xl font-semibold text-[--neon]">{materialsContacts.length}</p>
            </div>
          </div>
        </div>

        <div className={card}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800 border border-white/10">
              <WrenchScrewdriverIcon className="h-5 w-5 text-[--neon]" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-white/70">Proveedores de mano de obra</p>
              <p className="text-xl sm:text-2xl font-semibold text-[--neon]">{laborContacts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Agenda */}
      <div className={`${card} overflow-hidden`}>
        <div className="p-4 sm:p-5">
          {/* Category Tabs */}
          <div className="flex gap-1 bg-zinc-950/60 border border-white/10 p-1 rounded-lg mb-5 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('materials')}
              className={`${tabBtn} ${
                selectedCategory === 'materials'
                  ? 'bg-[--neon]/10 text-[--neon] border border-[--neon]/40'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline-flex items-center gap-2">
                <BuildingOffice2Icon className="h-4 w-4" /> Materiales ({materialsContacts.length})
              </span>
              <span className="sm:hidden">Materiales ({materialsContacts.length})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('labor')}
              className={`${tabBtn} ${
                selectedCategory === 'labor'
                  ? 'bg-[--neon]/10 text-[--neon] border border-[--neon]/40'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline-flex items-center gap-2">
                <WrenchScrewdriverIcon className="h-4 w-4" /> Mano de obra ({laborContacts.length})
              </span>
              <span className="sm:hidden">Mano de obra ({laborContacts.length})</span>
            </button>
            {isConstructor && (
              <button
                onClick={() => setSelectedCategory('clients')}
                className={`${tabBtn} ${
                  selectedCategory === 'clients'
                    ? 'bg-[--neon]/10 text-[--neon] border border-[--neon]/40'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline-flex items-center gap-2">
                  <UserCircleIcon className="h-4 w-4" /> Clientes ({clientContacts.length})
                </span>
                <span className="sm:hidden">Clientes ({clientContacts.length})</span>
              </button>
            )}
          </div>

          {/* Contacts List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map(contact => (
              <div key={contact.id} className={`${card} hover:shadow-md transition-shadow flex flex-col h-full`}>
                {/* Top: Title + rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold leading-tight">{contact.name}</h3>
                    <p className="text-xs sm:text-sm text-white/70 truncate">{contact.company}</p>
                    <span
                      className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-xs rounded-full border border-white/15 text-white/80 bg-zinc-800"
                    >
                      <TagIcon className="h-3.5 w-3.5" />
                      {getSubcategoryLabel(contact.subcategory, contact.category)}
                    </span>
                  </div>
                  {contact.rating && contact.rating > 0 && <div className="shrink-0">{renderStars(contact.rating)}</div>}
                </div>

                {/* Middle: info */}
                <div className="space-y-2 mt-3 mb-4 text-white/80">
                  <div className="flex items-center text-xs sm:text-sm break-all">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {contact.phone}
                  </div>
                  {contact.email && (
                    <div className="flex items-center text-xs sm:text-sm break-all">
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {contact.email}
                    </div>
                  )}
                  {contact.lastContact && (
                    <div className="text-xs text-white/60">
                      Último contacto: {contact.lastContact.toLocaleDateString('es-AR')}
                    </div>
                  )}
                </div>

                {contact.notes && (
                  <div className="mb-4 p-2 bg-zinc-900 border border-white/10 rounded text-xs sm:text-sm text-white/80">
                    {contact.notes}
                  </div>
                )}

                {/* Bottom: actions (stick to bottom) */}
                <div className="mt-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={() => openWhatsApp(contact.phone, contact.name)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-[--neon] border border-[--neon]/60 rounded-md hover:bg-[--neon]/10 transition"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      <span className="text-sm">WhatsApp</span>
                    </button>

                    {selectedCategory !== 'clients' ? (
                      <button className="flex items-center justify-center gap-2 px-3 py-2 text-black bg-[--neon] rounded-md hover:opacity-90 transition ring-1 ring-[--neon]/30">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span className="text-sm">Presupuesto</span>
                      </button>
                    ) : (
                      <button className="flex items-center justify-center gap-2 px-3 py-2 text-black bg-[--neon] rounded-md hover:opacity-90 transition ring-1 ring-[--neon]/30">
                        <ClipboardDocumentListIcon className="h-4 w-4" />
                        <span className="text-sm">Proyecto</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleEditContact(contact)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 border border-white/10 text-white rounded-md hover:bg-zinc-700 transition"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="text-sm">Editar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-600 transition"
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span className="text-sm">Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {list.length === 0 && (
            <div className="text-center py-12">
              <div className="text-white/70 text-base sm:text-lg mb-2">No hay contactos</div>
              <p className="text-sm sm:text-base text-white/60">
                Agregá tu primer {selectedCategory === 'materials'
                  ? 'proveedor de materiales'
                  : selectedCategory === 'labor'
                  ? 'proveedor de mano de obra'
                  : 'cliente'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {(showAddContact || showEditContact) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" style={{ ['--neon' as any]: NEON }}>
          <div className="bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                {showEditContact ? 'Editar contacto' : 'Agregar contacto'}
              </h3>
              <button
                onClick={() => {
                  setShowAddContact(false);
                  setShowEditContact(false);
                  setEditingContact(null);
                  setNewContact({
                    name: '',
                    company: '',
                    phone: '',
                    email: '',
                    category: 'materials',
                    subcategory: '',
                    notes: '',
                    rating: undefined
                  });
                }}
                className="text-white/60 hover:text-white transition p-2 rounded-lg hover:bg-white/5"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className={label}>Categoría</label>
                  <select
                    value={newContact.category}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        category: e.target.value as 'materials' | 'labor' | 'clients',
                        subcategory: ''
                      })
                    }
                    className={field}
                  >
                    <option value="materials">Materiales</option>
                    <option value="labor">Mano de obra</option>
                    {isConstructor && <option value="clients">Clientes</option>}
                  </select>
                </div>

                <div>
                  <label className={label}>Tipo</label>
                  <select
                    value={newContact.subcategory}
                    onChange={(e) => setNewContact({ ...newContact, subcategory: e.target.value })}
                    className={field}
                    required
                  >
                    <option value="">Seleccionar…</option>
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
                        <option value="particular">Cliente particular</option>
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
                <label className={label}>Nombre *</label>
                <input
                  type="text"
                  value={newContact.name || ''}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className={field}
                  required
                />
              </div>

              <div>
                <label className={label}>Empresa *</label>
                <input
                  type="text"
                  value={newContact.company || ''}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className={field}
                  required
                />
              </div>

              <div>
                <label className={label}>Teléfono *</label>
                <input
                  type="tel"
                  value={newContact.phone || ''}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+54 9 11 1234-5678"
                  className={field}
                  required
                />
              </div>

              <div>
                <label className={label}>Email</label>
                <input
                  type="email"
                  value={newContact.email || ''}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className={field}
                />
              </div>

              {showEditContact && (
                <div>
                  <label className={label}>Calificación</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewContact({ ...newContact, rating: star })}
                        className="focus:outline-none"
                      >
                        {star <= (newContact.rating || 0) ? (
                          <StarIconSolid className="h-6 w-6 text-yellow-400" />
                        ) : (
                          <svg className="h-6 w-6 text-white/25" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.036a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.036a1 1 0 00-1.175 0l-2.802 2.036c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setNewContact({ ...newContact, rating: undefined })}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      Limpiar calificación
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className={label}>Notas</label>
                <textarea
                  value={newContact.notes || ''}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  rows={3}
                  className={field}
                  placeholder="Especialidades, horarios, observaciones..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 px-4 sm:px-6 py-4 border-t border-white/10">
              <button
                onClick={() => {
                  setShowAddContact(false);
                  setShowEditContact(false);
                  setEditingContact(null);
                  setNewContact({
                    name: '',
                    company: '',
                    phone: '',
                    email: '',
                    category: 'materials',
                    subcategory: '',
                    notes: '',
                    rating: undefined
                  });
                }}
                className="px-4 py-2 rounded-md text-white/80 border border-white/15 hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                onClick={showEditContact ? handleUpdateContact : handleAddContact}
                className="px-4 py-2 rounded-md text-black bg-[--neon] hover:opacity-90 transition ring-1 ring-[--neon]/30"
              >
                {showEditContact ? 'Actualizar contacto' : 'Agregar contacto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
