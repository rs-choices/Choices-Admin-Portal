'use client';

import { useMemo, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { NoAccess } from '@/components/shell/NoAccess';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Badge } from '@/components/ui/Badge';
import { AUDIT } from '@/lib/mock/audit';
import { fmtDateTime } from '@/lib/format';

// The prototype's "today" in Dubai, which ends every date range.
const TODAY = '2026-10-16';
const COLS = 'grid grid-cols-[150px_170px_190px_minmax(220px,1fr)_100px] items-center';
const DATE = 'h-8 rounded-[10px] border-none bg-surface-muted px-2 text-[13px] font-medium text-ink';

/** First day of a range of `days` days ending today, as `YYYY-MM-DD`. */
function presetFrom(days: string) {
  const d = new Date(TODAY + 'T12:00:00+04:00');
  d.setDate(d.getDate() - ((parseInt(days, 10) || 1) - 1));
  return d.toISOString().slice(0, 10);
}
const dubaiDay = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Dubai' });

export function AuditLog() {
  const { role, flash } = useAdmin();
  const [who, setWho] = useState('all');
  const [action, setAction] = useState('all');
  const [preset, setPreset] = useState('7');
  const [from, setFrom] = useState(presetFrom('7'));
  const [to, setTo] = useState(TODAY);

  const inDates = useMemo(() => (at: string) => {
    const d = dubaiDay(at);
    return d >= from && d <= to;
  }, [from, to]);

  if (role !== 'super') return <NoAccess title="The audit log is Super admin only." body="Switch role in the top bar to see it." />;

  const rows = AUDIT.filter((r) => (who === 'all' || r.who === who) && (action === 'all' || r.action === action) && inDates(r.at));
  const count = (k: 'who' | 'action', v: string) => AUDIT.filter((r) => r[k] === v && inDates(r.at)).length;
  const admins = [...new Set(AUDIT.map((r) => r.who))].sort();
  const actions = [...new Set(AUDIT.map((r) => r.action))].sort();
  const anyFilter = who !== 'all' || action !== 'all' || preset !== '7';

  const exportCsv = () => {
    if (!rows.length) return flash('Nothing to export with these filters.');
    const q = (v: string) => '"' + v.replace(/"/g, '""') + '"';
    const csv = ['When,Admin,Action,On,Type', ...rows.map((r) => [r.at, r.who, r.action, r.target, r.kind].map(q).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'choices-audit-log.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    flash(rows.length + ' actions exported to choices-audit-log.csv.');
  };

  return (
    <>
      <PageHeader
        title="Audit log"
        subtitle="Every admin action, read only. Kept for 2 years."
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2.5">
        <Combobox label="Admin" allLabel="All admins" value={who} onChange={setWho} options={admins.map((v) => ({ value: v, label: v, count: count('who', v) }))} />
        <Combobox label="Action" allLabel="All actions" value={action} onChange={setAction} options={actions.map((v) => ({ value: v, label: v, count: count('action', v) }))} />
        <div className="flex flex-wrap items-center gap-2 rounded-[14px] bg-white py-1 pl-3 pr-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]">
          <select
            aria-label="Date range"
            value={preset}
            onChange={(e) => {
              const v = e.target.value;
              setPreset(v);
              if (v !== 'custom') {
                setFrom(presetFrom(v));
                setTo(TODAY);
              }
            }}
            className="h-8 cursor-pointer border-none bg-transparent text-[13px] font-medium text-ink"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom</option>
          </select>
          <span className="h-5 w-px bg-[var(--color-border-subtle)]" />
          <label className="flex items-center gap-1.5 text-xs text-muted">
            From
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => {
                setFrom(e.target.value || from);
                setPreset('custom');
              }}
              className={DATE}
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted">
            To
            <input
              type="date"
              value={to}
              min={from}
              max={TODAY}
              onChange={(e) => {
                setTo(e.target.value || to);
                setPreset('custom');
              }}
              className={DATE}
            />
          </label>
        </div>
        {anyFilter && (
          <Button
            variant="text"
            className="px-2"
            onClick={() => {
              setWho('all');
              setAction('all');
              setPreset('7');
              setFrom(presetFrom('7'));
              setTo(TODAY);
            }}
          >
            Clear filters
          </Button>
        )}
        <span className="text-[13px] text-muted">
          {rows.length} of {AUDIT.length} actions
        </span>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <div className="min-w-[820px]">
          <div className={`${COLS} h-11 text-xs font-semibold uppercase tracking-[.06em] text-muted`}>
            <span className="px-5">When</span>
            <span className="px-3">Admin</span>
            <span className="px-3">Action</span>
            <span className="px-3">On</span>
            <span className="px-3">Type</span>
          </div>
          {rows.map((r) => (
            <div key={r.at + r.action + r.target} className={`${COLS} min-h-[50px] border-t border-subtle text-sm`}>
              <span className="whitespace-nowrap px-5 tabular-nums text-[var(--pure-black-variable-300)]">{fmtDateTime(r.at)}</span>
              <span className="px-3 font-medium">{r.who}</span>
              <span className="px-3">{r.action}</span>
              <span className="px-3 text-[var(--pure-black-variable-400)]">{r.target}</span>
              <span className="px-3">
                <Badge tone="neutral">{r.kind}</Badge>
              </span>
            </div>
          ))}
        </div>
        {rows.length === 0 && (
          <div className="flex flex-col gap-1.5 border-t border-subtle px-6 py-12 text-center">
            <span className="text-[15px] font-semibold">No actions match these filters.</span>
            <span className="text-[13px] text-muted">Widen the date range or pick another admin.</span>
          </div>
        )}
      </div>
    </>
  );
}
