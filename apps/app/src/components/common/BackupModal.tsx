import React, { useMemo, useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';

type BackupKey = 'projects' | 'budgets' | 'payments' | 'agenda' | 'profile' | 'all';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NEON = '#00FFA3';

const escapeCsv = (value: unknown) => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const downloadTextFile = (filename: string, content: string, mime = 'text/csv;charset=utf-8') => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const toCsvFromObjects = (rows: Array<Record<string, unknown>>, filename: string) => {
  const allKeys = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const header = allKeys;
  const body = rows.map((r) => header.map((k) => escapeCsv(r?.[k])).join(','));
  const csv = [header.join(','), ...body].join('\n');
  downloadTextFile(filename, csv);
};

const normalizeRows = (items: any[]): Array<Record<string, unknown>> => {
  // Normaliza arrays de objetos; si vienen cosas raras, lo intenta serializar
  return (items || []).map((it) => {
    if (it && typeof it === 'object' && !Array.isArray(it)) return it as Record<string, unknown>;
    return { value: typeof it === 'string' ? it : JSON.stringify(it) };
  });
};

const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { user } = useApp() as any;

  // 👇 Ajustá estos nombres si en tu AppContext se llaman diferente
  const app = useApp() as any;
  const projects = (app?.projects ?? []) as any[];
  const budgetRequests = (app?.budgetRequests ?? app?.budgets ?? app?.requests ?? []) as any[];
  const payments = (app?.expenses ?? app?.payments ?? []) as any[];
  const agendaItems = (app?.contacts ?? app?.agenda ?? app?.events ?? app?.tasks ?? []) as any[];

  const [downloading, setDownloading] = useState<BackupKey | null>(null);

  const counts = useMemo(() => {
    return {
      projects: projects?.length ?? 0,
      budgets: budgetRequests?.length ?? 0,
      payments: payments?.length ?? 0,
      agenda: agendaItems?.length ?? 0,
    };
  }, [projects, budgetRequests, payments, agendaItems]);

  const safePrefix = useMemo(() => {
    const name = (user?.name || 'usuario').toString().trim().replace(/\s+/g, '_').slice(0, 30);
    const date = new Date().toISOString().slice(0, 10);
    return `obrix_backup_${name}_${date}`;
  }, [user?.name]);

  const exportProfile = () => {
    const profileRow: Record<string, unknown> = {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      company: user?.company,
      phone: user?.phone,
      avatar: user?.avatar,
      created_at: user?.created_at,
      updated_at: user?.updated_at,
    };
    toCsvFromObjects([profileRow], `${safePrefix}_perfil.csv`);
  };

  const exportProjects = () => {
    toCsvFromObjects(normalizeRows(projects), `${safePrefix}_proyectos.csv`);
  };

  const exportBudgets = () => {
    toCsvFromObjects(normalizeRows(budgetRequests), `${safePrefix}_presupuestos.csv`);
  };

  const exportPayments = () => {
    toCsvFromObjects(normalizeRows(payments), `${safePrefix}_pagos.csv`);
  };

  const exportAgenda = () => {
    toCsvFromObjects(normalizeRows(agendaItems), `${safePrefix}_agenda.csv`);
  };

  const runExport = async (key: BackupKey) => {
    try {
      setDownloading(key);

      if (key === 'projects') exportProjects();
      if (key === 'budgets') exportBudgets();
      if (key === 'payments') exportPayments();
      if (key === 'agenda') exportAgenda();
      if (key === 'profile') exportProfile();

      if (key === 'all') {
        // “Todo”: descarga múltiples CSVs (uno por módulo)
        exportProjects();
        exportBudgets();
        exportPayments();
        exportAgenda();
        exportProfile();
      }
    } catch (e) {
      console.error('Backup export error', e);
      alert('No se pudo generar el backup. Revisá consola para más detalle.');
    } finally {
      setDownloading(null);
    }
  };

  if (!isOpen) return null;

  const Btn: React.FC<{
    k: BackupKey;
    title: string;
    subtitle: string;
  }> = ({ k, title, subtitle }) => (
    <button
      onClick={() => runExport(k)}
      disabled={!!downloading}
      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-white font-semibold">{title}</div>
          <div className="text-white/60 text-sm">{subtitle}</div>
        </div>
        <div className="flex items-center gap-2">
          {downloading === k ? (
            <span className="text-white/70 text-sm">Generando…</span>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm text-white/80">
              <ArrowDownTrayIcon className="h-5 w-5" />
              CSV
            </span>
          )}
        </div>
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl rounded-2xl bg-neutral-950 border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,255,163,0.12)', border: '1px solid rgba(0,255,163,0.25)' }}
            >
              <CircleStackIcon className="h-6 w-6" style={{ color: NEON }} />
            </div>
            <div>
              <div className="text-white font-semibold text-lg">BackUp</div>
              <div className="text-white/60 text-sm">
                Descargá tus datos en CSV (por módulo o todo junto)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
            title="Cerrar"
          >
            <XMarkIcon className="h-5 w-5 text-white/80" />
          </button>
        </div>

        <div className="p-4 sm:p-5 grid gap-3">
          <Btn k="projects" title="1. Proyectos" subtitle={`${counts.projects} registros`} />
          <Btn k="budgets" title="2. Presupuestos" subtitle={`${counts.budgets} registros`} />
          <Btn k="payments" title="3. Pagos" subtitle={`${counts.payments} registros`} />
          <Btn k="agenda" title="4. Agenda" subtitle={`${counts.agenda} registros`} />
          <Btn k="profile" title="5. Perfil" subtitle="Datos de tu cuenta" />
          <Btn k="all" title="6. Todo" subtitle="Descarga 5 CSVs (uno por módulo)" />

          <div className="text-xs text-white/50 pt-1">
            Nota: “Todo” descarga varios archivos CSV (no ZIP) para evitar dependencias extra.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupModal;
