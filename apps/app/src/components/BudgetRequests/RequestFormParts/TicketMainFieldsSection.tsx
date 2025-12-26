import React from 'react';

interface TicketMainFieldsSectionProps {
  requestType: 'constructor' | 'supplier';
  formType: 'labor' | 'materials' | 'combined';
  title: string;
  description: string;
  onTypeChange: (type: 'labor' | 'materials' | 'combined') => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  fieldBase: string;
  labelBase: string;
}

const TicketMainFieldsSection: React.FC<TicketMainFieldsSectionProps> = ({
  requestType,
  formType,
  title,
  description,
  onTypeChange,
  onTitleChange,
  onDescriptionChange,
  fieldBase,
  labelBase,
}) => {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Campos principales</h3>
      </div>

      <div className="mb-4">
        <label className={labelBase}>Tipo de Presupuesto</label>
        <select
          value={formType}
          onChange={(e) => onTypeChange(e.target.value as any)}
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

      <div className="mb-4">
        <label className={labelBase}>
          {requestType === 'constructor' ? 'Título del Trabajo' : 'Lista de Materiales'}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={requestType === 'constructor' ? 'Ej: Colocación de cerámicos' : 'Ej: Materiales para fundación'}
          className={fieldBase}
          required
        />
      </div>

      <div>
        <label className={labelBase}>
          {formType === 'materials' ? 'Notas generales (opcional)' : 'Descripción Detallada'}
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={
            requestType === 'constructor'
              ? 'Describe en detalle: superficie, especificaciones, materiales incluidos, etc.'
              : 'Notas adicionales sobre la lista de materiales'
          }
          rows={4}
          className={fieldBase}
          required={formType !== 'materials'}
        />
      </div>
    </div>
  );
};

export default TicketMainFieldsSection;
