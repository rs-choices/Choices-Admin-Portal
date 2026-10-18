'use client';

import { Button } from '@/components/ui/Button';
import type { Duplicate, DuplicateSide } from '@/lib/types';

const FIELDS: [string, keyof DuplicateSide][] = [
  ['Name', 'name'],
  ['Area', 'area'],
  ['Trade licence', 'licence'],
  ['WhatsApp', 'whatsapp'],
  ['Owner', 'owner'],
  ['Outlets', 'outlets'],
  ['Joined', 'joined'],
];

// Two values "match" when equal or when their first comma part is equal
// (same area), as in the design.
const same = (a: string, b: string) => a === b || a.split(',')[0] === b.split(',')[0];

// Businesses and outlets are never merged: a flag is dismissed, or the new
// request is rejected and its owner is told the business already exists.
export function Duplicates({ dupes, onDismiss, onReject }: { dupes: Duplicate[]; onDismiss: (p: Duplicate) => void; onReject: (p: Duplicate) => void }) {
  if (dupes.length === 0) {
    return (
      <div className="flex flex-col gap-1.5 rounded-xl bg-white px-6 py-12 text-center shadow-card">
        <span className="text-[15px] font-semibold">No possible duplicates.</span>
        <span className="text-[13px] text-muted">New matches on location, name or WhatsApp number show up here.</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {dupes.map((p) => (
        <section key={p.id} className="ca-rise flex flex-col gap-4 rounded-xl bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-6 items-center rounded-pill bg-[var(--warning-opacity-10)] px-2.5 text-xs font-semibold text-[var(--warning-variable-700)]">
              {p.reason}
            </span>
            <span className="text-[13px] text-muted">Match score {p.score}%</span>
            <span className="flex-1" />
            <Button variant="outline" size="sm" onClick={() => onDismiss(p)}>
              Dismiss
            </Button>
            <Button size="sm" onClick={() => onReject(p)}>
              Reject: already exists
            </Button>
          </div>
          <div className="overflow-x-auto">
            <div className="grid min-w-[520px] grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] overflow-hidden rounded-[14px] text-sm shadow-[inset_0_0_0_1px_var(--color-border-subtle)]">
              <span className="bg-surface-muted px-3.5 py-2.5" />
              <span className="bg-surface-muted px-3.5 py-2.5 font-semibold">Existing · {p.a.status}</span>
              <span className="bg-surface-muted px-3.5 py-2.5 font-semibold">New · {p.b.status}</span>
              {FIELDS.map(([label, k]) => {
                const a = String(p.a[k]);
                const b = String(p.b[k]);
                const hl = k !== 'outlets' && k !== 'joined' && same(a, b) ? 'var(--warning-opacity-10)' : 'transparent';
                return (
                  <div key={k} className="contents">
                    <span className="border-t border-subtle px-3.5 py-2.5 text-[13px] text-muted">{label}</span>
                    <span className="border-t border-subtle px-3.5 py-2.5" style={{ background: hl }}>
                      {a}
                    </span>
                    <span className="border-t border-subtle px-3.5 py-2.5" style={{ background: hl }}>
                      {b}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
