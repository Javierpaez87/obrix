import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, User, Lock, Mail, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NEON = '#00ffa3';

const NeonPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children }) => (
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

const ToggleButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition w-full select-none ${
      active ? 'bg-white/5 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`}
    style={{
      borderColor: active ? `${NEON}66` : 'rgba(255,255,255,0.1)',
      boxShadow: active ? `inset 0 0 0 1px ${NEON}33` : undefined,
    }}
  >
    <span
      className="p-2 rounded-lg border"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {icon}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const InputField: React.FC<{
  type: 'email' | 'password' | 'text';
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: 'mail' | 'lock' | 'user';
  label: string;
  name: string;
}> = ({ type, value, onChange, placeholder, icon, label, name }) => {
  const IconComponent = icon === 'mail' ? Mail : icon === 'lock' ? Lock : User;

  return (
    <div>
      <label htmlFor={name} className="block text-xs text-white/70 mb-1">{label}</label>
      <div className="relative">
        <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'name'}
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
  );
};

const Login: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'constructor' as 'constructor' | 'client',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.userType,
          formData.name
        );

        if (error) {
          setError(error.message || 'Error al crear la cuenta');
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          setError('Email o contraseña incorrectos');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message || 'Error al iniciar sesión con Google');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* ---------- Logo superior reemplazado ---------- */}
        <div className="text-center mb-2">
          <img
            src="/obrix-logo.png"
            alt="Obrix logo"
            className="mx-auto w-40 h-auto mb-4 drop-shadow-[0_0_15px_rgba(0,255,163,0.6)]"
          />
        </div>
        {/* --------------------------------------------- */}

        <NeonPanel>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                  mode === 'signin' ? 'text-black' : 'text-white/70'
                }`}
                style={{
                  backgroundColor: mode === 'signin' ? NEON : 'transparent',
                }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition ${
                  mode === 'signup' ? 'text-black' : 'text-white/70'
                }`}
                style={{
                  backgroundColor: mode === 'signup' ? NEON : 'transparent',
                }}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {mode === 'signup' && (
                <>
                  <div>
                    <p className="block text-xs text-white/70 mb-2">Tipo de usuario</p>
                    <div className="grid grid-cols-2 gap-3">
                      <ToggleButton
                        active={formData.userType === 'constructor'}
                        onClick={() => setFormData({ ...formData, userType: 'constructor' })}
                        icon={<Building2 className="w-6 h-6" style={{ color: NEON }} />}
                        label="Constructor/a"
                      />
                      <ToggleButton
                        active={formData.userType === 'client'}
                        onClick={() => setFormData({ ...formData, userType: 'client' })}
                        icon={<User className="w-6 h-6" style={{ color: NEON }} />}
                        label="Cliente"
                      />
                    </div>
                  </div>

                  <InputField
                    type="text"
                    value={formData.name}
                    onChange={(v) => setFormData({ ...formData, name: v })}
                    placeholder="Tu nombre completo"
                    icon="user"
                    label="Nombre"
                    name="name"
                  />
                </>
              )}

              <InputField
                type="email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                placeholder="tu@email.com"
                icon="mail"
                label="Email"
                name="email"
              />

              <InputField
                type="password"
                value={formData.password}
                onChange={(v) => setFormData({ ...formData, password: v })}
                placeholder="••••••••"
                icon="lock"
                label="Contraseña"
                name="password"
              />

              {mode === 'signup' && (
                <InputField
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(v) => setFormData({ ...formData, confirmPassword: v })}
                  placeholder="••••••••"
                  icon="lock"
                  label="Confirmar contraseña"
                  name="confirmPassword"
                />
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-white/70 hover:text-white transition"
                    style={{ color: NEON }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

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
                {isLoading ? (mode === 'signup' ? 'Creando cuenta…' : 'Iniciando sesión…') : (mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión')}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-neutral-950 text-white/50">o continuar con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full rounded-xl py-3 text-sm font-medium text-white transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              <div className="text-center text-xs text-white/50">
                Al continuar aceptás los Términos y la Política de Privacidad.
              </div>
            </form>
          </div>
        </NeonPanel>

        <div className="text-center text-xs text-white/50">
          © 2025 Obrix by BondiApps. Gestión tech de obras. Wild Patagonia building.
        </div>
      </div>
    </div>
  );
};

export default Login;
