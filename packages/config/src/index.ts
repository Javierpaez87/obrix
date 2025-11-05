export * from './types';

export const NEON_ACCENT = '#00FFA3';

export const ADMIN_ROLES = ['owner', 'admin'] as const;

export function hasAdminAccess(role: string): boolean {
  return ADMIN_ROLES.includes(role as any);
}
