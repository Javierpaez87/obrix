import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RequestFormModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  editingRequest?: any;
  requestType: 'constructor' | 'supplier';
  LIGHT_BG: string;
  LIGHT_SURFACE: string;
  NEON: string;
  LIGHT_TEXT: string;
  LIGHT_MUTED: string;
  vars: React.CSSProperties;
  children: React.ReactNode;
}

const RequestFormModalShell: React.FC<RequestFormModalShellProps> = ({
  isOpen,
  onClose,
  editingRequest,
  requestType,
  LIGHT_BG,
  LIGHT_SURFACE,
  NEON,
  LIGHT_TEXT,
  LIGHT_MUTED,
  vars,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={vars}>
      <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: LIGHT_BG, opacity: 0.85 }} />

      <div
        className="relative rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border"
        style={{ backgroundColor: LIGHT_SURFACE, borderColor: NEON }}
      >
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

        {children}
      </div>
    </div>
  );
};

export default RequestFormModalShell;
