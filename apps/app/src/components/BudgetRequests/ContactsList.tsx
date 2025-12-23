import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const NEON = '#00FFA3';
const LIGHT_BG = '#FFFBEA';
const LIGHT_SURFACE = '#FFFFFF';
const LIGHT_BORDER = 'rgba(0,0,0,0.08)';
const LIGHT_TEXT = '#1E1E1E';
const LIGHT_MUTED = '#444444';

interface ContactsListProps {
  contacts: any[];
  onSend: (selected: string[], manualPhones: string[]) => void;
  onCancel: () => void;
}

const ContactsList: React.FC<ContactsListProps> = ({ contacts, onSend, onCancel }) => {
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
            style={{ color: LIGHT_TEXT, backgroundColor: '#FFFFFF' }}
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

export default ContactsList;
