import React from 'react';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowUpRightIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// 🎨 Paleta restringida a cyan–teal–verde (sin violetas/fucsias)
// Sin dependencias nuevas ni comentarios multilinea para evitar errores de cierre.

export type ObrixUser = { name?: string } | null | undefined;
export type ObrixProject = {
  id: string;
  name?: string;
  address?: string;
  budget?: number | string;
  spent?: number | string;
  status?: 'in_progress' | 'completed' | 'planning' | string;
  progress?: number | string;
  whatsapp?: string;
};

export type DashboardProps = {
  projects?: ObrixProject[];
  user?: ObrixUser;
};

const toNumber = (v: unknown, def = 0) => {
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : def;
};

const formatARS = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n);

const NeonCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`relative rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/60 to-emerald-500/60 ${className}`}>
    <div className="rounded-2xl bg-neutral-950/95 backdrop-blur-sm border border-white/10">
      {children}
    </div>
  </div>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  hint?: string;
}> = ({ icon, label, value, hint }) => (
  <NeonCard>
    <div className="p-4 sm:p-6 flex items-start gap-3">
      <div className="shrink-0 rounded-xl bg-white/5 border border-white/10 p-3">{icon}</div>
      <div className="flex-1">
        <p className="text-xs sm:text-sm text-white/60">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{value}</p>
          {hint && (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
              <ChartBarIcon className="w-3.5 h-3.5" /> {hint}
            </span>
          )}
        </div>
      </div>
    </div>
  </NeonCard>
);

const StatusPill: React.FC<{ status?: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string }> = {
    in_progress: { label: 'En progreso', cls: 'bg-cyan-400/15 text-cyan-300 border-cyan-300/20' },
    completed: { label: 'Completada', cls: 'bg-emerald-400/15 text-emerald-300 border-emerald-300/20' },
    planning: { label: 'Planificación', cls: 'bg-teal-400/15 text-teal-300 border-teal-300/20' },
  };
  const { label, cls } = map[status || 'planning'] || map.planning;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border ${cls}`}>
      <CheckCircleIcon className="w-3.5 h-3.5" /> {label}
    </span>
  );
};

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const WhatsAppButton: React.FC<{ phone?: string; text: string }> = ({ phone, text }) => {
  if (!phone) return null;
  const href = `https://wa.me/${phone.replace(/[^\d+]/g, '')}?text=${encodeURIComponent(text)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10 transition"
    >
      <ChatBubbleLeftRightIcon className="w-4 h-4" /> WhatsApp
      <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-70" />
    </a>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ projects: inputProjects, user: inputUser }) => {
  const projects = (inputProjects ?? []) as ObrixProject[];
  const user = inputUser ?? { name: '—' };

  const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
  const totalBudget = projects.reduce((sum, p) => sum + toNumber(p?.budget), 0);
  const totalSpent = projects.reduce((sum, p) => sum + toNumber(p?.spent), 0);
  const pendingTasks = 5;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="sticky top-0 z-10 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500" />
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold tracking-tight">Dashboard</h1>
              <p className="text-xs text-white/60">Bienvenido, {user?.name}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistema operativo OK
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard icon={<BuildingOfficeIcon className="w-5 h-5 text-cyan-300" />} label="Obras activas" value={activeProjects} hint="+3 este mes" />
          <StatCard icon={<CurrencyDollarIcon className="w-5 h-5 text-emerald-300" />} label="Presupuesto total" value={formatARS(totalBudget)} />
          <StatCard icon={<ClockIcon className="w-5 h-5 text-teal-300" />} label="Tareas pendientes" value={pendingTasks} />
          <StatCard icon={<CheckCircleIcon className="w-5 h-5 text-emerald-300" />} label="Gastado" value={formatARS(totalSpent)} />
        </div>

        <NeonCard>
          <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight">Obras recientes</h2>
            <button className="text-xs rounded-lg px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition">Ver todas</button>
          </div>
          <div className="p-4 sm:p-6">
            {projects.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-medium truncate">{p?.name}</p>
                      <p className="text-xs sm:text-sm text-white/60 truncate">{p?.address}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusPill status={p?.status} />
                        <span className="text-xs text-white/50">{formatARS(toNumber(p?.spent))} / {formatARS(toNumber(p?.budget))}</span>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/3 flex flex-col gap-1">
                      <ProgressBar value={toNumber(p?.progress)} />
                      <div className="text-right text-xs text-white/60">{toNumber(p?.progress)}%</div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <WhatsAppButton phone={p?.whatsapp} text={`Hola, te escribo por el proyecto *${p?.name}* en Obrix.`} />
                      <a href="#" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 transition">
                        Ver detalle <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-center py-10">No hay obras registradas</p>
            )}
          </div>
        </NeonCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          <NeonCard>
            <div className="p-5 sm:p-6">
              <p className="text-sm text-white/70">Acción rápida</p>
              <h3 className="text-lg font-semibold mt-1">Crear solicitud de presupuesto</h3>
              <p className="text-sm text-white/60 mt-1">Guía paso a paso con adjuntos y alcance.</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-medium hover:opacity-90 transition">
                Iniciar <ArrowUpRightIcon className="w-4 h-4" />
              </button>
            </div>
          </NeonCard>
          <NeonCard>
            <div className="p-5 sm:p-6">
              <p className="text-sm text-white/70">Acción rápida</p>
              <h3 className="text-lg font-semibold mt-1">Registrar cobro/pago</h3>
              <p className="text-sm text-white/60 mt-1">Impacta en el Cashflow y en el proyecto vinculado.</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm hover:bg-white/15 transition">
                Abrir <ArrowUpRightIcon className="w-4 h-4" />
              </button>
            </div>
          </NeonCard>
          <NeonCard>
            <div className="p-5 sm:p-6">
              <p className="text-sm text-white/70">Acción rápida</p>
              <h3 className="text-lg font-semibold mt-1">Invitar constructor/estudio</h3>
              <p className="text-sm text-white/60 mt-1">Enviá invitación con rol y permisos.</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm hover:bg-white/15 transition">
                Invitar <ArrowUpRightIcon className="w-4 h-4" />
              </button>
            </div>
          </NeonCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
