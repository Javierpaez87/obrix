import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
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

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message || 'Error al enviar el email de recuperación');
      } else {
        setSuccess(true);
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
                <h2 className="text-xl font-semibold">Email enviado</h2>
                <p className="text-white/70 text-sm">
                  Te hemos enviado un email a <strong>{email}</strong> con instrucciones para
                  restablecer tu contraseña.
                </p>
                <p className="text-white/60 text-xs mt-4">
                  Si no recibes el email en unos minutos, revisa tu carpeta de spam.
                </p>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full rounded-xl py-3 text-sm font-medium text-black transition"
                style={{
                  backgroundColor: NEON,
                  boxShadow: `0 0 12px 0 ${NEON}99`,
                }}
              >
                Volver al inicio de sesión
              </button>
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
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Recuperar contraseña</h2>
              <p className="text-white/70 text-sm">
                Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-xs text-white/70 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
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
                {isLoading ? 'Enviando…' : 'Enviar instrucciones'}
              </button>
            </form>
          </div>
        </NeonPanel>
      </div>
    </div>
  );
};

export default ForgotPassword;
