'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { NoAccess } from '@/components/shell/NoAccess';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Dialog, FIELD } from '@/components/ui/Dialog';
import { FilterField } from '@/components/ui/FilterField';
import { Icon } from '@/components/ui/Icon';
import { getClients } from '@/lib/data/clients';
import { fmtDate } from '@/lib/format';
import type { Client, Tone } from '@/lib/types';

export type Demo = 'live' | 'loading' | 'empty' | 'error';
type StatusFilter = 'all' | Client['status'];

const STATUS: Record<Client['status'], [string, Tone]> = { active: ['Active', 'success'], suspended: ['Suspended', 'error'], deleted: ['Deleted', 'neutral'] };
const CHIPS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'deleted', label: 'Deleted' },
];
const COLS = 'grid grid-cols-[minmax(200px,1.6fr)_minmax(180px,1.4fr)_110px_120px_120px_36px] items-center';
const GREY = 'px-3 text-[var(--pure-black-variable-300)]';
const CARD = 'flex flex-col rounded-xl bg-white p-5 shadow-card';
const H2 = 'm-0 mb-2 font-display text-lg font-semibold';
const LINE = 'flex justify-between gap-3 border-t border-subtle py-3 text-sm';

const initials = (n: string) =>
  n
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export function Clients({ demo }: { demo: Demo }) {
  const router = useRouter();
  const selId = useSearchParams().get('id');
  const { role, flash } = useAdmin();

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [list, setList] = useState<Client[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [dlg, setDlg] = useState<'suspend' | 'unsuspend' | null>(null);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [exporting, setExporting] = useState(false);
  const exportTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(() => {
    getClients()
      .then((c) => {
        setList(c);
        setLoaded(true);
      })
      .catch(() => setFailed(true));
  }, []);
  useEffect(fetchData, [fetchData]);
  useEffect(() => () => clearTimeout(exportTimer.current), []);

  if (role === 'moderator') {
    return <NoAccess title="Moderators can't open Clients." body="Switch role in the top bar to see this section." />;
  }

  const isError = demo === 'error' || failed;
  const isLoading = !isError && (demo === 'loading' || !loaded);
  const ready = !isError && !isLoading;
  const all = demo === 'empty' ? [] : list;
  const sel = ready && selId ? all.find((c) => c.id === selId) ?? null : null;

  const setC = (id: string, patch: Partial<Client>) => setList((xs) => xs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const closeDlg = () => {
    setDlg(null);
    setErr('');
  };
  const confirm = () => {
    if (!sel) return;
    if (dlg === 'suspend') {
      if (!text.trim()) return setErr('Add a reason. The client sees it in the email and in the app.');
      setC(sel.id, { status: 'suspended', suspendReason: text.trim() });
      flash(sel.name + ' suspended. They get an email with the reason.');
    }
    if (dlg === 'unsuspend') {
      setC(sel.id, { status: 'active', suspendReason: undefined });
      flash(sel.name + ' can use the app again. They get an email.');
    }
    closeDlg();
  };

  // --- Detail ---
  if (sel) {
    const del = sel.status === 'deleted';
    const [label, tone] = STATUS[sel.status];
    const banner = del
      ? 'The client deleted their account from the app. Reviews show as “Deleted client”; past bookings stay with the business for their records.'
      : sel.status === 'suspended'
        ? 'Suspended: ' + sel.suspendReason + '. Their reviews are hidden.'
        : sel.deletionRequested
          ? 'This client asked for account deletion in T-2275. Clients delete their own account in the app, under Settings › Delete account. Email them those steps from the ticket.'
          : '';
    const bannerStyle = del
      ? { background: 'var(--color-surface-muted)', color: 'var(--pure-black-variable-400)' }
      : sel.status === 'suspended'
        ? { background: 'var(--error-opacity-10)', color: 'var(--error-500)' }
        : { background: 'var(--activities-blue-opacity-10)', color: 'var(--activities-blue-variable-700)' };
    const prefRows: [string, string[]][] = [
      ['Food', sel.prefs.food.length ? sel.prefs.food : ['Not set']],
      ['Activities', sel.prefs.activities.length ? sel.prefs.activities : ['Not set']],
      ['Budget', [sel.prefs.budget]],
      ['Must-haves', sel.prefs.tags.length ? sel.prefs.tags : ['None']],
    ];
    const [dTitle, dDesc, dCta, danger] =
      dlg === 'unsuspend'
        ? ['Unsuspend ' + sel.name + '?', 'They can book again and hidden reviews come back. They get an email.', 'Unsuspend', false]
        : ['Suspend ' + sel.name + '?', 'They can’t book and their reviews are hidden until you unsuspend. They get an email with the reason.', 'Suspend', true];

    return (
      <>
        <Link href="/clients" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium no-underline">
          <Icon name="arrow-left" size={16} />
          Clients
        </Link>
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-tint-purple font-button text-lg font-bold text-brand-purple">{del ? '—' : initials(sel.name)}</span>
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="m-0 font-display text-[28px] font-bold leading-[1.2] text-brand-purple">{sel.name}</h1>
              <Badge tone={tone} dot>
                {label}
              </Badge>
            </div>
            <span className="text-sm text-muted">
              {sel.contact} · Signed up with {sel.method} · Joined {fmtDate(sel.joined)} · {sel.city}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="text"
              className="px-2"
              onClick={() => {
                if (exporting) return;
                setExporting(true);
                exportTimer.current = setTimeout(() => {
                  setExporting(false);
                  flash('Data export for ' + sel.name + ' is ready. Download link sent to johndoe@thechoicesapp.com.');
                }, 1400);
              }}
            >
              {exporting ? 'Preparing export' : 'Export their data'}
            </Button>
            {sel.status === 'active' && (
              <button
                type="button"
                onClick={() => {
                  setDlg('suspend');
                  setText('');
                  setErr('');
                }}
                className="h-[38px] cursor-pointer rounded-pill border-none bg-transparent px-4 font-button text-sm font-bold text-error shadow-[inset_0_0_0_1px_var(--error-500)] hover:bg-[var(--error-opacity-10)]"
              >
                Suspend
              </button>
            )}
            {sel.status === 'suspended' && (
              <Button variant="outline" size="sm" onClick={() => setDlg('unsuspend')}>
                Unsuspend
              </Button>
            )}
          </div>
        </div>
        {banner && (
          <div className="flex items-center gap-2.5 rounded-[14px] px-4 py-3 text-sm" style={bannerStyle}>
            {banner}
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-4">
          <section className={`${CARD} gap-3.5`}>
            <h2 className="m-0 font-display text-lg font-semibold">Preferences</h2>
            {prefRows.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-2">
                <span className="text-[13px] text-muted">{k}</span>
                <div className="flex flex-wrap gap-1.5">
                  {v.map((t) => (
                    <span key={t} className="inline-flex h-7 items-center rounded-pill bg-tint-purple px-3 text-[13px] text-brand-purple">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className={CARD}>
            <h2 className={H2}>Bookings</h2>
            {!sel.bookings.length && <span className="py-4 text-sm text-muted">No bookings yet.</span>}
            {sel.bookings.map((b) => (
              <div key={b.business + b.date} className={LINE}>
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{b.business}</span>
                  <span className="text-xs text-muted">
                    {fmtDate(b.date)} · {b.people} people
                  </span>
                </span>
                <span className="text-[13px] text-[var(--pure-black-variable-300)]">{b.status}</span>
              </div>
            ))}
          </section>

          <section className={CARD}>
            <h2 className={H2}>Reviews written</h2>
            {!sel.reviews.length && <span className="py-4 text-sm text-muted">No reviews yet.</span>}
            {sel.reviews.map((r) => (
              <div key={r.business + r.date} className="flex flex-col gap-1 border-t border-subtle py-3 text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{r.business}</span>
                  <span className="text-[var(--warning-500)]">{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</span>
                  <span className="text-xs text-muted">{fmtDate(r.date)}</span>
                </span>
                <span className="leading-normal text-[var(--pure-black-variable-400)]">{r.text}</span>
              </div>
            ))}
          </section>

          <section className={CARD}>
            <h2 className={H2}>Reports against them</h2>
            {!sel.reports.length && <span className="py-4 text-sm text-muted">No reports.</span>}
            {sel.reports.map((r) => (
              <Link key={r.by + r.date} href="/reports" className={`${LINE} text-ink no-underline hover:text-ink`}>
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{r.reason}</span>
                  <span className="text-xs text-muted">
                    By {r.by} · {fmtDate(r.date)}
                  </span>
                </span>
                <Badge tone="warning">{r.status}</Badge>
              </Link>
            ))}
          </section>

          <section className={CARD}>
            <h2 className={H2}>Devices</h2>
            {sel.devices.map((d) => (
              <div key={d.name} className={LINE}>
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-xs text-muted">Last seen {d.last}</span>
                </span>
                <span className="text-[13px] text-[var(--pure-black-variable-300)]">App {d.app}</span>
              </div>
            ))}
          </section>
        </div>

        {dlg && (
          <Dialog
            title={dTitle as string}
            description={dDesc as string}
            width={500}
            onClose={closeDlg}
            footer={
              <>
                <Button variant="text" onClick={closeDlg} className="px-3">
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={confirm}
                  className={`h-[38px] cursor-pointer rounded-pill border-none px-[18px] font-button text-sm font-bold text-white ${danger ? 'bg-error' : 'bg-brand-purple'}`}
                >
                  {dCta}
                </button>
              </>
            }
          >
            {dlg === 'suspend' && (
              <label className="flex flex-col gap-2 text-sm">
                Reason (required)
                <textarea
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setErr('');
                  }}
                  rows={3}
                  placeholder="Spam reviews linking to competitors"
                  className={`${FIELD} resize-y py-3 leading-normal`}
                />
              </label>
            )}
            {err && <span className="text-[13px] text-error">{err}</span>}
          </Dialog>
        )}
      </>
    );
  }

  // --- List ---
  const ql = q.trim().toLowerCase();
  const rows = ready ? all.filter((c) => (status === 'all' || c.status === status) && (!ql || (c.name + c.contact).toLowerCase().includes(ql))) : [];

  return (
    <>
      <PageHeader title="Clients" subtitle={ready ? `${all.length} clients shown · 48,210 total · 1,284 joined this week` : 'Loading'} />
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterField value={q} onChange={setQ} placeholder="Name, email or phone" className="max-w-[340px] flex-[1_1_240px]" />
        <ChipGroup label="Status" chips={CHIPS} value={status} onChange={setStatus} />
      </div>
      <div className="overflow-hidden rounded-xl bg-white shadow-card">
        <div className="overflow-x-auto">
          <div className="min-w-[780px]">
            <div className={`${COLS} h-11 text-xs font-semibold uppercase tracking-[.06em] text-muted`}>
              <span className="px-5">Name</span>
              <span className="px-3">Email or phone</span>
              <span className="px-3">Sign-up</span>
              <span className="px-3">Joined</span>
              <span className="px-3">Status</span>
              <span />
            </div>
            {isLoading &&
              [70, 55, 80, 60, 72].map((w) => (
                <div key={w} className="flex h-14 items-center border-t border-subtle px-5">
                  <div className="ca-pulse h-3.5 rounded-pill bg-surface-muted" style={{ width: w + '%' }} />
                </div>
              ))}
            {rows.map((c) => {
              const [label, tone] = STATUS[c.status];
              const open = () => {
                router.push('/clients?id=' + c.id);
                window.scrollTo(0, 0);
              };
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={open}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && open()}
                  className={`${COLS} min-h-14 cursor-pointer border-t border-subtle text-sm hover:bg-page`}
                >
                  <span className="flex min-w-0 items-center gap-3 px-5 py-2">
                    <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-tint-purple font-button text-xs font-bold text-brand-purple">{initials(c.name)}</span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-xs text-muted">{c.city}</span>
                    </span>
                  </span>
                  <span className={`${GREY} truncate`}>{c.contact}</span>
                  <span className={GREY}>{c.method}</span>
                  <span className={`${GREY} whitespace-nowrap`}>{fmtDate(c.joined)}</span>
                  <span className="px-3">
                    <Badge tone={tone} dot>
                      {label}
                    </Badge>
                  </span>
                  <span className="text-muted">
                    <Icon name="chevron-right" size={16} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {ready && rows.length === 0 && (
          <div className="flex flex-col gap-1.5 border-t border-subtle px-6 py-12 text-center">
            <span className="text-[15px] font-semibold">No clients match.</span>
            <span className="text-[13px] text-muted">Search by full email or phone number with country code.</span>
          </div>
        )}
        {isError && (
          <div role="alert" className="flex flex-col items-center gap-2.5 border-t border-subtle px-6 py-12 text-center">
            <span className="text-[15px] font-semibold">Couldn&apos;t load clients.</span>
            <Button
              size="sm"
              onClick={() => {
                setLoaded(false);
                setFailed(false);
                fetchData();
              }}
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
