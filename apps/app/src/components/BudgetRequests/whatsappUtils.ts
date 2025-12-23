export const cleanPhone = (raw: string) => raw.replace(/\D/g, '');

export const splitRecipients = (s: string) =>
  s.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean);

export const padRight = (str: string, len: number): string => {
  const s = String(str || '').slice(0, len);
  return s + ' '.repeat(Math.max(0, len - s.length));
};

export const truncate = (str: string, max: number): string => {
  const s = String(str || '');
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
};

export const waSanitize = (s: string) =>
  String(s ?? '')
    .replace(/m²/g, 'm2')
    .replace(/m³/g, 'm3')
    .replace(/\t/g, ' ')
    .replace(/…/g, '...')
    .trim();

export const truncateSafe = (str: string, max: number): string => {
  const s = waSanitize(str);
  return s.length > max ? s.slice(0, Math.max(0, max - 3)) + '...' : s;
};

export const padRightSafe = (str: string, len: number): string => {
  const s = truncateSafe(str, len);
  return s + ' '.repeat(Math.max(0, len - s.length));
};

export const joinCols = (cols: string[], widths: number[]) =>
  cols.map((c, i) => padRightSafe(c, widths[i])).join('  ');

export const composeInviteTail = (_: string) => `\n\nNo tenés cuenta en Obrix aún. Unite acá y gestionemos todo desde la app: https://obrix.app/`;
