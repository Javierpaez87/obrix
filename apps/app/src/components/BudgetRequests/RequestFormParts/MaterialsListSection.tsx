import React from 'react';

type MaterialRow = {
  material: string;
  quantity: string;
  unit: string;
  spec: string;
  comment: string;
};

interface MaterialsListSectionProps {
  materialsListName: string;
  materialsListDescription: string;
  materials: MaterialRow[];
  onListNameChange: (name: string) => void;
  onListDescriptionChange: (description: string) => void;
  onAddRow: () => void;
  onRemoveRow: (idx: number) => void;
  onUpdateRow: (idx: number, patch: Partial<MaterialRow>) => void;
  fieldBase: string;
  labelBase: string;
  sectionCard: string;
  NEON: string;
  LIGHT_TEXT: string;
  LIGHT_MUTED: string;
  LIGHT_BORDER: string;
}

const MaterialsListSection: React.FC<MaterialsListSectionProps> = ({
  materialsListName,
  materialsListDescription,
  materials,
  onListNameChange,
  onListDescriptionChange,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  fieldBase,
  labelBase,
  sectionCard,
  NEON,
  LIGHT_TEXT,
  LIGHT_MUTED,
  LIGHT_BORDER,
}) => {
  return (
    <div className={sectionCard} style={{ borderColor: NEON }}>
      <label className={labelBase}>Nombre de la lista</label>
      <input
        type="text"
        value={materialsListName}
        onChange={(e) => onListNameChange(e.target.value)}
        placeholder="Ej: Fundación / Terminaciones"
        className={fieldBase}
        required
      />

      <div className="mt-4">
        <label className={labelBase}>Descripción de la lista (opcional)</label>
        <input
          type="text"
          value={materialsListDescription}
          onChange={(e) => onListDescriptionChange(e.target.value)}
          placeholder="Descripción breve de esta lista"
          className={fieldBase}
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold" style={{ color: LIGHT_TEXT }}>
            Materiales solicitados
          </h4>

          <button
            type="button"
            onClick={onAddRow}
            className="px-3 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: `${NEON}20`,
              color: LIGHT_TEXT,
              border: `1px solid ${NEON}33`
            }}
          >
            + Agregar material
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr style={{ color: LIGHT_MUTED }}>
                <th className="text-left py-1 md:py-2 pr-1 md:pr-2 min-w-[110px] md:min-w-[140px]">
                  Material / Producto
                </th>

                <th className="text-left py-1 md:py-2 pr-1 md:pr-2 w-[56px] md:w-20">
                  Cant.
                </th>

                <th className="text-left py-1 md:py-2 pr-1 md:pr-2 w-[76px] md:w-24">
                  Unidad
                </th>

                <th className="text-left py-1 md:py-2 pr-1 md:pr-2 min-w-[110px] md:min-w-[120px]">
                  Medidas
                </th>

                <th className="text-left py-1 md:py-2 pr-1 md:pr-2 min-w-[110px] md:min-w-[100px]">
                  Comentario
                </th>

                <th className="py-1 md:py-2 w-10"></th>
              </tr>
            </thead>

            <tbody>
              {materials.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-1 md:py-2 pr-1 md:pr-2">
                    <input
                      value={row.material}
                      onChange={(e) => onUpdateRow(idx, { material: e.target.value })}
                      className={`${fieldBase} !px-2 !py-1 text-xs md:text-sm`}
                      style={{ color: LIGHT_TEXT, backgroundColor: '#fff' }}
                      placeholder="Ej: Madera pino"
                    />
                  </td>

                  <td className="py-1 md:py-2 pr-1 md:pr-2">
                    <input
                      value={row.quantity}
                      onChange={(e) => onUpdateRow(idx, { quantity: e.target.value })}
                      className={`${fieldBase} !px-2 !py-1 text-xs md:text-sm`}
                      style={{ color: LIGHT_TEXT, backgroundColor: '#fff' }}
                      placeholder="0"
                      inputMode="decimal"
                    />
                  </td>

                  <td className="py-1 md:py-2 pr-1 md:pr-2">
                    <select
                      value={row.unit}
                      onChange={(e) => onUpdateRow(idx, { unit: e.target.value })}
                      className={`${fieldBase} !px-2 !py-1 text-xs md:text-sm`}
                      style={{ color: LIGHT_TEXT, backgroundColor: '#fff' }}
                    >
                      <option value="unidad">unidad</option>
                      <option value="bolsa/s">bolsa/s</option>
                      <option value="kg">kg</option>
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="m²">m²</option>
                      <option value="m³">m³</option>
                      <option value="litro">litro</option>
                    </select>
                  </td>

                  <td className="py-1 md:py-2 pr-1 md:pr-2">
                    <input
                      value={row.spec}
                      onChange={(e) => onUpdateRow(idx, { spec: e.target.value })}
                      className={`${fieldBase} !px-2 !py-1 text-xs md:text-sm`}
                      style={{ color: LIGHT_TEXT, backgroundColor: '#fff' }}
                      placeholder="Ej: 1'' x 3m"
                    />
                  </td>

                  <td className="py-1 md:py-2 pr-1 md:pr-2">
                    <input
                      value={row.comment}
                      onChange={(e) => onUpdateRow(idx, { comment: e.target.value })}
                      className={`${fieldBase} !px-2 !py-1 text-xs md:text-sm`}
                      style={{ color: LIGHT_TEXT, backgroundColor: '#fff' }}
                      placeholder="Opcional"
                    />
                  </td>

                  <td className="py-1 md:py-2">
                    <button
                      type="button"
                      onClick={() => onRemoveRow(idx)}
                      className="p-1 md:p-2 rounded-lg hover:opacity-80"
                      style={{ color: LIGHT_MUTED, border: `1px solid ${LIGHT_BORDER}` }}
                      aria-label="Eliminar fila"
                      title="Eliminar fila"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs mt-2" style={{ color: LIGHT_MUTED }}>
          Tip: solo completá "Material / Producto" para que el ítem cuente. El resto es opcional.
        </p>
      </div>
    </div>
  );
};

export default MaterialsListSection;
