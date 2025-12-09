import React, { useState } from 'react';
import { X, Phone, AlertCircle } from 'lucide-react';

interface PhoneRequiredModalProps {
  onComplete: (phone: string) => Promise<void>;
}

const NEON = '#00ffa3';

const PhoneRequiredModal: React.FC<PhoneRequiredModalProps> = ({ onComplete }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhone = (phoneNumber: string): boolean => {
    const cleanPhone = phoneNumber.replace(/\s/g, '');

    if (!cleanPhone.startsWith('+')) {
      setError('El número debe comenzar con + seguido del código de país');
      return false;
    }

    const digits = cleanPhone.slice(1);
    if (!/^\d+$/.test(digits)) {
      setError('El número solo puede contener dígitos después del +');
      return false;
    }

    if (digits.length < 10 || digits.length > 15) {
      setError('El número debe tener entre 10 y 15 dígitos');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\s/g, '');

    if (!validatePhone(cleanPhone)) {
      return;
    }

    setLoading(true);
    try {
      await onComplete(cleanPhone);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el teléfono');
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl p-[1px]"
        style={{
          backgroundColor: `${NEON}40`,
          boxShadow: `0 0 30px 4px ${NEON}55`,
        }}
      >
        <div className="rounded-2xl bg-neutral-950 p-6 border" style={{ borderColor: `${NEON}33` }}>
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div
                className="p-4 rounded-full"
                style={{
                  backgroundColor: `${NEON}20`,
                  boxShadow: `0 0 20px ${NEON}40`,
                }}
              >
                <Phone className="w-8 h-8" style={{ color: NEON }} />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white text-center mb-2">
              Completa tu perfil
            </h2>
            <p className="text-sm text-white/60 text-center">
              Por favor, solicitamos completar información de perfil para el óptimo funcionamiento de Obrix
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white mb-2">
                Número de WhatsApp
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                required
                className="w-full px-4 py-3 rounded-lg bg-white/5 border text-white placeholder-white/40 outline-none"
                style={{
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${NEON}CC`;
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              />
              <p className="mt-2 text-xs text-white/50">
                Formato: +[código país][número sin espacios]<br />
                Ejemplo: +5491123456789 (Argentina)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full rounded-xl py-3 text-sm font-medium text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: NEON,
                boxShadow: `0 0 20px 0 ${NEON}99`,
              }}
            >
              {loading ? 'Guardando...' : 'Continuar'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/60">
              <strong className="text-white">¿Por qué necesitamos tu WhatsApp?</strong><br />
              Este número permitirá que otros usuarios puedan contactarte directamente desde la plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneRequiredModal;
