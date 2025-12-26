import React from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface WhatsAppSectionProps {
  editingRequest?: any;
  requestType: 'constructor' | 'supplier';
  onWhatsAppClick: () => void;
  fieldBase: string;
  labelBase: string;
  sectionCard: string;
  NEON: string;
  LIGHT_MUTED: string;
}

const WhatsAppSection: React.FC<WhatsAppSectionProps> = ({
  editingRequest,
  requestType,
  onWhatsAppClick,
  labelBase,
  sectionCard,
  NEON,
  LIGHT_MUTED,
}) => {
  return (
    <div className={sectionCard} style={{ borderColor: NEON }}>
      <label className={labelBase}>Envío por WhatsApp</label>
      <p className="text-sm mb-3" style={{ color: LIGHT_MUTED }}>
        Seleccioná contactos de tu agenda para enviar esta solicitud por WhatsApp.
        {requestType === 'constructor' ? ' Constructores y maestros de obra.' : ' Corralones y proveedores de materiales.'}
      </p>

      <button
        type="button"
        onClick={onWhatsAppClick}
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
  );
};

export default WhatsAppSection;
