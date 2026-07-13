// Central rules for who can see/act on each admin panel tab.
// Used on both the client (nav filtering, hiding buttons) and the server
// (API route guards in auth-helpers.ts), so keep this file free of
// browser-only or Next.js-only APIs.

export const ADMIN_TABS = [
  'overview',
  'applications',
  'users',
  'research',
  'events',
  'announcements',
  'messages',
] as const;

export type AdminTab = (typeof ADMIN_TABS)[number];

// 'admin' is the tech-dept role: can see everything except Users, can't act on anything.
const ADMIN_PANEL_ROLES = ['super_admin', 'admin', 'researcher', 'member'];

export function canAccessAdmin(role?: string | null): boolean {
  return !!role && ADMIN_PANEL_ROLES.includes(role);
}

export function canViewTab(role: string | undefined | null, tab: AdminTab): boolean {
  switch (role) {
    case 'super_admin':
      return true;
    case 'admin':
    case 'member':
      return tab !== 'users';
    case 'researcher':
      return tab === 'research';
    default:
      return false;
  }
}

export function canWriteTab(role: string | undefined | null, tab: AdminTab): boolean {
  if (role === 'super_admin') return true;
  if (role === 'member') return tab !== 'users';
  if (role === 'researcher') return tab === 'research'; // create only — moderation is separate
  return false; // 'admin' (tech-dept) is read-only everywhere it can see
}

// Publishing/rejecting/featuring/deleting research is a moderation action,
// distinct from a researcher's ability to create/submit one.
export function canModerateResearch(role?: string | null): boolean {
  return role === 'super_admin' || role === 'member';
}

export function defaultAdminPath(role?: string | null): string {
  return role === 'researcher' ? '/admin/research' : '/admin';
}
