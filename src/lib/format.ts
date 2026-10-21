import { DEMO_TODAY } from './catalog';

export function demoHash(password: string): string {
  let h = 2166136261;
  for (let i = 0; i < password.length; i++) {
    h ^= password.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `demo:${(h >>> 0).toString(16).padStart(8, '0')}`;
}

export function money(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatWhen(iso: string, timeZone = 'America/Los_Angeles'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

export function formatDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function withinWindow(admissionDate: string | null, years: number, today = DEMO_TODAY): boolean {
  if (!admissionDate) return false;
  const admitted = new Date(`${admissionDate}T00:00:00.000Z`);
  const now = new Date(today);
  if (Number.isNaN(admitted.getTime()) || admitted > now) return false;
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - years);
  return admitted >= cutoff;
}

export function uid(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  inquiry: 'New inquiry',
  conflict_review: 'Conflict review',
  proposal_sent: 'Proposal sent',
  engagement_accepted: 'Engagement accepted',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
  disputed: 'Disputed (demo)',
  requested: 'Requested',
  proposed: 'Proposed',
  confirmed: 'Confirmed',
  rescheduled: 'Reschedule requested',
  pending: 'Pending',
  cleared: 'Cleared',
  conflict_found: 'Conflict found',
  sent: 'Sent',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
  open: 'Open',
  paid: 'Paid (simulated)',
  rejected: 'Rejected',
  approved: 'Approved (simulated)',
  not_admitted: 'Not admitted',
};
