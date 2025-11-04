import React, { useState } from 'react';
import { Building2, User, Lock, Mail } from 'lucide-react';

// Build-safe: este Login NO importa useApp. Recibe onLogin por props.
// Integrelo así en producción: <Login onLogin={(email, type) => login(email, type)} />

export type LoginProps = {
  onLogin?: (email: string, userType: 'constructor' | 'client') => void;
};

const NeonPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/60 to-emerald-500/60 ${className}`}>
    <div className="rounded-2xl bg-neutral-950/95 backdrop-blur border border-white/10">
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
      active
        ? 'border-white/20 bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]'
        : 'border-white/10 text-white/70 hover:bg-white/5 hover:text-white'
    }`}
    aria-pressed={active}
  >
    <span className="p-2 rounded-lg bg-white/5 border border-white/10">{icon}</span>
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
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
      ) : (
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
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
        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
      />
    </div>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'constructor' as 'constructor' | 'client',
  });
  const [isLoading, setIsLoading] = useState(false);

  const safeLogin = (email: string, userType: 'constructor' | 'client') => {
    if (onLogin) onLogin(email, userType);
    else console.log('[Login demo] onLogin', { email, userType });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      safeLogin(formData.email, formData.userType);
      setIsLoading(false);
    }, 700);
  };

  const quickLogin = (email: string, type: 'constructor' | 'client') => {
    setIsLoading(true);
    setTimeout(() => {
      safeLogin(email, type);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <Building2 className="w-10 h-10 text-cyan-300" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-semibold tracking-tight">Obrix</h1>
              <p className="text-sm text-white/60 -mt-0.5">Gestión de Obras</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h2>
          <p className="text-sm text-white/60">Accedé a tu panel de control</p>
        </div>

        <NeonPanel>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <p className="block text-xs text-white/70 mb-2">Tipo de usuario</p>
              <div className="grid grid-cols-2 gap-3">
                <ToggleButton
                  active={formData.userType === 'constructor'}
                  onClick={() => setFormData({ ...formData, userType: 'constructor' })}
                  icon={<Building2 className="w-6 h-6 text-cyan-300" />}
                  label="Constructor/a"
                />
                <ToggleButton
                  active={formData.userType === 'client'}
                  onClick={() => setFormData({ ...formData, userType: 'client' })}
                  icon={<User className="w-6 h-6 text-emerald-300" />}
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
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 py-3 text-sm font-medium text-black/90 hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-cyan-300" />
                  <div>
                    <div className="text-sm font-medium">Juan Pérez — Constructor</div>
                    <div className="text-xs text-white/60">juan@construcciones.com</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => quickLogin('maria@gmail.com', 'client')}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-300" />
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
          © 2024 Obrix. Gestión profesional de obras.
        </div>
      </div>
    </div>
  );
};

export default Login;

// Demos simples para validar el componente sin contexto
export const LoginDemoConstructor: React.FC = () => (
  <Login onLogin={(email) => console.log('demo login constructor', email)} />
);
export const LoginDemoClient: React.FC = () => (
  <Login onLogin={(email) => console.log('demo login client', email)} />
);
