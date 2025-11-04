import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BudgetRequest } from '../../types';
import { XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  requestType?: 'constructor' | 'supplier';
  /** Nuevo: controla la “intensidad” visual. 'calm' = modo descanso (por defecto). */
  tone?: 'neon' | 'calm';
}

const NEON = '#00FFA3';

/** Paleta “descanso” (carbón) — evita negro puro para fatiga visual */
const CALM_SURFACE = '#0f1115';   // modal
const CALM_SECTION = '#141821';   // cards
const CALM_BORDER  = 'rgba(255,255,255,0.07)';
const CALM_TEXT    = 'rgba(255,255,255,0.92)';
const CALM_MUTED   = 'rgba(255,255,255,0.65)';

const RequestForm: React.FC<RequestFormProps> = ({
  isOpen,
  onClose,
  projectId,
  requestType = 'constructor',
  tone = 'calm'
}) => {
  const { budgetRequests, setBudgetRequests, projects, user, contacts = [], users = [] } = useApp() as any;

  /** Clases base suavizadas (menos brillo, más legibilidad) */
  const fieldBase =
    'w-full px-4 py-2 rounded-lg bg-black/20 border text-[--tx] placeholder-[--tx-muted] outline-none ' +
    'focus:ring-2 focus:ring-[--neon] focus:border-transparent transition-colors duration-300';

  const labelBase = 'block text-sm font-medium text-[--tx-muted] mb-2';
  const sectionCard = 'rounded-xl p-4 sm:p-5 border transition-colors duration-300';
  const divider = 'border-t';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: projectId || '',
    priority: 'medium' as const,
    dueDate: '',
    type: 'combined' as 'labor' | 'materials' | 'combined',
    useStartDate: false,
    startDate: '',
    useEndDate: false,
    endDate: '',
    recipients: '',
  });

  const set = <K extends keyof typeof formData>(k: K, v: (typeof formData)[K]) =>
    setFormData((s) => ({ ...s, [k]: v }));

  const cleanPhone = (raw: string) => raw.replace(/\D/g, '');
  const splitRecipients = (s: string) =>
    s.split(/[\s,;]+/).map(cleanPhone).filter(Boolean);

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
    const projName = projects.find((p: any) => p.id === formData.projectId)?.name || 'Obra';
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

  const composeInviteTail = (_: string) =>
    `\n\nNo tenés cuenta en Obrix aún. Unite acá y gestionemos todo desde la app: https://obrix.app/`;

  const composeActionTail = (_: string) =>
    `\n\nAbrí Obrix para **Aceptar** o **Rechazar** esta solicitud.`;

  const handleWhatsAppBlast = () => {
    const recips = splitRecipients(formData.recipients);
    if (!recips.length) {
      alert('Agregá al menos un teléfono en destinatarios.');
      return;
    }
    const base = composeBaseMessage();
    recips.forEach((r, idx) => {
      const tail = isUserInObrix(r) ? composeActionTail(r) : composeInviteTail(r);
      const msg = `${base}${tail}`;
      const url = `https://wa.me/${r}?text=${encodeURIComponent(msg)}`;
      setTimeout(() => window.open(url, '_blank'), idx * 200);
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
      // @ts-ignore opcionales
      startDate: formData.useStartDate && formData.startDate ? new Date(formData.startDate) : undefined,
      // @ts-ignore
      endDate: formData.useEndDate && formData.endDate ? new Date(formData.endDate) : undefined,
    };

    setBudgetRequests([...budgetRequests, newRequest]);
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

  /** Estilos por “tono” para continuidad con pantallas neon previas */
  const vars: React.CSSProperties = {
    // Identidad
    ['--neon' as any]: NEON,
    // Texto
    ['--tx' as any]: CALM_TEXT,
    ['--tx-muted' as any]: CALM_MUTED,
    // Superficies
    ['--modal' as any]: CALM_SURFACE,
    ['--section' as any]: CALM_SECTION,
    ['--border' as any]: CALM_BORDER,
    // Intensidad del glow (suave en calm; más alto en neon)
    ['--glow' as any]: tone === 'neon' ? '0.35' : '0.12',
    ['--ring' as any]: tone === 'neon' ? '0.9' : '0.55',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 transition-colors duration-500"
      style={vars}
    >
      {/* Overlay: menos opaco que negro puro, con blur suave para descanso visual */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto
                   border transition-colors duration-500"
        style={{
          backgroundColor: 'var(--modal)',
          borderColor: 'var(--border)',
          boxShadow: `0 0 40px rgba(0,255,163,var(--glow))`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b"
             style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-xl font-semibold" style={{ color: 'var(--tx)' }}>
              {requestType === 'constructor'
                ? 'Solicitar Presupuesto a Constructor'
                : 'Solicitar Presupuesto de Materiales'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--tx-muted)' }}>
              {requestType === 'constructor'
                ? 'Mano de obra y/o materiales'
                : 'Corralones, ferreterías, etc.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Cerrar"
            title="Cerrar"
            style={{ color: 'var(--tx-muted)' }}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Tipo de Presupuesto */}
          <div
            className={sectionCard}
            style={{ backgroundColor: 'var(--section)', borderColor: 'var(--border)' }}
          >
            <label className={labelBase}>Tipo de Presupuesto</label>
            <select
              value={formData.type}
              onChange={(e) => set('type', e.target.value as any)}
              className={fieldBase}
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
          <div
            className={sectionCard}
            style={{ backgroundColor: 'var(--section)', borderColor: 'var(--border)' }}
          >
            <label className={labelBase}>Obra</label>
            <select
              value={formData.projectId}
              onChange={(e) => set('projectId', e.target.value)}
              className={fieldBase}
              required
            >
              <option value="">Seleccionar obra</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div
            className={sectionCard}
            style={{ backgroundColor: 'var(--section)', borderColor: 'var(--border)' }}
          >
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
            />
          </div>

          {/* Descripción */}
          <div
            className={sectionCard}
            style={{ backgroundColor: 'var(--section)', borderColor: 'var(--border)' }}
          >
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
            <div
              className={sectionCard}
              style={{ backgroundColor: 'var(--section)', borderColor: 'var(--border)' }}
            >
              <label className={labelBase}>Prioridad</label>
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

            <div
              className={`${sectionCard} space-y-3`}
              style={{ backgroundColor: 'var(--section)', borderColor: 'var(--border)' }}
            >
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
                  className="h-4 w-4 rounded border-white/20 bg-black/20 focus:ring-[--neon]"
                  aria-describedby="startHelp"
                />
                <label htmlFor="useStartDate" className="text-sm" style={{ color: 'var(--tx-muted)' }}>
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
                  className="h-4 w-4 rounded border-white/20 bg-black/20 focus:ring-[--neon]"
                />
                <label htmlFor="useEndDate" className="text-sm" style={{ color: 'var(--tx-muted)' }}>
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
          <div
            className={sectionCard}
            style={{ backgroundColor: 'var(--section)', borderColor: 'var(--border)' }}
          >
            <label className={labelBase}>Destinatarios (WhatsApp)</label>
            <textarea
              value={formData.recipients}
              onChange={(e) => set('recipients', e.target.value)}
              placeholder="Pegá teléfonos con prefijo (ej: 5491122334455), separados por coma, espacio o en líneas."
              rows={3}
              className={fieldBase}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--tx-muted)' }}>
              Tip: Si el contacto usa Obrix, el mensaje pedirá Aceptar/Rechazar desde la app. Si no, incluirá una invitación automática.
            </p>
          </div>

          {/* Footer acciones */}
          <div
            className={`flex flex-col sm:flex-row justify-end gap-3 pt-4 ${divider}`}
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg transition-colors"
              style={{
                color: 'var(--tx-muted)',
                border: `1px solid var(--border)`,
                backgroundColor: 'transparent'
              }}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleWhatsAppBlast}
              className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              title="Abre una pestaña por destinatario en WhatsApp Web"
              style={{
                color: NEON,
                border: `1px solid ${NEON}80`,
                backgroundColor: 'transparent'
              }}
            >
              <PaperAirplaneIcon className="h-5 w-5" />
              Enviar por WhatsApp
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg transition-opacity"
              style={{
                color: '#0a0a0a',
                backgroundColor: NEON,
                boxShadow: `0 0 18px rgba(0,255,163,var(--glow))`,
                border: `1px solid ${NEON}33`
              }}
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
