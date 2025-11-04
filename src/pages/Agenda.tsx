import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Contact } from '../types';
import {
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarIconSolid,
  WrenchScrewdriverIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';

const NEON = '#00FFA3';

// Borde neón en TODO
const card = 'bg-zinc-900/80 rounded-xl p-4 shadow-sm border border-[--neon]/40';
const tabBtn =
  'flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap';
const field =
  'w-full px-3 sm:px-4 py-2 rounded-md bg-zinc-900/70 border border-[--neon]/30 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[--neon]';
const label = 'block text-xs sm:text-sm font-medium text-white/80 mb-1';

// Grúa blanca (SVG) para “Materiales”
const CraneIconWhite: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className + ' text-white'} fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 20h18" />
    <path d="M6 20V9l4-3 4 3v11" />
    <path d="M10 6h8l-4 3" />
    <path d="M14 9v4a2 2 0 1 0 4 0v-1" />
  </svg>
);

// Ícono de WhatsApp (solo icono)
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.46.03.15 5.34.18 11.94c0 2.1.54 4.15 1.56 5.96L0 24l6.22-1.62a12 12 0 0 0 5.84 1.49h.01c6.6-.03 11.91-5.34 11.94-11.94a11.86 11.86 0 0 0-3.49-8.45ZM12.07 22.1h-.01a9.98 9.98 0 0 1-5.08-1.4l-.36-.21-3.69.96.98-3.6-.24-.37a9.96 9.96 0 0 1-1.55-5.33C2.09 6.45 6.54 2 12.06 2c2.67 0 5.18 1.04 7.07 2.93a9.94 9.94 0 0 1 2.92 7.06c-.03 5.52-4.5 9.98-9.98 10.11Zm5.76-7.49c-.31-.16-1.85-.91-2.14-1.02-.29-.11-.5-.16-.72.16-.21.31-.82 1.02-1.01 1.23-.19.21-.37.23-.68.08-.31-.16-1.32-.49-2.51-1.56-.93-.83-1.57-1.85-1.76-2.16-.19-.31-.02-.48.14-.64.14-.14.31-.37.47-.56.16-.19.21-.31.31-.52.1-.21.05-.39-.03-.56-.08-.16-.72-1.73-.98-2.36-.26-.62-.52-.53-.72-.54-.19-.01-.41-.01-.63-.01-.23 0-.56.08-.86.39-.29.31-1.12 1.1-1.12 2.68 0 1.58 1.15 3.11 1.31 3.32.16.21 2.26 3.45 5.47 4.83.76.33 1.36.53 1.83.68.77.24 1.46.21 2.01.13.61-.09 1.85-.76 2.11-1.49.26-.73.26-1.36.18-1.49-.08-.13-.28-.21-.59-.37Z" />
  </svg>
);

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
          className={`h-4 w-4 ${star <= rating ? 'text-[--neon]' : 'text-white/25'}`}
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
                     ring-1 ring-[--neon]/30 whitespace-nowrap overflow-hidden text-ellipsis"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 stroke-black" />
          <span>Agregar contacto</span>
        </button>
      </div>

      {/* Tabs */}
      <div className={`${card} overflow-hidden`}>
        <div className="p-4 sm:p-5">
          <div className="flex gap-1 bg-zinc-950/60 border border-[--neon]/30 p-1 rounded-lg mb-5 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('materials')}
              className={`${tabBtn} ${
                selectedCategory === 'materials'
                  ? 'bg-[--neon]/10 text-[--neon] border border-[--neon]/40'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span className="hidden sm:inline-flex items-center gap-2">
                <CraneIconWhite className="h-4 w-4" /> Materiales ({materialsContacts.length})
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

          {/* Lista */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map(contact => (
              <div key={contact.id} className={`${card} hover:shadow-md transition-shadow flex flex-col h-full`}>
                {/* Título + rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold leading-tight">{contact.name}</h3>
                    <p className="text-xs sm:text-sm text-white/70 truncate">{contact.company}</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-1 text-xs rounded-full border border-[--neon]/20 text-white/90 bg-zinc-900/60">
                      <TagIcon className="h-3.5 w-3.5 text-[--neon]" />
                      {getSubcategoryLabel(contact.subcategory, contact.category)}
                    </span>
                  </div>
                  {contact.rating && contact.rating > 0 && <div className="shrink-0">{renderStars(contact.rating)}</div>}
                </div>

                {/* Info */}
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
                  <div className="mb-4 p-2 bg-zinc-900/60 border border-[--neon]/15 rounded text-xs sm:text-sm text-white/80">
                    {contact.notes}
                  </div>
                )}

                {/* Acciones */}
                <div className="mt-auto">
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {/* (2) WhatsApp SOLO ÍCONO */}
                    <button
                      onClick={() => openWhatsApp(contact.phone, contact.name)}
                      aria-label="WhatsApp"
                      title="WhatsApp"
                      className="flex items-center justify-center px-3 py-2 text-[--neon] border border-[--neon]/60 rounded-md hover:bg-[--neon]/10 transition"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                    </button>

                    {/* (3) Presupuesto / Proyecto con letra más chica */}
                    {selectedCategory !== 'clients' ? (
                      <button className="flex items-center justify-center gap-2 px-3 py-2 text-black bg-[--neon] rounded-md hover:opacity-90 transition ring-1 ring-[--neon]/30 whitespace-nowrap overflow-hidden text-ellipsis">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span className="text-[11px] sm:text-xs md:text-sm">Presupuesto</span>
                      </button>
                    ) : (
                      <button className="flex items-center justify-center gap-2 px-3 py-2 text-black bg-[--neon] rounded-md hover:opacity-90 transition ring-1 ring-[--neon]/30 whitespace-nowrap overflow-hidden text-ellipsis">
                        <ClipboardDocumentListIcon className="h-4 w-4" />
                        <span className="text-[11px] sm:text-xs md:text-sm">Proyecto</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleEditContact(contact)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900/70 border border-[--neon]/25 text-white rounded-md hover:bg-zinc-800 transition whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="text-sm">Editar</span>
                    </button>

                    {/* (4) Eliminar → botón VERDE con letras NEGRAS */}
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-[--neon] text-black rounded-md hover:opacity-90 transition ring-1 ring-[--neon]/30 whitespace-nowrap overflow-hidden text-ellipsis"
                    >
                      <TrashIcon className="h-4 w-4 text-black" />
                      <span className="text-sm font-medium">Eliminar</span>
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

      {/* Modal */}
      {(showAddContact || showEditContact) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" style={{ ['--neon' as any]: NEON }}>
          <div className="bg-zinc-950 border border-[--neon]/30 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[--neon]/20">
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
                          <StarIconSolid className="h-6 w-6 text-[--neon]" />
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

            <div className="flex flex-col sm:flex-row justify-end gap-2 px-4 sm:px-6 py-4 border-t border-[--neon]/20">
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
                className="px-4 py-2 rounded-md text-white/90 border border-[--neon]/25 hover:bg-white/5 transition whitespace-nowrap overflow-hidden text-ellipsis"
              >
                Cancelar
              </button>
              <button
                onClick={showEditContact ? handleUpdateContact : handleAddContact}
                className="px-4 py-2 rounded-md text-black bg-[--neon] hover:opacity-90 transition ring-1 ring-[--neon]/30 whitespace-nowrap overflow-hidden text-ellipsis"
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
