import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ContactsList from '../ContactsList';

interface ContactsPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  relevantContacts: any[];
  onSend: (selectedContacts: string[], manualPhones: string[]) => void;
  LIGHT_BG: string;
  LIGHT_SURFACE: string;
  NEON: string;
  LIGHT_TEXT: string;
  LIGHT_MUTED: string;
  vars: React.CSSProperties;
}

const ContactsPickerModal: React.FC<ContactsPickerModalProps> = ({
  isOpen,
  onClose,
  relevantContacts,
  onSend,
  LIGHT_BG,
  LIGHT_SURFACE,
  NEON,
  LIGHT_TEXT,
  LIGHT_MUTED,
  vars,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]" style={vars}>
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: LIGHT_BG, opacity: 0.9 }} onClick={onClose} />

      <div
        className="relative rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto border"
        style={{ backgroundColor: LIGHT_SURFACE, borderColor: NEON }}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: NEON }}>
          <h3 className="text-lg font-semibold" style={{ color: LIGHT_TEXT }}>
            Seleccionar Contactos para WhatsApp
          </h3>
          <button
            onClick={onClose}
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
              onSend={onSend}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsPickerModal;
