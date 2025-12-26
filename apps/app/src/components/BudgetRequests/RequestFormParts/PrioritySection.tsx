import React from 'react';

interface PrioritySectionProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  onPriorityChange: (priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  fieldBase: string;
  labelBase: string;
  sectionCard: string;
  NEON: string;
  LIGHT_MUTED: string;
}

const PrioritySection: React.FC<PrioritySectionProps> = ({
  priority,
  onPriorityChange,
  fieldBase,
  labelBase,
  sectionCard,
  NEON,
  LIGHT_MUTED,
}) => {
  return (
    <div className={sectionCard} style={{ borderColor: NEON }}>
      <label className={labelBase}>Prioridad (opcional)</label>
      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as any)}
        className={fieldBase}
      >
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
        <option value="urgent">Urgente</option>
      </select>
      <p className="mt-2 text-xs" style={{ color: LIGHT_MUTED }}>
        Podés dejarlo en "Media".
      </p>
    </div>
  );
};

export default PrioritySection;
