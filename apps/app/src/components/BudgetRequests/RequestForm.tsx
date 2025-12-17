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
  editingRequest?: BudgetRequest;
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
  editingRequest,
}) => {
  const { budgetRequests, setBudgetRequests, refreshBudgetRequests, projects, user, contacts = [], users = [] } = useApp() as any;

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
  });

  // Pre-fill form when editing
  React.useEffect(() => {
    if (editingRequest) {
      setFormData({
        title: editingRequest.title,
        description: editingRequest.description,
        projectId: editingRequest.projectId || '',
        priority: editingRequest.priority,
        dueDate: editingRequest.dueDate ? new Date(editingRequest.dueDate).toISOString().split('T')[0] : '',
        type: editingRequest.type || 'combined',
        useStartDate: !!(editingRequest as any).startDate,
        startDate: (editingRequest as any).startDate ? new Date((editingRequest as any).startDate).toISOString().split('T')[0] : '',
        useEndDate: !!(editingRequest as any).endDate,
        endDate: (editingRequest as any).endDate ? new Date((editingRequest as any).endDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        projectId: projectId || '',
        priority: 'medium',
        dueDate: '',
        type: (requestType === 'constructor' ? 'combined' : 'materials') as 'labor' | 'materials' | 'combined',
        useStartDate: false,
        startDate: '',
        useEndDate: false,
        endDate: '',
      });
    }
  }, [editingRequest, projectId, requestType]);

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

  const handleWhatsAppBlast = async () => {
    if (!user?.id) {
      alert('Tenés que iniciar sesión para enviar solicitudes.');
      return;
    }

    if (!formData.title || !formData.description) {
      alert('Completá el título y la descripción antes de enviar.');
      return;
    }

    setShowContactsModal(true);
  };

  const sendWhatsAppToContacts = async (selectedContacts: string[], manualPhones: string[] = []) => {
  const allRecipients = [...selectedContacts, ...manualPhones];

  if (!allRecipients.length) {
    alert('Seleccioná al menos un contacto o agregá un número para enviar.');
    return;
  }

  if (!user?.id) {
    alert('Tenés que iniciar sesión para enviar solicitudes.');
    return;
  }

  setIsSubmitting(true);

  try {
    let ticketId: string;

    // 1) Crear / actualizar ticket
    if (editingRequest) {
      ticketId = editingRequest.id;

      const { error } = await supabase
        .from('tickets')
        .update({
          project_id: formData.projectId || null,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          due_date: formData.dueDate || null,
          start_date: formData.useStartDate ? formData.startDate || null : null,
          end_date: formData.useEndDate ? formData.endDate || null : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingRequest.id);

      if (error) {
        console.error('[RequestForm] Error updating ticket:', error);
        alert('Hubo un error al actualizar la solicitud.');
        setIsSubmitting(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          created_by: user.id,
          project_id: formData.projectId || null,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          due_date: formData.dueDate || null,
          start_date: formData.useStartDate ? formData.startDate || null : null,
          end_date: formData.useEndDate ? formData.endDate || null : null,
          creator_role: user.role ?? 'client',
        })
        .select();

      if (error || !data || data.length === 0) {
        console.error('[RequestForm] Error creating ticket:', error);
        alert('Hubo un error al guardar la solicitud: ' + (error?.message || 'No data returned'));
        setIsSubmitting(false);
        return;
      }

      ticketId = data[0].id;
    }

    // 2) Preparar mensaje y primer contacto
    const base = composeBaseMessage();
    const origin = window.location.origin;

    const firstContact = allRecipients[0];
    const phone = cleanPhone(firstContact);
    const isPhone = phone.length > 0;

    console.log('[RequestForm] Processing first contact:', { firstContact, phone, isPhone });

    // 3) Match opcional contra usuarios existentes (si tenés `users` poblado)
    const matchedUser =
      Array.isArray(users)
        ? users.find((u: any) =>
            (isPhone && u.phone && cleanPhone(String(u.phone)) === phone) ||
            (!isPhone && u.email?.toLowerCase() === firstContact.toLowerCase())
          )
        : null;

    // 4) Verificar si ya existe un recipient para evitar duplicados
    const { data: existingRecipient } = await supabase
      .from('ticket_recipients')
      .select('id')
      .eq('ticket_id', ticketId)
      .eq('recipient_profile_id', matchedUser ? matchedUser.id : null)
      .maybeSingle();

    let recipientData;

    if (existingRecipient) {
      recipientData = existingRecipient;
      console.log('[RequestForm] Recipient already exists, reusing:', recipientData);
    } else {
      const { data: newRecipient, error: recipientError } = await supabase
        .from('ticket_recipients')
        .insert({
          ticket_id: ticketId,
          ticket_creator_id: user.id,
          recipient_profile_id: matchedUser ? matchedUser.id : null,
          recipient_phone: matchedUser ? null : (isPhone ? phone : null),
          recipient_email: matchedUser ? null : (!isPhone ? firstContact : null),
          status: 'sent',
        })
        .select('id')
        .single();

      if (recipientError || !newRecipient) {
        console.error('[RequestForm] Error creating recipient:', recipientError);
        alert(`Error al crear destinatario: ${recipientError?.message || 'Error desconocido'}`);
        setIsSubmitting(false);
        return;
      }

      recipientData = newRecipient;
    }

    // 5) Link y WA URL (sin ?r= param, link compartido)
    const ticketLink = `${origin}/ticket/${ticketId}`;
    const isObrix = isUserInObrix(firstContact);
    const linkLine = `\n\n👉 Ver y responder acá: ${ticketLink}`;
    const msg = `${base}${isObrix ? composeActionTail(firstContact) : composeInviteTail(firstContact)}${linkLine}`;

    const waUrl = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    console.log('[RequestForm] Redirecting to WhatsApp:', waUrl);

    // 6) Refrescar UI y cerrar modales
    await refreshBudgetRequests();
    setShowContactsModal(false);
    onClose();

    // 7) Crear recipients restantes en background (no abre WA para cada uno)
    if (allRecipients.length > 1) {
      const remainingPromises = allRecipients.slice(1).map(async (phoneOrEmail) => {
        const p = cleanPhone(phoneOrEmail);
        const pIsPhone = p.length > 0;

        const uMatched =
          Array.isArray(users)
            ? users.find((u: any) =>
                (pIsPhone && u.phone && cleanPhone(String(u.phone)) === p) ||
                (!pIsPhone && u.email?.toLowerCase() === phoneOrEmail.toLowerCase())
              )
            : null;

        const { data: existingRec } = await supabase
          .from('ticket_recipients')
          .select('id')
          .eq('ticket_id', ticketId)
          .eq('recipient_profile_id', uMatched ? uMatched.id : null)
          .maybeSingle();

        if (existingRec) {
          console.log('[RequestForm] Recipient already exists (remaining), skipping:', existingRec);
          return { phoneOrEmail, recipientId: existingRec.id };
        }

        const { data: rd, error: re } = await supabase
          .from('ticket_recipients')
          .insert({
            ticket_id: ticketId,
            ticket_creator_id: user.id,
            recipient_profile_id: uMatched ? uMatched.id : null,
            recipient_phone: uMatched ? null : (pIsPhone ? p : null),
            recipient_email: uMatched ? null : (!pIsPhone ? phoneOrEmail : null),
            status: 'sent',
          })
          .select('id')
          .single();

        if (re || !rd) {
          console.error('[RequestForm] Error creating recipient (remaining):', re);
          return null;
        }

        return { phoneOrEmail, recipientId: rd.id };
      });

      Promise.all(remainingPromises).then((results) => {
        console.log('[RequestForm] Remaining contacts processed:', results);
      });
    }

    // 8) Redirigir a WhatsApp (sin modal)
    window.location.href = waUrl;
  } catch (err) {
    console.error('[RequestForm] Error sending WhatsApp:', err);
    alert('Ocurrió un error al enviar: ' + (err as Error).message);
    setIsSubmitting(false);
  }
};


  // Submit → guarda o actualiza en Supabase (tabla tickets)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!user?.id) {
      alert('Tenés que iniciar sesión para crear una solicitud.');
      return;
    }

    console.log('[RequestForm] Submitting form, user:', user.id, 'editing:', !!editingRequest);
    setIsSubmitting(true);

    try {
      if (editingRequest) {
        // UPDATE existing ticket
        console.log('[RequestForm] Updating ticket:', editingRequest.id);
        const { error } = await supabase
          .from('tickets')
          .update({
            project_id: formData.projectId || null,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            priority: formData.priority,
            due_date: formData.dueDate || null,
            start_date: formData.useStartDate ? formData.startDate || null : null,
            end_date: formData.useEndDate ? formData.endDate || null : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRequest.id);

        if (error) {
          console.error('[RequestForm] Error updating ticket:', error);
          alert('Hubo un error al actualizar la solicitud.');
          setIsSubmitting(false);
          return;
        }

        console.log('[RequestForm] Ticket updated successfully, refreshing list');
        await refreshBudgetRequests();
        alert('Solicitud actualizada correctamente.');
      } else {
        // INSERT new ticket
        console.log('[RequestForm] Creating new ticket with data:', {
          created_by: user.id,
          title: formData.title,
          type: formData.type,
          priority: formData.priority,
        });

        const { data, error } = await supabase.from('tickets').insert({
          created_by: user.id,
          project_id: formData.projectId || null,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          due_date: formData.dueDate || null,
          start_date: formData.useStartDate ? formData.startDate || null : null,
          end_date: formData.useEndDate ? formData.endDate || null : null,
          creator_role: user.role ?? 'client',
        }).select();

        if (error) {
          console.error('[RequestForm] Error creating ticket:', error);
          alert('Hubo un error al guardar la solicitud: ' + error.message);
          setIsSubmitting(false);
          return;
        }

        console.log('[RequestForm] Ticket created successfully:', data);
        await refreshBudgetRequests();
        alert('Solicitud creada correctamente.');
      }
    } catch (err) {
      console.error('[RequestForm] Unexpected error:', err);
      alert('Ocurrió un error inesperado: ' + (err as Error).message);
      setIsSubmitting(false);
      return;
    }

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
              {editingRequest ? 'Editar Solicitud' : (requestType === 'constructor' ? 'Solicitar Presupuesto a Constructor' : 'Solicitar Presupuesto de Materiales')}
            </h2>
            <p className="text-sm mt-1" style={{ color: LIGHT_MUTED }}>
              {editingRequest ? 'Modificá los datos de tu solicitud' : (requestType === 'constructor' ? 'Mano de obra y/o materiales' : 'Corralones, ferreterías, etc.')}
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
          {/* Campos principales */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Campos principales</h3>
              <span className="text-xs text-slate-600">Obligatorios</span>
            </div>

            {/* Tipo de Presupuesto */}
            <div className="mb-4">
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

            {/* Título */}
            <div className="mb-4">
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
            <div>
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

          {/* Fechas y Prioridad */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className={`${sectionCard} space-y-3 md:col-span-2`} style={{ borderColor: NEON }}>
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

            <div className="md:col-span-1">
              <div className={sectionCard} style={{ borderColor: NEON }}>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Prioridad (opcional)
                </label>
                <div className="opacity-90">
                  <select
                    value={formData.priority}
                    onChange={(e) => set('priority', e.target.value as any)}
                    className={fieldBase}
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Podés dejarlo en "Media".
                </p>
              </div>
            </div>
          </div>

          {/* Envío por WhatsApp */}
          <div className={sectionCard} style={{ borderColor: NEON }}>
            <label className={labelBase}>Envío por WhatsApp</label>
            <p className="text-sm mb-3" style={{ color: LIGHT_MUTED }}>
              Seleccioná contactos de tu agenda para enviar esta solicitud por WhatsApp.
              {requestType === 'constructor' ? ' Constructores y maestros de obra.' : ' Corralones y proveedores de materiales.'}
            </p>

            <button
              type="button"
              onClick={handleWhatsAppBlast}
              className="w-full px-4 py-3 rounded-lg font-medium transition-colors hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: NEON, color: '#0a0a0a', boxShadow: `0 0 10px ${NEON}40`, border: `1px solid ${NEON}33` }}
              title="Crear solicitud y enviar por WhatsApp"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              {editingRequest ? 'Actualizar y Enviar por WhatsApp' : 'Crear y Enviar por WhatsApp'}
            </button>

            <p className="text-xs mt-2" style={{ color: LIGHT_MUTED }}>
              Tip: Si el contacto usa Obrix, el mensaje pedirá Aceptar/Rechazar desde la app. Si no, incluirá una invitación automática.
            </p>
          </div>

          {/* Footer acciones */}
          <div className={`flex flex-col sm:flex-row justify-end gap-3 pt-4 ${divider}`} style={{ borderColor: NEON }}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
              style={{
                backgroundColor: 'transparent',
                color: LIGHT_TEXT,
                border: `1px solid ${LIGHT_BORDER}`
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'transparent',
                color: LIGHT_TEXT,
                border: `1px solid ${NEON}`,
                boxShadow: `0 0 5px ${NEON}20`
              }}
            >
              {isSubmitting ? (editingRequest ? 'Guardando…' : 'Guardando…') : (editingRequest ? 'Guardar sin Enviar' : 'Guardar Borrador')}
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
  onSend: (selected: string[], manualPhones: string[]) => void;
  onCancel: () => void;
}> = ({ contacts, onSend, onCancel }) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [manualPhone, setManualPhone] = useState('');
  const [manualPhones, setManualPhones] = useState<string[]>([]);

  const normalizePhone = (raw: string) => {
    let v = raw.trim().replace(/[^\d+]/g, '');
    if (!v.startsWith('+')) v = '+54' + v.replace(/^0+/, '');
    return v;
  };

  const isValidPhone = (v: string) => {
    const digits = v.replace(/[^\d]/g, '');
    return digits.length >= 10 && digits.length <= 15;
  };

  const addManualPhone = () => {
    const normalized = normalizePhone(manualPhone);
    if (!isValidPhone(normalized)) {
      return;
    }
    setManualPhones(prev => prev.includes(normalized) ? prev : [...prev, normalized]);
    setManualPhone('');
  };

  const removeManualPhone = (phone: string) => {
    setManualPhones(prev => prev.filter(p => p !== phone));
  };

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
    onSend(Array.from(selected), manualPhones);
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

      {/* Input para números manuales */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">
          Si no está en tu agenda, escribilo acá
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Ej: +54 9 11 1234 5678
        </p>

        <div className="mt-3 flex gap-2">
          <input
            value={manualPhone}
            onChange={(e) => setManualPhone(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addManualPhone())}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="+54 9 ..."
          />
          <button
            type="button"
            onClick={addManualPhone}
            className="rounded-xl px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: NEON, color: '#0a0a0a' }}
          >
            Agregar
          </button>
        </div>

        {manualPhones.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {manualPhones.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800"
              >
                {p}
                <button
                  type="button"
                  onClick={() => removeManualPhone(p)}
                  className="ml-1 hover:text-red-600"
                  aria-label="Eliminar"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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
          disabled={selected.size === 0 && manualPhones.length === 0}
          className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: NEON,
            color: '#0a0a0a',
            boxShadow: `0 0 10px ${NEON}40`,
            border: `1px solid ${NEON}33`
          }}
        >
          Enviar a {selected.size + manualPhones.length} contacto{(selected.size + manualPhones.length) !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default RequestForm;
