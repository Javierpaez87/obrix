import React, { useMemo, useState } from 'react';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowUpRightIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

import RequestForm from '../components/BudgetRequests/RequestForm';

export type ObrixUser = { name?: string; role?: 'client' | 'constructor' } | null | undefined;
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

type Role = 'client' | 'constructor';

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

const formatUSD = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

const formatPct = (n: number) => `${Math.round(n)}%`;

const NeonCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`relative rounded-2xl p-[1px] bg-gradient-to-r from-cyan-500/60 to-emerald-500/60 ${className}`}>
    <div className="rounded-2xl bg-neutral-950/95 backdrop-blur-sm border border-white/10">{children}</div>
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

const SectionHeader: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between">
    <h2 className="text-base sm:text-lg font-semibold tracking-tight">{title}</h2>
    {right}
  </div>
);

const MiniPill: React.FC<{ label: string; tone?: 'ok' | 'warn' | 'danger' }> = ({ label, tone = 'ok' }) => {
  const map = {
    ok: 'bg-emerald-400/10 text-emerald-300 border-emerald-300/20',
    warn: 'bg-teal-400/10 text-teal-200 border-teal-200/20',
    danger: 'bg-cyan-400/10 text-cyan-200 border-cyan-200/20',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${map[tone]}`}>{label}</span>;
};

const mockDashboardData = {
  client: {
    invested: { ars: 12850000, usd: 12450 },
    pendingPaymentsArs: { total: 2350000, overdue: 420000, next7Days: 980000 },
    delays: { delayedProjects: 2, avgDelayDays: 6, maxDelayDays: 14 },
    criticalPending: [
      { id: 'p1', title: 'Aprobar presupuesto de materiales (Corralón Patagonia)', severity: 'high' as const },
      { id: 'p2', title: "Definir fecha de inicio de etapa 'Terminaciones'", severity: 'medium' as const },
      { id: 'p3', title: 'Pago de anticipo pendiente para compra de aberturas', severity: 'high' as const },
    ],
  },
  constructor: {
    revenue: { week: 1850000, month: 7420000, ytd: 58200000 },
    receivables: { total: 4150000, overdue: 950000, next7Days: 1250000 },
    projects: { active: 5, planning: 2, completed: 11, avgProgress: 54 },
    costs: { month: 4980000, varianceVsBudget: 0.12 },
    alerts: [
      { id: 'a1', type: 'delay', title: 'Casa Los Coihues: atraso por materiales', severity: 'high' as const },
      { id: 'a2', type: 'payment', title: 'Cliente Rodríguez: cobro vencido ($420.000)', severity: 'high' as const },
      { id: 'a3', type: 'approval', title: 'Presupuesto #184 sin respuesta hace 6 días', severity: 'medium' as const },
    ],
  },
};

const Dashboard: React.FC<DashboardProps> = ({ projects: inputProjects, user: inputUser }) => {
  const projects = (inputProjects ?? []) as ObrixProject[];
  const user = inputUser ?? { name: '—', role: 'client' };

  const inferredRole: Role = (user as any)?.role === 'constructor' ? 'constructor' : 'client';
  const [mockRole, setMockRole] = useState<Role>(inferredRole);

  const role: Role = mockRole;

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState<'constructor' | 'supplier'>('constructor');

  const projectIdForRequest = projects?.[0]?.id;

  const openRequest = (t: 'constructor' | 'supplier') => {
    setRequestType(t);
    setIsRequestOpen(true);
  };

  const closeRequest = () => setIsRequestOpen(false);

  const inviteHref = useMemo(() => {
    const baseLink = 'https://obrix.netlify.app';
    const msg =
      `Hola! Te invito a sumarte a Obrix para colaborar en un proyecto.\n\n` +
      `Elegí tu rol al registrarte:\n` +
      `• Constructor/Estudio\n` +
      `• Cliente\n\n` +
      `Link: ${baseLink}`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }, []);

  const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
  const planningProjects = projects.filter((p) => p.status === 'planning').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  const totalBudget = projects.reduce((sum, p) => sum + toNumber(p?.budget), 0);
  const totalSpent = projects.reduce((sum, p) => sum + toNumber(p?.spent), 0);

  const avgProgress = useMemo(() => {
    const values = projects.map((p) => toNumber(p?.progress, NaN)).filter((n) => Number.isFinite(n)) as number[];
    if (values.length === 0) return 0;
    const s = values.reduce((a, b) => a + b, 0);
    return s / values.length;
  }, [projects]);

  const pendingTasks = 5;

  const clientData = mockDashboardData.client;
  const ctorData = mockDashboardData.constructor;

  const topStats = useMemo(() => {
    if (role === 'client') {
      return [
        {
          key: 'invested',
          icon: <BanknotesIcon className="w-5 h-5 text-emerald-300" />,
          label: 'Total invertido (ARS)',
          value: formatARS(clientData.invested.ars),
          hint: `USD ${formatUSD(clientData.invested.usd)}`,
        },
        {
          key: 'pending',
          icon: <CurrencyDollarIcon className="w-5 h-5 text-cyan-300" />,
          label: 'Pagos pendientes (ARS)',
          value: formatARS(clientData.pendingPaymentsArs.total),
          hint: clientData.pendingPaymentsArs.overdue > 0 ? `Vencidos ${formatARS(clientData.pendingPaymentsArs.overdue)}` : undefined,
        },
        {
          key: 'delays',
          icon: <ClockIcon className="w-5 h-5 text-teal-300" />,
          label: 'Delays',
          value: clientData.delays.delayedProjects,
          hint: `Máx ${clientData.delays.maxDelayDays} días`,
        },
        {
          key: 'pending_critical',
          icon: <ExclamationTriangleIcon className="w-5 h-5 text-cyan-200" />,
          label: 'Pendientes críticos',
          value: clientData.criticalPending.length,
          hint: clientData.pendingPaymentsArs.next7Days > 0 ? `7 días ${formatARS(clientData.pendingPaymentsArs.next7Days)}` : undefined,
        },
      ];
    }

    return [
      {
        key: 'rev_month',
        icon: <CurrencyDollarIcon className="w-5 h-5 text-emerald-300" />,
        label: 'Revenue (Mes)',
        value: formatARS(ctorData.revenue.month),
        hint: `Semana ${formatARS(ctorData.revenue.week)}`,
      },
      {
        key: 'receivables',
        icon: <BanknotesIcon className="w-5 h-5 text-cyan-300" />,
        label: 'Cobros pendientes',
        value: formatARS(ctorData.receivables.total),
        hint: ctorData.receivables.overdue > 0 ? `Vencidos ${formatARS(ctorData.receivables.overdue)}` : undefined,
      },
      {
        key: 'projects_active',
        icon: <BuildingOfficeIcon className="w-5 h-5 text-teal-300" />,
        label: 'Obras activas',
        value: ctorData.projects.active,
        hint: `Avance ${formatPct(ctorData.projects.avgProgress)}`,
      },
      {
        key: 'costs',
        icon: <ClipboardDocumentCheckIcon className="w-5 h-5 text-emerald-300" />,
        label: 'Costos (Mes)',
        value: formatARS(ctorData.costs.month),
        hint: `Desvío +${Math.round(ctorData.costs.varianceVsBudget * 100)}%`,
      },
    ];
  }, [role, clientData, ctorData]);

  const secondaryStats = useMemo(() => {
    if (role === 'client') {
      return [
        {
          key: 'projects',
          icon: <BuildingOfficeIcon className="w-5 h-5 text-cyan-300" />,
          label: 'Obras activas',
          value: activeProjects,
          hint: planningProjects > 0 ? `Planif. ${planningProjects}` : undefined,
        },
        {
          key: 'budget',
          icon: <CurrencyDollarIcon className="w-5 h-5 text-emerald-300" />,
          label: 'Presupuesto total',
          value: formatARS(totalBudget),
        },
        {
          key: 'tasks',
          icon: <ClockIcon className="w-5 h-5 text-teal-300" />,
          label: 'Pendientes (general)',
          value: pendingTasks,
        },
        {
          key: 'spent',
          icon: <CheckCircleIcon className="w-5 h-5 text-emerald-300" />,
          label: 'Gastado (estimado)',
          value: formatARS(totalSpent),
          hint: avgProgress > 0 ? `Avance ${formatPct(avgProgress)}` : undefined,
        },
      ];
    }

    return [
      {
        key: 'ytd',
        icon: <ChartBarIcon className="w-5 h-5 text-emerald-300" />,
        label: 'Revenue (YTD)',
        value: formatARS(ctorData.revenue.ytd),
        hint: completedProjects > 0 ? `Completadas ${completedProjects}` : undefined,
      },
      {
        key: 'planning',
        icon: <BuildingOfficeIcon className="w-5 h-5 text-cyan-300" />,
        label: 'En planificación',
        value: ctorData.projects.planning,
      },
      {
        key: 'tasks',
        icon: <ClockIcon className="w-5 h-5 text-teal-300" />,
        label: 'Tareas pendientes',
        value: pendingTasks,
      },
      {
        key: 'spent',
        icon: <CheckCircleIcon className="w-5 h-5 text-emerald-300" />,
        label: 'Gastado (estimado)',
        value: formatARS(totalSpent),
        hint: avgProgress > 0 ? `Avance ${formatPct(avgProgress)}` : undefined,
      },
    ];
  }, [
    role,
    activeProjects,
    planningProjects,
    completedProjects,
    totalBudget,
    totalSpent,
    pendingTasks,
    avgProgress,
    ctorData.revenue.ytd,
    ctorData.projects.planning,
  ]);

  const renderRolePanel = () => {
    if (role === 'client') {
      return (
        <NeonCard>
          <SectionHeader
            title="Pendientes críticos de la obra"
            right={
              <button className="text-xs rounded-lg px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition">
                Ver todo
              </button>
            }
          />
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {clientData.criticalPending.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <div className="mt-1">
                      <MiniPill label={p.severity === 'high' ? 'Alta' : 'Media'} tone={p.severity === 'high' ? 'danger' : 'warn'} />
                    </div>
                  </div>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 transition"
                  >
                    Ver detalle <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Pagos vencidos</p>
                <p className="mt-1 text-lg font-semibold">{formatARS(clientData.pendingPaymentsArs.overdue)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Por vencer (7 días)</p>
                <p className="mt-1 text-lg font-semibold">{formatARS(clientData.pendingPaymentsArs.next7Days)}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-white/60">Atraso promedio</p>
                <p className="mt-1 text-lg font-semibold">{clientData.delays.avgDelayDays} días</p>
              </div>
            </div>
          </div>
        </NeonCard>
      );
    }

    return (
      <NeonCard>
        <SectionHeader
          title="Alertas operativas"
          right={
            <button className="text-xs rounded-lg px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition">
              Ver todo
            </button>
          }
        />
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            {ctorData.alerts.map((a) => (
              <div
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <MiniPill label={a.type === 'payment' ? 'Cobros' : a.type === 'approval' ? 'Presupuestos' : 'Delays'} tone="warn" />
                    <MiniPill label={a.severity === 'high' ? 'Alta' : 'Media'} tone={a.severity === 'high' ? 'danger' : 'warn'} />
                  </div>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 transition"
                >
                  Ir <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/60">Vencidos</p>
              <p className="mt-1 text-lg font-semibold">{formatARS(ctorData.receivables.overdue)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/60">Por cobrar (7 días)</p>
              <p className="mt-1 text-lg font-semibold">{formatARS(ctorData.receivables.next7Days)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/60">Desvío vs presupuesto</p>
              <p className="mt-1 text-lg font-semibold">+{Math.round(ctorData.costs.varianceVsBudget * 100)}%</p>
            </div>
          </div>
        </div>
      </NeonCard>
    );
  };

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

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistema operativo OK
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
              <button
                onClick={() => setMockRole('client')}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  role === 'client' ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Cliente
              </button>
              <button
                onClick={() => setMockRole('constructor')}
                className={`px-3 py-1.5 text-xs rounded-lg transition ${
                  role === 'constructor' ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                Constructor
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {topStats.map((s) => (
            <StatCard key={s.key} icon={s.icon} label={s.label} value={s.value} hint={s.hint} />
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {secondaryStats.map((s) => (
            <StatCard key={s.key} icon={s.icon} label={s.label} value={s.value} hint={s.hint} />
          ))}
        </div>

        {renderRolePanel()}

        <NeonCard>
          <SectionHeader
            title="Obras recientes"
            right={
              <button className="text-xs rounded-lg px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 transition">
                Ver todas
              </button>
            }
          />
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
                        <span className="text-xs text-white/50">
                          {formatARS(toNumber(p?.spent))} / {formatARS(toNumber(p?.budget))}
                        </span>
                      </div>
                    </div>

                    <div className="w-full sm:w-1/3 flex flex-col gap-1">
                      <ProgressBar value={toNumber(p?.progress)} />
                      <div className="text-right text-xs text-white/60">{toNumber(p?.progress)}%</div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <WhatsAppButton phone={p?.whatsapp} text={`Hola, te escribo por el proyecto *${p?.name}* en Obrix.`} />
                      <a
                        href="#"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10 transition"
                      >
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

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => openRequest('constructor')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-medium hover:opacity-90 transition"
                >
                  Solicitar a constructor <ArrowUpRightIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openRequest('supplier')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm hover:bg-white/15 transition"
                >
                  Solicitar materiales <ArrowUpRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </NeonCard>

          <NeonCard>
            <div className="p-5 sm:p-6">
              <p className="text-sm text-white/70">Acción rápida</p>
              <h3 className="text-lg font-semibold mt-1">Registrar cobro/pago</h3>
              <p className="text-sm text-white/60 mt-1">Impacta en el Cashflow y en el proyecto vinculado.</p>
              <a
                href="https://obrix.netlify.app/payments"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm hover:bg-white/15 transition"
              >
                Abrir <ArrowUpRightIcon className="w-4 h-4" />
              </a>
            </div>
          </NeonCard>

          <NeonCard>
            <div className="p-5 sm:p-6">
              <p className="text-sm text-white/70">Acción rápida</p>
              <h3 className="text-lg font-semibold mt-1">Invitar a alguien</h3>
              <p className="text-sm text-white/60 mt-1">Enviá invitación con rol y permisos.</p>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <a
                  href={inviteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm hover:bg-white/15 transition"
                >
                  Invitar Constructor/Estudio <ArrowUpRightIcon className="w-4 h-4" />
                </a>

                <a
                  href={inviteHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-sm hover:bg-white/15 transition"
                >
                  Invitar Cliente <ArrowUpRightIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </NeonCard>
        </div>
      </div>

      <RequestForm
        isOpen={isRequestOpen}
        onClose={closeRequest}
        projectId={projectIdForRequest}
        requestType={requestType}
        theme="light"
      />
    </div>
  );
};

export default Dashboard;
