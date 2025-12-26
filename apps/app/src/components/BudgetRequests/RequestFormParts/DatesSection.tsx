import React from 'react';

interface DatesSectionProps {
  dueDate: string;
  useStartDate: boolean;
  startDate: string;
  useEndDate: boolean;
  endDate: string;
  onDueDateChange: (date: string) => void;
  onUseStartDateChange: (use: boolean) => void;
  onStartDateChange: (date: string) => void;
  onUseEndDateChange: (use: boolean) => void;
  onEndDateChange: (date: string) => void;
  fieldBase: string;
  labelBase: string;
  sectionCard: string;
  NEON: string;
  LIGHT_MUTED: string;
}

const DatesSection: React.FC<DatesSectionProps> = ({
  dueDate,
  useStartDate,
  startDate,
  useEndDate,
  endDate,
  onDueDateChange,
  onUseStartDateChange,
  onStartDateChange,
  onUseEndDateChange,
  onEndDateChange,
  fieldBase,
  labelBase,
  sectionCard,
  NEON,
  LIGHT_MUTED,
}) => {
  return (
    <div className={sectionCard} style={{ borderColor: NEON }}>
      <div>
        <label className={labelBase}>Fecha Límite (Opcional)</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          className={fieldBase}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          id="useStartDate"
          type="checkbox"
          checked={useStartDate}
          onChange={(e) => onUseStartDateChange(e.target.checked)}
          className="h-4 w-4 rounded border-[--border] text-[--neon] focus:ring-[--neon]"
        />
        <label htmlFor="useStartDate" className="text-sm" style={{ color: LIGHT_MUTED }}>
          Incluir Fecha de Inicio
        </label>
      </div>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className={`${fieldBase} mt-2 ${!useStartDate ? 'opacity-50 pointer-events-none' : ''}`}
      />

      <div className="mt-4 flex items-center gap-3">
        <input
          id="useEndDate"
          type="checkbox"
          checked={useEndDate}
          onChange={(e) => onUseEndDateChange(e.target.checked)}
          className="h-4 w-4 rounded border-[--border] text-[--neon] focus:ring-[--neon]"
        />
        <label htmlFor="useEndDate" className="text-sm" style={{ color: LIGHT_MUTED }}>
          Incluir Fecha de Fin
        </label>
      </div>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className={`${fieldBase} mt-2 ${!useEndDate ? 'opacity-50 pointer-events-none' : ''}`}
      />
    </div>
  );
};

export default DatesSection;
