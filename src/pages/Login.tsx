import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, User, Lock, Mail } from 'lucide-react';

export type LoginProps = {
  onLogin?: (email: string, userType: 'constructor' | 'client') => void;
};

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
  type: 'email' | 'password';
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: 'mail' | 'lock';
  label: string;
  name: string;
}> = ({ type, value, onChange, placeholder, icon, label, name }) => (
  <div>
    <label htmlFor={name} className="block text-xs text-white/70 mb-1">{label}</label>
    <div className="relative">
      {icon === 'mail' ? (
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
      ) : (
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={type === 'email' ? 'email' : 'current-password'}
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

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { login } = useApp();
  const doLogin = onLogin ?? login;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'constructor' as 'constructor' | 'client',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      doLogin(formData.email, formData.userType);
      setIsLoading(false);
    }, 700);
  };

  const quickLogin = (email: string, type: 'constructor' | 'client') => {
    setIsLoading(true);
    setTimeout(() => {
      doLogin(email, type);
      setIsLoading(false);
    }, 400);
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
          <p className="text-sm text-white/60">Gestión de Obras</p>
        </div>
        {/* --------------------------------------------- */}

        <NeonPanel>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              {isLoading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>

            <div className="text-center text-xs text-white/50">
              Al continuar aceptás los Términos y la Política de Privacidad.
            </div>
          </form>
        </NeonPanel>

        <NeonPanel>
          <div className="p-6">
            <p className="text-sm text-white/70 text-center mb-4">Cuentas de demostración</p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('juan@construcciones.com', 'constructor')}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-xl border transition"
                style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5" style={{ color: NEON }} />
                  <div>
                    <div className="text-sm font-medium">Juan Pérez — Constructor</div>
                    <div className="text-xs text-white/60">juan@construcciones.com</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => quickLogin('maria@gmail.com', 'client')}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-xl border transition"
                style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" style={{ color: NEON }} />
                  <div>
                    <div className="text-sm font-medium">María Rodríguez — Cliente</div>
                    <div className="text-xs text-white/60">maria@gmail.com</div>
                  </div>
                </div>
              </button>
            </div>
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
