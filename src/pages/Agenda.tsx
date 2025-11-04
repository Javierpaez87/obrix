import React, { useEffect, useState } from 'react';
// ⛑️ Build-safe: quitamos la importación directa de useApp para evitar el error
// "File not found: ../context/AppContext". En su lugar, este componente acepta
// props opcionales (contacts/onContactsChange/user). Si no las recibe, usa
// estado interno de demo para que compile y puedas previsualizar.
import { Contact } from '../types';
import {
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  PlusIcon,
  StarIcon as StarIconOutline,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  BuildingStorefrontIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * Agenda – Neon Dark UI (Build‑safe, sin dependencia directa de AppContext)
 * -----------------------------------------------------------------------
 * ✔ Mantiene la lógica original (add/edit/delete, filtros)
 * ✔ Estética negro/blanco con acentos neon (sin deps nuevas)
 * ✔ Evita romper el build si no existe ../context/AppContext
 * ✔ Permite inyectar datos reales vía props cuando conectes tu AppProvider
 * ✔ Incluye demos de prueba al final
 */

type Category = 'materials' | 'labor' | 'clients';

type MinimalUser = { role: 'constructor' | 'client' | string; name?: string } | null;

interface AgendaProps {
  contacts?: Contact[];
  onContactsChange?: (next: Contact[]) => void;
  user?: MinimalUser;
}

const neonRing = 'relative rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/60 via-fuchsia-500/40 to-emerald-500/60';
const cardInner = 'rounded-2xl bg-neutral-950/95 backdrop-blur-sm border border-white/10';

const NeonCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`${neonRing} ${className}`}>
    <div className={cardInner}>{children}</div>
  </div>
);

const Pill: React.FC<{ active?: boolean; children: React.ReactNode; onClick?: () => void }>
  = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition whitespace-nowrap
      ${active ? 'bg-white/10 border-white/20 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
  >
    {children}
  </button>
);

const Badge: React.FC<{ tone: 'blue' | 'green' | 'purple'; children: React.ReactNode }> = ({ tone, children }) => {
  const map: Record<string, string> = {
    blue: 'bg-cyan-400/15 text-cyan-200 border-cyan-300/20',
    green: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/20',
    purple: 'bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-300/20',
  };
  return <span className={`inline-block px-2 py-1 text-[11px] rounded-full border ${map[tone]}`}>{children}</span>;
};

const Row: React.FC<{ label: React.ReactNode; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center text-xs sm:text-sm text-white/80 gap-2">
    <span className="opacity-70 min-w-[1rem]">{label}</span>
    <span className="truncate">{value}</span>
  </div>
);

const WhatsButton: React.FC<{ phone?: string; name: string; company?: string }> = ({ phone, name }) => {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, '');
  const msg = `Hola ${name}! Te contacto desde Obrix. Me gustaría solicitar un presupuesto.`;
  const href = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition text-white"
    >
      <ChatBubbleLeftRightIcon className="w-4 h-4" /> WhatsApp
    </a>
  );
};

const CategoryIcon: React.FC<{ cat: Category }> = ({ cat }) => {
  if (cat === 'materials') return <BuildingStorefrontIcon className="w-4 h-4" />;
  if (cat === 'labor') return <ClipboardDocumentListIcon className="w-4 h-4" />;
  return <UsersIcon className="w-4 h-4" />;
};

const getSubcategoryLabel = (subcategory: string, category: string) => {
  const labels = {
    materials: {
      corralon: 'Corralón',
      ferreteria: 'Ferretería',
      ceramicos: 'Cerámicos',
      sanitarios: 'Sanitarios',
      electricidad: 'Electricidad',
      pintureria: 'Pinturería',
    },
    labor: {
      constructor: 'Constructor',
      albanil: 'Albañil',
      plomero: 'Plomero',
      electricista: 'Electricista',
      carpintero: 'Carpintero',
      pintor: 'Pintor',
      techista: 'Techista',
    },
    clients: {
      particular: 'Cliente Particular',
      empresa: 'Empresa',
      inmobiliaria: 'Inmobiliaria',
      gobierno: 'Gobierno',
      cooperativa: 'Cooperativa',
    },
  } as const;
  // @ts-expect-error index seguro por contenido
  return labels[category]?.[subcategory] || subcategory;
};

const Agenda: React.FC<AgendaProps> = ({ contacts, onContactsChange, user }) => {
  // Estado local de respaldo para modo demo (cuando no llegan props)
  const [localContacts, setLocalContacts] = useState<Contact[]>(contacts ?? []);
  const effectiveContacts = contacts ?? localContacts;
  const setContacts = onContactsChange ?? setLocalContacts;
  const effectiveUser: MinimalUser = user ?? { role: 'constructor', name: 'Demo' };

  // Mantener sincronía si cambian las props externas
  useEffect(() => {
    if (contacts) setLocalContacts(contacts);
  }, [contacts]);

  const [showAddContact, setShowAddContact] = useState(false);
  const [showEditContact, setShowEditContact] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('materials');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    company: '',
    phone: '',
    email: '',
    category: 'materials',
    subcategory: '',
    notes: '',
    rating: undefined,
  });

  const isClient = effectiveUser?.role === 'client';
  const isConstructor = effectiveUser?.role === 'constructor';

  const materialsContacts = effectiveContacts.filter((c) => c.category === 'materials');
  const laborContacts = effectiveContacts.filter((c) => c.category === 'labor');
  const clientContacts = effectiveContacts.filter((c) => c.category === 'clients');

  const visibleList = selectedCategory === 'materials' ? materialsContacts : selectedCategory === 'labor' ? laborContacts : clientContacts;

  const handleAddContact = () => {
    if (newContact.name && newContact.company && newContact.phone && newContact.subcategory) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name!,
        company: newContact.company!,
        phone: newContact.phone!,
        email: newContact.email,
        category: newContact.category as Category,
        subcategory: newContact.subcategory!,
        notes: newContact.notes,
        rating: newContact.rating,
        createdAt: new Date(),
      } as Contact;

      setContacts([...effectiveContacts, contact]);
      setNewContact({ name: '', company: '', phone: '', email: '', category: 'materials', subcategory: '', notes: '', rating: undefined });
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
      category: contact.category as Category,
      subcategory: contact.subcategory,
      notes: contact.notes,
      rating: contact.rating,
    });
    setShowEditContact(true);
  };

  const handleUpdateContact = () => {
    if (editingContact && newContact.name && newContact.company && newContact.phone && newContact.subcategory) {
      const updated = effectiveContacts.map((c) =>
        c.id === editingContact.id
          ? {
              ...c,
              name: newContact.name!,
              company: newContact.company!,
              phone: newContact.phone!,
              email: newContact.email,
              subcategory: newContact.subcategory!,
              notes: newContact.notes,
              rating: newContact.rating,
            }
          : c
      );
      setContacts(updated);
      setNewContact({ name: '', company: '', phone: '', email: '', category: 'materials', subcategory: '', notes: '', rating: undefined });
      setEditingContact(null);
      setShowEditContact(false);
    }
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      setContacts(effectiveContacts.filter((c) => c.id !== contactId));
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} aria-hidden>
          {star <= rating ? (
            <StarIconSolid className="h-4 w-4 text-yellow-300" />
          ) : (
            <StarIconOutline className="h-4 w-4 text-white/25" />
          )}
        </span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Agenda</h1>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5">
              {isClient ? 'Gestioná proveedores y solicitá presupuestos' : 'Gestioná proveedores y clientes'}
            </p>
          </div>
          <button
            onClick={() => setShowAddContact(true)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white text-xs sm:text-sm hover:opacity-90"
          >
            <PlusIcon className="w-4 h-4" /> Agregar
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          <NeonCard>
            <div className="p-5 sm:p-6 flex items-center gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <BuildingStorefrontIcon className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-xs text-white/60">Proveedores de Materiales</p>
                <p className="text-2xl font-semibold">{materialsContacts.length}</p>
              </div>
            </div>
          </NeonCard>
          <NeonCard>
            <div className="p-5 sm:p-6 flex items-center gap-3">
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <p className="text-xs text-white/60">Proveedores de Mano de Obra</p>
                <p className="text-2xl font-semibold">{laborContacts.length}</p>
              </div>
            </div>
          </NeonCard>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Pill active={selectedCategory === 'materials'} onClick={() => setSelectedCategory('materials')}>
            <span className="inline-flex items-center gap-2"><CategoryIcon cat="materials" /> Materiales ({materialsContacts.length})</span>
          </Pill>
          <Pill active={selectedCategory === 'labor'} onClick={() => setSelectedCategory('labor')}>
            <span className="inline-flex items-center gap-2"><CategoryIcon cat="labor" /> Mano de Obra ({laborContacts.length})</span>
          </Pill>
          {isConstructor && (
            <Pill active={selectedCategory === 'clients'} onClick={() => setSelectedCategory('clients')}>
              <span className="inline-flex items-center gap-2"><CategoryIcon cat="clients" /> Clientes ({clientContacts.length})</span>
            </Pill>
          )}
        </div>

        {/* Listado */}
        <NeonCard>
          <div className="p-4 sm:p-6">
            {visibleList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {visibleList.map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-medium truncate">{c.name}</h3>
                        <p className="text-xs text-white/60 truncate">{c.company}</p>
                        <div className="mt-1">
                          <Badge tone={selectedCategory === 'materials' ? 'blue' : selectedCategory === 'labor' ? 'green' : 'purple'}>
                            {getSubcategoryLabel(c.subcategory, c.category)}
                          </Badge>
                        </div>
                      </div>
                      {c.rating && c.rating > 0 && <div className="shrink-0">{renderStars(c.rating)}</div>}
                    </div>

                    <div className="space-y-1.5">
                      <Row label={<PhoneIcon className="w-4 h-4 opacity-70" />} value={c.phone} />
                      {c.email && <Row label={<EnvelopeIcon className="w-4 h-4 opacity-70" />} value={c.email} />}
                      {c.lastContact && (
                        <div className="text-[11px] text-white/60">Último contacto: {new Date(c.lastContact).toLocaleDateString('es-AR')}</div>
                      )}
                    </div>

                    {c.notes && <div className="text-xs text-white/80 bg-white/5 border border-white/10 rounded-lg p-2">{c.notes}</div>}

                    <div className="mt-auto grid grid-cols-2 gap-2">
                      <WhatsButton phone={c.phone} name={c.name} company={c.company} />
                      {selectedCategory !== 'clients' ? (
                        <button className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition">
                          💰 Presupuesto
                        </button>
                      ) : (
                        <button className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition">
                          📋 Proyecto
                        </button>
                      )}
                      <button
                        onClick={() => handleEditContact(c)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition col-span-1"
                      >
                        <PencilIcon className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm border border-white/15 bg-red-500/20 text-red-200 hover:bg-red-500/30 transition col-span-1"
                      >
                        <TrashIcon className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-white/60 mb-2">
                  {selectedCategory === 'materials' ? '🏗️' : selectedCategory === 'labor' ? '👷‍♂️' : '👤'} No hay contactos
                </div>
                <p className="text-sm text-white/50">Agregá tu primer contacto en esta categoría.</p>
              </div>
            )}
          </div>
        </NeonCard>
      </div>

      {/* Modal Add/Edit */}
      {(showAddContact || showEditContact) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md">
            <div className={`${neonRing}`}>
              <div className={`${cardInner}`}>
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {showEditContact ? 'Editar Contacto' : 'Agregar Contacto'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddContact(false);
                      setShowEditContact(false);
                      setEditingContact(null);
                      setNewContact({ name: '', company: '', phone: '', email: '', category: 'materials', subcategory: '', notes: '', rating: undefined });
                    }}
                    className="text-white/60 hover:text-white"
                    aria-label="Cerrar"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Categoría</label>
                      <select
                        value={newContact.category}
                        onChange={(e) => setNewContact({ ...newContact, category: e.target.value as Category, subcategory: '' })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="materials">Materiales</option>
                        <option value="labor">Mano de Obra</option>
                        {isConstructor && <option value="clients">Clientes</option>}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Tipo</label>
                      <select
                        value={newContact.subcategory}
                        onChange={(e) => setNewContact({ ...newContact, subcategory: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                    <label className="block text-xs text-white/70 mb-1">Nombre *</label>
                    <input
                      value={newContact.name || ''}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ej: Carlos Mendoza"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Empresa *</label>
                    <input
                      value={newContact.company || ''}
                      onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Ej: Corralón Quen"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Teléfono *</label>
                    <input
                      value={newContact.phone || ''}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="+54 9 11 1234-5678"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Email</label>
                    <input
                      type="email"
                      value={newContact.email || ''}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="nombre@empresa.com"
                    />
                  </div>

                  {showEditContact && (
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Calificación</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setNewContact({ ...newContact, rating: star })} className="focus:outline-none">
                            {star <= (newContact.rating || 0) ? (
                              <StarIconSolid className="h-6 w-6 text-yellow-300" />
                            ) : (
                              <StarIconOutline className="h-6 w-6 text-white/25" />
                            )}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewContact({ ...newContact, rating: undefined })}
                        className="mt-1 text-xs text-white/60 hover:text-white"
                      >
                        Limpiar calificación
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Notas</label>
                    <textarea
                      value={newContact.notes || ''}
                      onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Especialidades, horarios, observaciones…"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 px-4 sm:px-6 py-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setShowAddContact(false);
                      setShowEditContact(false);
                      setEditingContact(null);
                      setNewContact({ name: '', company: '', phone: '', email: '', category: 'materials', subcategory: '', notes: '', rating: undefined });
                    }}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={showEditContact ? handleUpdateContact : handleAddContact}
                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white hover:opacity-90"
                  >
                    {showEditContact ? 'Actualizar contacto' : 'Agregar contacto'}
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

export default Agenda;

/**
 * DEMOS opcionales (tests manuales)
 * ---------------------------------
 * No dependen del contexto. Úsese en rutas de prueba si querés validar layout.
 */
export const AgendaEmptyDemo: React.FC = () => (
  <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
    <NeonCard>
      <div className="p-8 text-center">
        <p className="text-white/60">Sin datos de contexto. Montá la Agenda con props o dentro de tu AppProvider.</p>
      </div>
    </NeonCard>
  </div>
);

// 🔬 Demo con datos falsos (test manual):
export const AgendaSampleDemo: React.FC = () => {
  const [data, setData] = useState<Contact[]>([
    { id: '1', name: 'Carlos Mendoza', company: 'Corralón Quen', phone: '+54 9 11 2345-6789', email: 'carlos@quen.com', category: 'materials', subcategory: 'corralon', notes: 'Entrega rápida', rating: 4, createdAt: new Date() },
    { id: '2', name: 'Ana García', company: 'Ferretería Austral', phone: '+54 9 11 3456-7890', email: 'ana@austral.com', category: 'materials', subcategory: 'ferreteria', notes: 'Buenos precios', rating: 5, createdAt: new Date() },
    { id: '3', name: 'Charo Berta', company: 'Torres Construcciones', phone: '+54 9 11 5678-9012', email: 'charo@torres.com', category: 'labor', subcategory: 'constructor', notes: '15 años de experiencia', rating: 5, createdAt: new Date() },
  ] as Contact[]);
  const user: MinimalUser = { role: 'constructor', name: 'Demo' };
  return <Agenda contacts={data} onContactsChange={setData} user={user} />;
};
