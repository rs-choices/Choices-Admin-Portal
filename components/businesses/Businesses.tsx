'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { NoAccess } from '@/components/shell/NoAccess';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, FIELD } from '@/components/ui/Dialog';
import { Drawer } from '@/components/ui/Drawer';
import { FilterField } from '@/components/ui/FilterField';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import {
  BIZ_LABEL,
  BIZ_TONE,
  DETAIL_TABS,
  FILTER_DEFS,
  MEMBER_TONE,
  NO_FILTERS,
  buildDetail,
  listingName,
  withListing,
  initials,
  type BizFilters,
  type BizRow,
  type DetailTab,
} from '@/lib/businesses';
import { getBusinesses } from '@/lib/data/businesses';
import { aed, fmtDate, fmtNum } from '@/lib/format';
import type { BusinessDetail as Detail, Member } from '@/lib/types';
import { ME } from '@/lib/verification';
import { BusinessDetail } from './BusinessDetail';

export type Demo = 'live' | 'loading' | 'empty' | 'error';
type Dlg =
  | { kind: 'suspend' | 'unsuspend' }
  | { kind: 'unpub'; id: string }
  | { kind: 'repub'; id: string }
  | { kind: 'refund'; id: string }
  | { kind: 'memberSuspend'; email: string }
  | { kind: 'memberUnsuspend'; email: string }
  | null;

const BIZ_COLS = 'grid grid-cols-[minmax(220px,2fr)_90px_110px_110px_110px_110px_120px_36px] items-center';
const MEM_COLS = 'grid grid-cols-[minmax(220px,1.6fr)_minmax(180px,1.3fr)_100px_110px_120px_120px_36px] items-center';
const HEAD = 'h-11 text-xs font-semibold uppercase tracking-[.06em] text-muted';
const GREY = 'px-3 text-[var(--pure-black-variable-300)]';

export function Businesses({ demo }: { demo: Demo }) {
  const router = useRouter();
  const params = useSearchParams();
  const selId = params.get('id');
  const tabParam = params.get('tab');
  const tab: DetailTab = DETAIL_TABS.some((t) => t.id === tabParam) ? (tabParam as DetailTab) : 'overview';
  const { role, flash } = useAdmin();

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [list, setList] = useState<BizRow[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [details, setDetails] = useState<Record<string, Detail>>({});

  const [view, setView] = useState<'biz' | 'members'>('biz');
  const [q, setQ] = useState('');
  const [f, setF] = useState<BizFilters>(NO_FILTERS);
  const [mq, setMq] = useState('');
  const [mf, setMf] = useState({ role: 'all', status: 'all' });
  const [peekId, setPeekId] = useState<string | null>(null);

  const [dlg, setDlg] = useState<Dlg>(null);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const fetchData = useCallback(() => {
    getBusinesses()
      .then((r) => {
        setList(r.list);
        setAllMembers(r.members);
        setLoaded(true);
      })
      .catch(() => setFailed(true));
  }, []);
  useEffect(fetchData, [fetchData]);

  if (role === 'moderator') {
    return <NoAccess title="Moderators can't open Businesses." body="Switch role in the top bar to see this section." />;
  }

  const isError = demo === 'error' || failed;
  const isLoading = !isError && (demo === 'loading' || !loaded);
  const ready = !isError && !isLoading;
  const rowsAll = demo === 'empty' ? [] : list;
  const members = ready && demo !== 'empty' ? allMembers : [];
  const sel = ready && selId ? rowsAll.find((b) => b.id === selId) ?? null : null;
  const det = sel ? details[sel.id] ?? buildDetail(sel) : null;

  const go = (id: string | null, t?: DetailTab) => {
    router.push(id ? '/businesses?id=' + id + (t && t !== 'overview' ? '&tab=' + t : '') : '/businesses');
    window.scrollTo(0, 0);
  };
  const setB = (id: string, patch: Partial<BizRow>) => setList((xs) => xs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const patchDet = (id: string, base: BizRow, fn: (d: Detail) => Detail) =>
    setDetails((ds) => ({ ...ds, [id]: fn(ds[id] ?? buildDetail(base)) }));
  const act = (id: string, base: BizRow, what: string) =>
    patchDet(id, base, (d) => ({ ...d, activity: [{ at: new Date().toISOString(), who: ME, what }, ...d.activity] }));
  const openDlg = (d: Dlg) => {
    setDlg(d);
    setText('');
    setErr('');
  };
  const closeDlg = () => {
    setDlg(null);
    setErr('');
  };

  const confirm = () => {
    if (!dlg || !sel || !det) return;
    if (dlg.kind === 'memberSuspend' || dlg.kind === 'memberUnsuspend') {
      const m = allMembers.find((x) => x.email === dlg.email);
      if (!m) return closeDlg();
      if (dlg.kind === 'memberSuspend') {
        if (!text.trim()) return setErr('Add a reason. The member sees it in their suspension email.');
        setAllMembers((xs) => xs.map((x) => (x.email === m.email ? { ...x, status: 'Suspended', suspendReason: text.trim() } : x)));
        act(sel.id, sel, 'Suspended team member ' + m.name + ': ' + text.trim());
        flash(m.name + ' suspended. They can’t sign in to the Business Portal; ' + sel.name + ' stays live.');
      } else {
        setAllMembers((xs) => xs.map((x) => (x.email === m.email ? { ...x, status: 'Active', suspendReason: undefined } : x)));
        act(sel.id, sel, 'Unsuspended team member ' + m.name);
        flash(m.name + ' can sign in to the Business Portal again.');
      }
      return closeDlg();
    }
    if (dlg.kind === 'suspend') {
      if (!text.trim()) return setErr('Add a reason. The business sees it in their suspension email.');
      setB(sel.id, { status: 'suspended', suspendReason: text.trim(), prevStatus: sel.status });
      act(sel.id, sel, 'Suspended: ' + text.trim());
      flash(sel.name + ' suspended. Listings are hidden and the owner gets an email.');
    }
    if (dlg.kind === 'unsuspend') {
      setB(sel.id, { status: sel.prevStatus ?? 'active', suspendReason: undefined });
      act(sel.id, sel, 'Unsuspended');
      flash(sel.name + ' is active again. The owner gets an email.');
    }
    if (dlg.kind === 'unpub') {
      const name = listingName(det, dlg.id);
      patchDet(sel.id, sel, (d) => ({
        ...d,
        branches: withListing(d, dlg.id, 'Unpublished', ME),
        activity: [{ at: new Date().toISOString(), who: ME, what: 'Unpublished listing ' + name }, ...d.activity],
      }));
      flash(name + ' unpublished. Clients can no longer see it. The business gets an email.');
    }
    if (dlg.kind === 'repub') {
      const name = listingName(det, dlg.id);
      patchDet(sel.id, sel, (d) => ({
        ...d,
        branches: withListing(d, dlg.id, 'Published'),
        activity: [{ at: new Date().toISOString(), who: ME, what: 'Published listing ' + name + ' again' }, ...d.activity],
      }));
      flash(name + ' is live again. The business gets an email.');
    }
    if (dlg.kind === 'refund') {
      const amount = aed(sel.mrr || 199);
      patchDet(sel.id, sel, (d) => ({
        ...d,
        invoices: d.invoices.map((i) => (i.id === dlg.id ? { ...i, status: 'Refunded' } : i)),
        activity: [{ at: new Date().toISOString(), who: ME, what: 'Refunded ' + dlg.id + ' · ' + amount }, ...d.activity],
      }));
      flash(dlg.id + ' refunded · ' + amount + '. The business gets an email receipt.');
    }
    closeDlg();
  };

  const renderDialog = () => {
    if (!dlg || !sel) return null;
    const [title, desc, cta, danger] = (
      {
        suspend: ['Suspend ' + sel.name + '?', 'Listings disappear from the client app, open bookings stay valid, and the team is signed out.', 'Suspend', true],
        unsuspend: ['Unsuspend ' + sel.name + '?', 'Listings go back live and the team can sign in again.', 'Unsuspend', false],
        memberSuspend: [
          'Suspend ' + (allMembers.find((x) => dlg.kind === 'memberSuspend' && x.email === dlg.email)?.name ?? 'this member') + '?',
          'They can’t sign in to the Business Portal. ' + sel.name + ' and its listings stay live.',
          'Suspend',
          true,
        ],
        memberUnsuspend: [
          'Unsuspend ' + (allMembers.find((x) => dlg.kind === 'memberUnsuspend' && x.email === dlg.email)?.name ?? 'this member') + '?',
          'They can sign in to the Business Portal again.',
          'Unsuspend',
          false,
        ],
        unpub: ['Unpublish this listing?', 'Clients stop seeing it straight away. The business gets an email, and you can publish it again later.', 'Unpublish', true],
        repub: ['Publish this listing again?', 'Clients can see it straight away. The business gets an email.', 'Publish again', false],
        refund: [
          'Refund ' + (dlg.kind === 'refund' ? dlg.id : '') + '?',
          aed(sel.mrr || 199) + ' goes back to the card on file. Banks take 5 to 10 working days.',
          'Issue refund',
          true,
        ],
      } as const
    )[dlg.kind];
    return (
      <Dialog
        title={title}
        description={desc}
        onClose={closeDlg}
        footer={
          <>
            <Button variant="text" onClick={closeDlg} className="px-3">
              Cancel
            </Button>
            <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={confirm}>
              {cta}
            </Button>
          </>
        }
      >
        {(dlg.kind === 'suspend' || dlg.kind === 'memberSuspend') && (
          <label className="flex flex-col gap-2 text-sm">
            {dlg.kind === 'suspend' ? 'Reason (required, shown to the business)' : 'Reason (required, shown to the member)'}
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErr('');
              }}
              rows={3}
              placeholder="Repeated reports of cancelled bookings without refund"
              className={`${FIELD} resize-y py-3 leading-normal`}
            />
          </label>
        )}
        {err && <span className="text-[13px] text-error">{err}</span>}
      </Dialog>
    );
  };

  // --- Detail ---
  if (sel && det) {
    return (
      <>
        <BusinessDetail
          b={sel}
          det={det}
          members={members}
          tab={tab}
          role={role}
          onTab={(t) => router.replace('/businesses?id=' + sel.id + (t === 'overview' ? '' : '&tab=' + t), { scroll: false })}
          onSuspend={() => openDlg({ kind: 'suspend' })}
          onUnsuspend={() => openDlg({ kind: 'unsuspend' })}
          onSuspendMember={(email) => openDlg({ kind: 'memberSuspend', email })}
          onUnsuspendMember={(email) => openDlg({ kind: 'memberUnsuspend', email })}
          onUnpublish={(id) => openDlg({ kind: 'unpub', id })}
          onRepublish={(id) => openDlg({ kind: 'repub', id })}
          onRefund={(id) => openDlg({ kind: 'refund', id })}
        />
        {renderDialog()}
      </>
    );
  }

  // --- List ---
  const ql = q.trim().toLowerCase();
  const rows = ready
    ? rowsAll
        .filter((b) => (f.status === 'all' || b.status === f.status) && (f.plan === 'all' || b.plan === f.plan) && (f.type === 'all' || b.types.includes(f.type)) && (f.emirate === 'all' || b.emirate === f.emirate))
        .filter((b) => !ql || (b.name + b.owner + b.email + b.licence).toLowerCase().includes(ql))
    : [];
  const hasFilters = Object.values(f).some((v) => v !== 'all') || !!ql;

  const mql = mq.trim().toLowerCase();
  const memberRows = members.filter(
    (m) => (mf.role === 'all' || m.role === mf.role) && (mf.status === 'all' || m.status === mf.status) && (!mql || (m.name + m.email + m.business).toLowerCase().includes(mql)),
  );

  const peek = ready && peekId ? rowsAll.find((b) => b.id === peekId) ?? null : null;

  return (
    <>
      <PageHeader
        title="Businesses"
        subtitle={
          ready
            ? `${rowsAll.length} businesses · ${rowsAll.filter((b) => b.status === 'trial').length} on trial · ${rowsAll.filter((b) => b.status === 'suspended').length} suspended`
            : 'Loading'
        }
      />
      <Tabs
        tabs={[
          { id: 'biz', label: 'Businesses', count: rowsAll.length },
          { id: 'members', label: 'All members', count: members.length },
        ]}
        value={view}
        onChange={setView}
      />

      {view === 'biz' && (
        <>
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterField value={q} onChange={setQ} placeholder="Name, owner, email or licence" className="max-w-[340px] flex-[1_1_260px]" />
            {FILTER_DEFS.map((d) => (
              <FilterSelect key={d.key} label={d.label} value={f[d.key]} options={d.options} onChange={(v) => setF((x) => ({ ...x, [d.key]: v }))} />
            ))}
            {hasFilters && (
              <Button
                variant="text"
                onClick={() => {
                  setF(NO_FILTERS);
                  setQ('');
                }}
                className="px-2"
              >
                Clear filters
              </Button>
            )}
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-card">
            <div className="overflow-x-auto">
              <div className="min-w-[940px]">
                <div className={`${BIZ_COLS} ${HEAD}`}>
                  <span className="px-5">Business</span>
                  <span className="px-3">Type</span>
                  <span className="px-3">Emirate</span>
                  <span className="px-3">Plan</span>
                  <span className="px-3">Status</span>
                  <span className="px-3">Outlets</span>
                  <span className="px-3">Joined</span>
                  <span />
                </div>
                {isLoading &&
                  [72, 60, 80, 55, 68, 75].map((w) => (
                    <div key={w} className="flex h-14 items-center border-t border-subtle px-5">
                      <div className="ca-pulse h-3.5 rounded-pill bg-surface-muted" style={{ width: w + '%' }} />
                    </div>
                  ))}
                {rows.map((b) => (
                  <div
                    key={b.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPeekId(b.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPeekId(b.id)}
                    className={`${BIZ_COLS} min-h-14 cursor-pointer border-t border-subtle text-sm hover:bg-page ${peekId === b.id ? 'bg-page' : ''}`}
                  >
                    <span className="flex min-w-0 items-center gap-3 px-5 py-2">
                      <span className="grid size-[34px] shrink-0 place-items-center rounded-[12px] bg-tint-purple font-button text-xs font-bold text-brand-purple">{initials(b.name)}</span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-semibold">{b.name}</span>
                        <span className="truncate text-xs text-muted">
                          {b.owner} · {b.email}
                        </span>
                      </span>
                    </span>
                    <span className={GREY}>{b.types.join(', ')}</span>
                    <span className={GREY}>{b.emirate}</span>
                    <span className={GREY}>{b.plan}</span>
                    <span className="px-3">
                      <Badge tone={BIZ_TONE[b.status]} dot>
                        {BIZ_LABEL[b.status]}
                      </Badge>
                    </span>
                    <span className={GREY}>
                      {b.branches} br · {b.outlets} out
                    </span>
                    <span className={`${GREY} whitespace-nowrap`}>{fmtDate(b.joined)}</span>
                    <span className="text-muted">
                      <Icon name="panel-right-open" size={16} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {ready && rows.length === 0 && (
              <div className="flex flex-col items-center gap-1.5 border-t border-subtle px-6 py-12 text-center">
                <span className="text-[15px] font-semibold">No businesses match these filters.</span>
                <span className="text-[13px] text-muted">Clear a filter or search by trade licence number.</span>
              </div>
            )}
            {isError && (
              <div role="alert" className="flex flex-col items-center gap-2.5 border-t border-subtle px-6 py-12 text-center">
                <span className="text-[15px] font-semibold">Couldn&apos;t load businesses.</span>
                <span className="text-[13px] text-muted">The directory service timed out. Nothing was changed.</span>
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
      )}

      {view === 'members' && (
        <>
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterField value={mq} onChange={setMq} placeholder="Member name, email or business" className="max-w-[360px] flex-[1_1_260px]" />
            <FilterSelect
              label="Role"
              value={mf.role}
              options={[
                ['all', 'All roles'],
                ['Owner', 'Owner'],
                ['Manager', 'Manager'],
                ['Staff', 'Staff'],
              ]}
              onChange={(v) => setMf((x) => ({ ...x, role: v }))}
            />
            <FilterSelect
              label="Status"
              value={mf.status}
              options={[
                ['all', 'All statuses'],
                ['Active', 'Active'],
                ['Invited', 'Invited'],
                ['Suspended', 'Suspended'],
              ]}
              onChange={(v) => setMf((x) => ({ ...x, status: v }))}
            />
            <span className="text-[13px] text-muted">
              {memberRows.length} of {members.length} members
            </span>
          </div>
          <div className="overflow-hidden rounded-xl bg-white shadow-card">
            <div className="overflow-x-auto">
              <div className="min-w-[900px]">
                <div className={`${MEM_COLS} ${HEAD}`}>
                  <span className="px-5">Member</span>
                  <span className="px-3">Business</span>
                  <span className="px-3">Role</span>
                  <span className="px-3">Status</span>
                  <span className="px-3">Last active</span>
                  <span className="px-3">Joined</span>
                  <span />
                </div>
                {memberRows.map((m) => {
                  const b = rowsAll.find((x) => x.id === m.bid);
                  return (
                    <div
                      key={m.email}
                      role="button"
                      tabIndex={0}
                      onClick={() => go(m.bid, 'team')}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && go(m.bid, 'team')}
                      className={`${MEM_COLS} min-h-14 cursor-pointer border-t border-subtle text-sm hover:bg-page`}
                    >
                      <span className="flex min-w-0 items-center gap-3 px-5 py-2">
                        <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-tint-purple font-button text-xs font-bold text-brand-purple">{initials(m.name)}</span>
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span className="font-semibold">{m.name}</span>
                          <span className="truncate text-xs text-muted">{m.email}</span>
                        </span>
                      </span>
                      <span className="flex flex-col gap-0.5 px-3">
                        <span className="font-medium text-brand-purple">{m.business}</span>
                        <span className="text-xs text-muted">
                          {b?.types.join(', ') ?? ''} · {b?.emirate ?? ''}
                        </span>
                      </span>
                      <span className={GREY}>{m.role}</span>
                      <span className="px-3">
                        <Badge tone={MEMBER_TONE[m.status]} dot>
                          {m.status}
                        </Badge>
                      </span>
                      <span className={`${GREY} whitespace-nowrap`}>{m.last}</span>
                      <span className={`${GREY} whitespace-nowrap`}>{fmtDate(m.joined)}</span>
                      <span className="text-muted">
                        <Icon name="chevron-right" size={16} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            {ready && memberRows.length === 0 && (
              <div className="flex flex-col items-center gap-1.5 border-t border-subtle px-6 py-12 text-center">
                <span className="text-[15px] font-semibold">No members match.</span>
                <span className="text-[13px] text-muted">Search by full email, or clear the role and status filters.</span>
              </div>
            )}
          </div>
        </>
      )}

      {peek && (
        <Drawer label={peek.name} onClose={() => setPeekId(null)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-tint-purple font-button text-[15px] font-bold text-brand-purple">{initials(peek.name)}</span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-lg font-bold">{peek.name}</span>
                <span className="text-[13px] text-muted">
                  {peek.types.join(', ')} · {peek.emirate}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPeekId(null)}
              aria-label="Close"
              className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-none bg-surface-muted text-ink"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
          <span className="w-fit">
            <Badge tone={BIZ_TONE[peek.status]} dot>
              {BIZ_LABEL[peek.status]}
            </Badge>
          </span>
          <div className="flex flex-col">
            {(
              [
                ['Owner', peek.owner],
                ['Email', peek.email],
                ['Phone', peek.phone],
                ['Plan', peek.plan + (peek.status === 'trial' && peek.trialEnds ? ' · trial ends ' + fmtDate(peek.trialEnds) : '')],
                ['MRR', peek.mrr ? aed(peek.mrr) : '—'],
                ['Branches · outlets', peek.branches + ' · ' + peek.outlets],
                ['Rating', peek.reviews ? peek.rating + ' from ' + fmtNum(peek.reviews) + ' reviews' : 'No reviews yet'],
                ['Bookings, 30 days', fmtNum(peek.bookings30)],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-t border-subtle py-2.5 text-sm">
                <span className="text-muted">{k}</span>
                <span className="text-right font-medium">{v}</span>
              </div>
            ))}
          </div>
          <span className="self-start">
            <Button
              size="sm"
              onClick={() => {
                setPeekId(null);
                go(peek.id);
              }}
            >
              Open full profile
            </Button>
          </span>
        </Drawer>
      )}
    </>
  );
}
