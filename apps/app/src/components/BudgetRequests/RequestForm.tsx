import React, { useState } from 'react';
import type ReactCSS from 'react'; // solo para React.CSSProperties si hace falta
import { useApp } from '../../context/AppContext';
import { BudgetRequest } from '../../types';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase'; // 👈 IMPORTANTE

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  requestType?: 'constructor' | 'supplier';
  /** Tema visual: esta versión es LIGHT (blanco/crema con acentos #00FFA3). */
  theme?: 'light';
}

/** Identidad Obrix */
const NEON = '#00FFA3';

/** Paleta LIGHT (amable a la vista) */
const LIGHT_BG = '#FFFBEA';        // overlay crema suave
const LIGHT_SURFACE = '#FFFFFF';   // modal / cards
const LIGHT_BORDER  = 'rgba(0,0,0,0.08)';
const LIGHT_TEXT    = '#1E1E1E';
const LIGHT_MUTED   = '#444444';

const fieldBase =
  'w-full px-4 py-2 rounded-lg bg-white border text-[--tx] placeholder-[--tx-muted] outline-none ' +
  'focus:ring-2 focus:ring-[--neon] focus:border-transparent transition-colors duration-300';

const labelBase = 'block text-sm font-medium text-[--tx-muted] mb-2';
const sectionCard = 'rounded-xl p-4 sm:p-5 border bg-[--surface] transition-colors duration-300';
const divider = 'border-t';

const RequestForm: React.FC<RequestFormProps> = ({
  isOpen,
  onClose,
  projectId,
  requestType = 'constructor',
}) => {
  // Si useApp expone contacts/users, los usamos; si no, arrays vacíos.
  const { budgetRequests, setBudgetRequests, projects, user, contacts = [], users = [] } = useApp() as any;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    priority: 'medium' as const,
    dueDate: '',
    type: (requestType === 'constructor' ? 'combined' : 'materials') as 'labor' | 'materials' | 'combined',
    useStartDate: false,
    startDate: '',
    useEndDate: false,
    endDate: '',
    recipients: '', // múltiples teléfonos o emails
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  const set = <K extends keyof typeof formData>(k: K, v: (typeof formData)[K]) =>
    setFormData((s) => ({ ...s, [k]: v }));

  // Utils
  const cleanPhone = (raw: string) => raw.replace(/\D/g, '');
  const splitRecipients = (s: string) =>
    s.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean);

  // Heurística: está en contactos/usuarios? por teléfono o email
  const isUserInObrix = (phoneOrEmail: string) => {
    const key = phoneOrEmail.toLowerCase();
    const normPhone = cleanPhone(key);

    const inContacts = Array.isArray(contacts) && contacts.some((c: any) =>
      (c.phone && cleanPhone(String(c.phone)) === normPhone) ||
      (c.email && String(c.email).toLowerCase() === key)
    );

    const inUsers = Array.isArray(users) && users.some((u: any) =>
      (u.phone && cleanPhone(String(u.phone)) === normPhone) ||
      (u.email && String(u.email).toLowerCase() === key)
    );

    return inContacts || inUsers;
  };

  // Mensajería
  const composeBaseMessage = () => {
    const projName = formData.projectId ?
      (projects.find((p: any) => p.id === formData.projectId)?.name || '') : '';
    const tipo =
      requestType === 'constructor'
        ? (formData.type === 'labor'
            ? 'Presupuesto de mano de obra'
            : formData.type === 'combined'
              ? 'Presupuesto de mano de obra + materiales'
              : 'Presupuesto')
        : 'Presupuesto de materiales';

    const fechas: string[] = [];
    if (formData.useStartDate && formData.startDate)
      fechas.push(`Inicio: ${new Date(formData.startDate).toLocaleDateString('es-AR')}`);
    if (formData.useEndDate && formData.endDate)
      fechas.push(`Fin: ${new Date(formData.endDate).toLocaleDateString('es-AR')}`);
    if (formData.dueDate)
      fechas.push(`Fecha límite: ${new Date(formData.dueDate).toLocaleDateString('es-AR')}`);

    const projectLine = projName ? `\nObra: ${projName}` : '';

    return (
`${tipo}${projectLine}
Título: ${formData.title}
Detalle: ${formData.description}
${fechas.length ? fechas.join(' · ') : ''}`.trim()
    );
  };

  const composeInviteTail = (_: string) => `\n\nNo tenés cuenta en Obrix aún. Unite acá y gestionemos todo desde la app: https://obrix.app/`;
  const composeActionTail = (_: string) => `\n\nAbrí Obrix para **Aceptar** o **Rechazar** esta solicitud.`;

  const handleWhatsAppBlast = () => {
    setShowContactsModal(true);
  };

  const sendWhatsAppToContacts = (selectedContacts: string[]) => {
    if (!selectedContacts.length) {
      alert('Seleccioná al menos un contacto para enviar.');
      return;
    }
    const base = composeBaseMessage();

    selectedContacts.forEach((phoneOrEmail, idx) => {
      const isObrix = isUserInObrix(phoneOrEmail);
      const msg = `${base}${isObrix ? composeActionTail(phoneOrEmail) : composeInviteTail(phoneOrEmail)}`;
      const phone = cleanPhone(phoneOrEmail);
      const waUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
      setTimeout(() => window.open(waUrl, '_blank'), idx * 200);
    });
    setShowContactsModal(false);
  };

  // Submit → ahora también guarda en Supabase (tabla tickets)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!user?.id) {
      alert('Tenés que iniciar sesión para crear una solicitud.');
      return;
    }

    setIsSubmitting(true);

    // 1) Actualizamos el estado local como antes (para que el UI siga igual)
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
      requestType: requestType,
      // @ts-ignore
      startDate: formData.useStartDate && formData.startDate ? new Date(formData.startDate) : undefined,
      // @ts-ignore
      endDate: formData.useEndDate && formData.endDate ? new Date(formData.endDate) : undefined,
      // @ts-ignore
      type: formData.type,
    };

    setBudgetRequests([...(budgetRequests || []), newRequest]);

    // 2) Enviamos los datos a Supabase → tabla public.tickets
    try {
      const { error } = await supabase.from('tickets').insert({
        created_by: user.id,
        project_id: formData.projectId || null,
        title: formData.title,
        description: formData.description,
        type: formData.type,               // 'labor' | 'materials' | 'combined'
        priority: formData.priority,       // enum ticket_priority
        due_date: formData.dueDate || null,
        start_date: formData.useStartDate ? formData.startDate || null : null,
        end_date: formData.useEndDate ? formData.endDate || null : null,
        creator_role: user.role ?? 'client', // 'client' | 'constructor'
      });

      if (error) {
        console.error('Error al crear ticket en Supabase:', error);
        alert('La solicitud se creó en la app, pero hubo un error al guardarla en el servidor.');
      }
    } catch (err) {
      console.error('Error inesperado al crear ticket en Supabase:', err);
      alert('Ocurrió un error inesperado al guardar la solicitud.');
    }

    // Reset amable (conserva tipo y proyecto si venís de un flujo)
    setFormData((s) => ({
      title: '',
      description: '',
      projectId: s.projectId,
      priority: 'medium',
      dueDate: '',
      type: s.type,
      useStartDate: false,
      startDate: '',
      useEndDate: false,
      endDate: '',
      recipients: '',
    }));

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  // CSS Vars
  const vars: ReactCSS.CSSProperties = {
    ['--neon' as any]: NEON,
    ['--tx' as any]: LIGHT_TEXT,
    ['--tx-muted' as any]: LIGHT_MUTED,
    ['--surface' as any]: LIGHT_SURFACE,
    ['--border' as any]: LIGHT_BORDER,
  };

  // Filtrar contactos relevantes según el tipo de solicitud
  const relevantContacts = Array.isArray(contacts) ? contacts.filter((c: any) => {
    if (requestType === 'constructor') {
      return c.category === 'labor';
    } else {
      return c.category === 'materials';
    }
  }) : [];

  return (
    <>
    <div className="fixed inset-0 flex items-center justify-center z-50" style={vars}>
      {/* Overlay claro y suave */}
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: LIGHT_BG, opacity: 0.85 }} />

      {/* Modal */}
      <div
        className="relative rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border"
        style={{ backgroundColor: LIGHT_SURFACE, borderColor: NEON }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b" style={{ borderColor: NEON }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: LIGHT_TEXT }}>
              {requestType === 'constructor' ? 'Solicitar Presupuesto a Constructor' : 'Solicitar Presupuesto de Materiales'}
            </h2>
            <p className="text-sm mt-1" style={{ color: LIGHT_MUTED }}>
              {requestType === 'constructor' ? 'Mano de obra y/o materiales' : 'Corralones, ferreterías, etc.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[--neon]/10"
            aria-label="Cerrar"
            title="Cerrar"
            style={{ color: LIGHT_MUTED }}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Tipo de Presupuesto */}
          <div className={sectionCard} style={{ borderColor: NEON }}>
            <label className={labelBase}>Tipo de Presupuesto</label>
            <select
              value={formData.type}
              onChange={(e) => set('type', e.target.value as any)}
              className={fieldBase}
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

          {/* Obra */}
          <div className={sectionCard} style={{ borderColor: NEON }}>
            <label className={labelBase}>Obra (Opcional)</label>
            <select
              value={formData.projectId}
              onChange={(e) => set('projectId', e.target.value)}
              className={fieldBase}
            >
              <option value="">Sin obra asignada</option>
              {Array.isArray(projects) && projects.map((project: any) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div className={sectionCard} style={{ borderColor: NEON }}>
            <label className={labelBase}>
              {requestType === 'constructor' ? 'Título del Trabajo' : 'Lista de Materiales'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={requestType === 'constructor' ? 'Ej: Colocación de cerámicos' : 'Ej: Materiales para fundación'}
              className={fieldBase}
              required
            />
          </div>

          {/* Descripción */}
          <div className={sectionCard} style={{ borderColor: NEON }}>
            <label className={labelBase}>Descripción Detallada</label>
            <textarea
              value={formData.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={
                requestType === 'constructor'
                  ? 'Describe en detalle: superficie, especificaciones, materiales incluidos, etc.'
                  : 'Lista detallada: cantidades, especificaciones, marcas preferidas, etc.'
              }
              rows={4}
              className={fieldBase}
              required
            />
          </div>

          {/* Prioridad + Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={sectionCard} style={{ borderColor: NEON }}>
              <label className={labelBase}>Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => set('priority', e.target.value as any)}
                className={fieldBase}
                required
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className={`${sectionCard} space-y-3`} style={{ borderColor: NEON }}>
              <div>
                <label className={labelBase}>Fecha Límite (Opcional)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => set('dueDate', e.target.value)}
                  className={fieldBase}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="useStartDate"
                  type="checkbox"
                  checked={formData.useStartDate}
                  onChange={(e) => set('useStartDate', e.target.checked)}
                  className="h-4 w-4 rounded border-[--border] text-[--neon] focus:ring-[--neon]"
                />
                <label htmlFor="useStartDate" className="text-sm" style={{ color: LIGHT_MUTED }}>
                  Incluir Fecha de Inicio
                </label>
              </div>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className={`${fieldBase} ${!formData.useStartDate ? 'opacity-50 pointer-events-none' : ''}`}
              />

              <div className="flex items-center gap-3">
                <input
                  id="useEndDate"
                  type="checkbox"
                  checked={formData.useEndDate}
                  onChange={(e) => set('useEndDate', e.target.checked)}
                  className="h-4 w-4 rounded border-[--border] text-[--neon] focus:ring-[--neon]"
                />
                <label htmlFor="useEndDate" className="text-sm" style={{ color: LIGHT_MUTED }}>
                  Incluir Fecha de Fin
                </label>
              </div>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className={`${fieldBase} ${!formData.useEndDate ? 'opacity-50 pointer-events-none' : ''}`}
              />
            </div>
          </div>

          {/* Destinatarios WhatsApp */}
          <div className={sectionCard} style={{ borderColor: NEON }}>
            <label className={labelBase}>Destinatarios (WhatsApp)</label>
            <textarea
              value={formData.recipients}
              onChange={(e) => set('recipients', e.target.value)}
              placeholder={`Pegá uno o varios teléfonos con prefijo (ej: 5491122334455) o emails, separados por coma/espacio/línea.`}
              rows={3}
              className={fieldBase}
            />
            <p className="text-xs mt-2" style={{ color: LIGHT_MUTED }}>
              Tip: Si el contacto usa Obrix, el mensaje pedirá Aceptar/Rechazar desde la app. Si no, incluirá una invitación automática.
            </p>

            {/* Acciones WhatsApp */}
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleWhatsAppBlast}
                className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: NEON, color: '#0a0a0a', boxShadow: `0 0 10px ${NEON}40`, border: `1px solid ${NEON}33` }}
                title="Seleccionar contactos y enviar por WhatsApp"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                Seleccionar Contactos
              </button>
            </div>
          </div>

          {/* Footer acciones */}
          <div className={`flex flex-col sm:flex-row justify-end gap-3 pt-4 ${divider}`} style={{ borderColor: NEON }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: NEON, color: '#0a0a0a', boxShadow: `0 0 10px ${NEON}40`, border: `1px solid ${NEON}33` }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: NEON, color: '#0a0a0a', boxShadow: `0 0 10px ${NEON}40`, border: `1px solid ${NEON}33` }}
            >
              {isSubmitting ? 'Creando…' : 'Crear Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Modal de Selección de Contactos */}
    {showContactsModal && (
      <div className="fixed inset-0 flex items-center justify-center z-[60]" style={vars}>
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: LIGHT_BG, opacity: 0.9 }} onClick={() => setShowContactsModal(false)} />

        <div
          className="relative rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border"
          style={{ backgroundColor: LIGHT_SURFACE, borderColor: NEON }}
        >
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: NEON }}>
            <h3 className="text-lg font-semibold" style={{ color: LIGHT_TEXT }}>
              Seleccionar Contactos para WhatsApp
            </h3>
            <button
              onClick={() => setShowContactsModal(false)}
              className="p-2 rounded-lg transition-colors hover:bg-[--neon]/10"
              aria-label="Cerrar"
              style={{ color: LIGHT_MUTED }}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-5">
            {relevantContacts.length === 0 ? (
              <p className="text-center py-8" style={{ color: LIGHT_MUTED }}>
                No hay contactos disponibles para este tipo de solicitud.
                <br />
                <span className="text-sm">Agregá contactos en la sección Agenda primero.</span>
              </p>
            ) : (
              <ContactsList
                contacts={relevantContacts}
                onSend={sendWhatsAppToContacts}
                onCancel={() => setShowContactsModal(false)}
              />
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

// Componente interno para la lista de contactos
const ContactsList: React.FC<{
  contacts: any[];
  onSend: (selected: string[]) => void;
  onCancel: () => void;
}> = ({ contacts, onSend, onCancel }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleContact = (phoneOrEmail: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(phoneOrEmail)) {
      newSelected.delete(phoneOrEmail);
    } else {
      newSelected.add(phoneOrEmail);
    }
    setSelected(newSelected);
  };

  const handleSend = () => {
    onSend(Array.from(selected));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {contacts.map((contact: any) => {
          const identifier = contact.phone || contact.email || '';
          const isSelected = selected.has(identifier);

          return (
            <div
              key={contact.id}
              onClick={() => identifier && toggleContact(identifier)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected ? 'border-[--neon] bg-[--neon]/5' : 'border-[--border] hover:border-[--neon]/50'
              }`}
              style={{
                borderColor: isSelected ? NEON : LIGHT_BORDER,
                backgroundColor: isSelected ? `${NEON}08` : 'transparent'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium" style={{ color: LIGHT_TEXT }}>
                    {contact.name}
                  </h4>
                  {contact.company && (
                    <p className="text-sm" style={{ color: LIGHT_MUTED }}>{contact.company}</p>
                  )}
                  <p className="text-sm mt-1" style={{ color: LIGHT_MUTED }}>
                    {contact.phone || contact.email}
                  </p>
                  {contact.subcategory && (
                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium" style={{
                      backgroundColor: `${NEON}20`,
                      color: LIGHT_TEXT
                    }}>
                      {contact.subcategory}
                    </span>
                  )}
                </div>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-[--neon] bg-[--neon]' : 'border-[--border]'
                }`} style={{
                  borderColor: isSelected ? NEON : LIGHT_BORDER,
                  backgroundColor: isSelected ? NEON : 'transparent'
                }}>
                  {isSelected && (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="#0a0a0a" strokeWidth="2">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: NEON }}>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'transparent',
            color: LIGHT_TEXT,
            border: `1px solid ${LIGHT_BORDER}`
          }}
        >
          Cancelar
        </button>
        <button
          onClick={handleSend}
          disabled={selected.size === 0}
          className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: NEON,
            color: '#0a0a0a',
            boxShadow: `0 0 10px ${NEON}40`,
            border: `1px solid ${NEON}33`
          }}
        >
          Enviar a {selected.size} contacto{selected.size !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default RequestForm;
