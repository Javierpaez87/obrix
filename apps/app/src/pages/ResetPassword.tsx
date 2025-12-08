import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NEON = '#00ffa3';

const NeonPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="relative rounded-2xl p-[1px]"
    style={{
      backgroundColor: `${NEON}40`,
      boxShadow: `0 0 20px 2px ${NEON}55`,
      borderRadius: '1rem',
    }}
  >
    <div className="rounded-2xl bg-neutral-950/95 backdrop-blur border" style={{ borderColor: `${NEON}33` }}>
      {children}
    </div>
  </div>
);

const ResetPassword: React.FC = () => {
  const { updatePassword } = useApp();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError(error.message || 'Error al actualizar la contraseña');
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-2">
            <img
              src="/obrix-logo.png"
              alt="Obrix logo"
              className="mx-auto w-40 h-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,163,0.6)]"
            />
          </div>

          <NeonPanel>
            <div className="p-6 space-y-6 text-center">
              <div className="flex justify-center">
                <div
                  className="p-4 rounded-full"
                  style={{ backgroundColor: `${NEON}20`, border: `2px solid ${NEON}` }}
                >
                  <CheckCircle className="w-12 h-12" style={{ color: NEON }} />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Contraseña actualizada</h2>
                <p className="text-white/70 text-sm">
                  Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio en unos
                  segundos...
                </p>
              </div>
            </div>
          </NeonPanel>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-2">
          <img
            src="/obrix-logo.png"
            alt="Obrix logo"
            className="mx-auto w-40 h-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,163,0.6)]"
          />
        </div>

        <NeonPanel>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Nueva contraseña</h2>
              <p className="text-white/70 text-sm">Ingresa tu nueva contraseña.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs text-white/70 mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border text-white placeholder-white/40 outline-none"
                    style={{
                      borderColor: 'rgba(255,255,255,0.1)',
                      transition: '0.2s',
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
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs text-white/70 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border text-white placeholder-white/40 outline-none"
                    style={{
                      borderColor: 'rgba(255,255,255,0.1)',
                      transition: '0.2s',
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
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl py-3 text-sm font-medium text-black transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: NEON,
                  boxShadow: `0 0 12px 0 ${NEON}99`,
                  filter: isLoading ? 'grayscale(0.2) brightness(0.95)' : undefined,
                }}
              >
                {isLoading ? 'Actualizando…' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        </NeonPanel>
      </div>
    </div>
  );
};

export default ResetPassword;
