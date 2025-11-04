import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BudgetRequest } from '../../types';
import { XMarkIcon, PaperAirplaneIcon, UserPlusIcon } from '@heroicons/react/24/outline';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  requestType?: 'constructor' | 'supplier';
}

const NEON = '#00FFA3';

const fieldBase =
  'w-full px-4 py-2 rounded-lg bg-zinc-900/70 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[--neon] focus:border-transparent';
const labelBase = 'block text-sm font-medium text-white/80 mb-2';
const sectionCard = 'bg-zinc-900/80 border border-white/10 rounded-xl p-4 sm:p-5';
const divider = 'border-t border-white/10';

const RequestForm: React.FC<RequestFormProps> = ({
  isOpen,
  onClose,
  projectId,
  requestType = 'constructor',
}) => {
  // Si useApp expone contacts/users, los usamos; si no, caemos en arrays vacíos.
  const { budgetRequests, setBudgetRequests, projects, user, contacts = [], users = [] } = useApp() as any;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    priority: 'medium' as const,
    dueDate: '',
    type: 'combined' as 'labor' | 'materials' | 'combined',
    // Nuevos:
    useStartDate: false,
    startDate: '',
    useEndDate: false,
    endDate: '',
    recipients: '', // múltiples teléfonos
  });

  const set = <K extends keyof typeof formData>(k: K, v: (typeof formData)[K]) =>
    setFormData((s) => ({ ...s, [k]: v }));

  const cleanPhone = (raw: string) => raw.replace(/\D/g, '');
  const splitRecipients = (s: string) =>
    s
      .split(/[\s,;]+/)
      .map(cleanPhone)
      .filter(Boolean);

  // Heurística simple: busca por teléfono o email en contactos/usuarios
  const isUserInObrix = (phoneOrEmail: string) => {
    const key = phoneOrEmail.toLowerCase();
    const inContacts =
      Array.isArray(contacts) &&
      contacts.some(
        (c: any) =>
          (c.phone && cleanPhone(c.phone) === cleanPhone(key)) ||
          (c.email && String(c.email).toLowerCase() === key)
      );
    const inUsers =
      Array.isArray(users) &&
      users.some(
        (u: any) =>
          (u.phone && cleanPhone(u.phone) === cleanPhone(key)) ||
          (u.email && String(u.email).toLowerCase() === key)
      );
    return inContacts || inUsers;
  };

  const composeBaseMessage = () => {
    const projName =
      projects.find((p: any) => p.id === formData.projectId)?.name || 'Obra';
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

    return (
`${tipo} · ${projName}
Título: ${formData.title}
Detalle: ${formData.description}
${fechas.length ? fechas.join(' · ') : ''}`.trim()
    );
  };

  const composeInviteTail = (recipient: string) =>
    `\n\nNo tenés cuenta en Obrix aún. Unite acá y gestionemos todo desde la app: https://obrix.app/`;

  const composeActionTail = (recipient: string) =>
    `\n\nAbrí Obrix para **Aceptar** o **Rechazar** esta solicitud.`;

  const handleWhatsAppBlast = () => {
    const recips = splitRecipients(formData.recipients);
    if (!recips.length) {
      alert('Agregá al menos un teléfono en destinatarios.');
      return;
    }
    const base = composeBaseMessage();

    // Abrimos una pestaña por destinatario. Nota: algunos navegadores pueden bloquear múltiples popups.
    recips.forEach((r, idx) => {
      const tail = isUserInObrix(r) ? composeActionTail(r) : composeInviteTail(r);
      const msg = `${base}${tail}`;
      const url = `https://wa.me/${r}?text=${encodeURIComponent(msg)}`;
      setTimeout(() => window.open(url, '_blank'), idx * 200); // pequeño stagger
    });
  };

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
      requestType: requestType,
      // Podés guardar las fechas extra si tu tipo lo permite:
      // @ts-ignore - campos opcionales para tu backend/local state
      startDate: formData.useStartDate && formData.startDate ? new Date(formData.startDate) : undefined,
      // @ts-ignore
      endDate: formData.useEndDate && formData.endDate ? new Date(formData.endDate) : undefined,
    };

    setBudgetRequests([...budgetRequests, newRequest]);

    // Reset
    setFormData({
      title: '',
      description: '',
      projectId: projectId || '',
      priority: 'medium',
      dueDate: '',
      type: 'combined',
      useStartDate: false,
      startDate: '',
      useEndDate: false,
      endDate: '',
      recipients: '',
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
         style={{ ['--neon' as any]: NEON }}>
      <div className="bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {requestType === 'constructor'
                ? 'Solicitar Presupuesto a Constructor'
                : 'Solicitar Presupuesto de Materiales'}
            </h2>
            <p className="text-sm text-white/70 mt-1">
              {requestType === 'constructor'
                ? 'Mano de obra y/o materiales'
                : 'Corralones, ferreterías, etc.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Tipo de Presupuesto */}
          <div className={sectionCard}>
            <label className={labelBase}>Tipo de Presupuesto</label>
            <select
              value={formData.type}
              onChange={(e) => set('type', e.target.value as any)}
              className={fieldBase}
              required
              style={{ ['--neon' as any]: NEON }}
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
          <div className={sectionCard}>
            <label className={labelBase}>Obra</label>
            <select
              value={formData.projectId}
              onChange={(e) => set('projectId', e.target.value)}
              className={fieldBase}
              required
              style={{ ['--neon' as any]: NEON }}
            >
              <option value="">Seleccionar obra</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div className={sectionCard}>
            <label className={labelBase}>
              {requestType === 'constructor' ? 'Título del Trabajo' : 'Lista de Materiales'}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={
                requestType === 'constructor'
                  ? 'Ej: Colocación de cerámicos'
                  : 'Ej: Materiales para fundación'
              }
              className={fieldBase}
              required
              style={{ ['--neon' as any]: NEON }}
            />
          </div>

          {/* Descripción */}
          <div className={sectionCard}>
            <label className={labelBase}>Descripción Detallada</label>
            <textarea
              value={formData.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder={
                requestType === 'constructor'
                  ? 'Describe en detalle lo que necesitas: superficie, especificaciones técnicas, materiales incluidos, etc.'
                  : 'Lista detallada de materiales: cantidades, especificaciones, marcas preferidas, etc.'
              }
              rows={4}
              className={fieldBase}
              required
              style={{ ['--neon' as any]: NEON }}
            />
          </div>

          {/* Prioridad + Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={sectionCard}>
              <label className={labelBase}>Prioridad</label>
              <select
                value={formData.priority}
                onChange={(e) => set('priority', e.target.value as any)}
                className={fieldBase}
                style={{ ['--neon' as any]: NEON }}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div className={`${sectionCard} space-y-3`}>
              <div>
                <label className={labelBase}>Fecha Límite (Opcional)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => set('dueDate', e.target.value)}
                  className={fieldBase}
                  style={{ ['--neon' as any]: NEON }}
                />
              </div>

              {/* Fecha Inicio opcional */}
              <div className="flex items-center gap-3">
                <input
                  id="useStartDate"
                  type="checkbox"
                  checked={formData.useStartDate}
                  onChange={(e) => set('useStartDate', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-[--neon] focus:ring-[--neon]"
                  style={{ ['--neon' as any]: NEON }}
                />
                <label htmlFor="useStartDate" className="text-sm text-white/80">
                  Incluir Fecha de Inicio
                </label>
              </div>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className={`${fieldBase} ${!formData.useStartDate ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ ['--neon' as any]: NEON }}
              />

              {/* Fecha Fin opcional */}
              <div className="flex items-center gap-3">
                <input
                  id="useEndDate"
                  type="checkbox"
                  checked={formData.useEndDate}
                  onChange={(e) => set('useEndDate', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-[--neon] focus:ring-[--neon]"
                  style={{ ['--neon' as any]: NEON }}
                />
                <label htmlFor="useEndDate" className="text-sm text-white/80">
                  Incluir Fecha de Fin
                </label>
              </div>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className={`${fieldBase} ${!formData.useEndDate ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ ['--neon' as any]: NEON }}
              />
            </div>
          </div>

          {/* Destinatarios WhatsApp */}
          <div className={sectionCard}>
            <label className={labelBase}>Destinatarios (WhatsApp)</label>
            <textarea
              value={formData.recipients}
              onChange={(e) => set('recipients', e.target.value)}
              placeholder={`Pegá uno o varios teléfonos con prefijo (ej: 5491122334455), separados por coma, espacio o en líneas distintas.`}
              rows={3}
              className={fieldBase}
              style={{ ['--neon' as any]: NEON }}
            />
            <p className="text-xs text-white/60 mt-2">
              Tip: Si el contacto usa Obrix, el mensaje pedirá Aceptar/Rechazar desde la app. Si no, incluirá una invitación automática.
            </p>
          </div>

          {/* Footer acciones */}
          <div className={`flex flex-col sm:flex-row justify-end gap-3 pt-4 ${divider}`}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-white/80 border border-white/15 hover:bg-white/5 transition"
            >
              Cancelar
            </button>

            {/* Enviar por WhatsApp (multi) */}
            <button
              type="button"
              onClick={handleWhatsAppBlast}
              className="px-6 py-2 rounded-lg text-[--neon] border border-[--neon]/60 hover:bg-[--neon]/10 transition flex items-center gap-2"
              style={{ ['--neon' as any]: NEON }}
              title="Abre una pestaña por destinatario en WhatsApp Web"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              Enviar por WhatsApp
            </button>

            {/* Guardar/Enviar solicitud */}
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-black bg-[--neon] hover:opacity-90 transition ring-1 ring-[--neon]/30 shadow-[0_0_15px_rgba(0,255,163,0.35)]"
              style={{ ['--neon' as any]: NEON }}
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
