import { NOW } from '@/lib/mock/dashboard';
import type { Tone } from '@/lib/types';

// Every date is shown in Dubai time, so the server (UTC) and the browser
// render the same text.
const TZ = 'Asia/Dubai';

export const fmtNum = (n: number) => Number(n).toLocaleString('en-AE');
export const aed = (n: number) => 'AED ' + fmtNum(n);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: TZ });

/** Hours between `iso` and the prototype's clock. */
export const hoursSince = (iso: string) => (new Date(NOW).getTime() - new Date(iso).getTime()) / 36e5;

/** Waiting time as the prototype writes it: `just now`, `5 h`, `4 d 1 h`. */
export const ago = (iso: string) => {
  const h = Math.max(0, Math.round(hoursSince(iso)));
  if (h < 1) return 'just now';
  if (h < 24) return h + ' h';
  const d = Math.floor(h / 24);
  return d + ' d ' + (h % 24) + ' h';
};

// Status badge colours, all design-system tokens.
export const TONE: Record<Tone, { bg: string; fg: string }> = {
  warning: { bg: 'var(--warning-opacity-10)', fg: 'var(--warning-variable-700)' },
  success: { bg: 'var(--success-opacity-10)', fg: 'var(--success-variables-700)' },
  error: { bg: 'var(--error-opacity-10)', fg: 'var(--error-500)' },
  info: { bg: 'var(--activities-blue-opacity-10)', fg: 'var(--activities-blue-variable-700)' },
  neutral: { bg: 'var(--color-surface-muted)', fg: 'var(--pure-black-variable-300)' },
  brand: { bg: 'var(--color-surface-tint-purple)', fg: 'var(--color-brand-purple)' },
};

export const tone = (t: Tone) => TONE[t] ?? TONE.neutral;
