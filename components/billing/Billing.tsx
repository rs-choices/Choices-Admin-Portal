'use client';

import { useEffect, useRef, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { NoAccess } from '@/components/shell/NoAccess';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { getBilling, type FailedRow } from '@/lib/data/billing';
import { aed, fmtDate } from '@/lib/format';
import type { Invoice, Plan, Refund, Subscription, Tone } from '@/lib/types';

type Tab = 'subs' | 'plans' | 'invoices' | 'failed' | 'refunds';

const TONE: Record<string, Tone> = { Active: 'success', Trial: 'info', 'Past due': 'error', Paused: 'neutral', Paid: 'success', Failed: 'error', Refunded: 'neutral' };
const CARD = 'rounded-xl bg-white shadow-card';
const HEAD = 'h-11 items-center text-xs font-semibold uppercase tracking-[.06em] text-muted';
const ROW = 'min-h-[52px] items-center border-t border-subtle text-sm';
const GREY = 'px-3 text-[var(--pure-black-variable-300)]';
const SUB_COLS = 'grid grid-cols-[minmax(200px,2fr)_110px_110px_120px_120px_110px]';
const INV_COLS = 'grid grid-cols-[140px_minmax(180px,2fr)_120px_110px_110px]';
const REF_COLS = 'grid grid-cols-[100px_140px_minmax(160px,1.5fr)_110px_120px_minmax(140px,1fr)]';
/** The prototype's one card that still declines on retry. */
const EXPIRED_CARD = 'INV-24-10022';

export function Billing() {
  const { role, flash } = useAdmin();
  const isSuper = role === 'super';
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>('subs');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [failed, setFailed] = useState<FailedRow[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [editPlan, setEditPlan] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const [retrying, setRetrying] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getBilling().then((r) => {
      setPlans(r.plans);
      setSubs(r.subs);
      setInvoices(r.invoices);
      setFailed(r.failed);
      setRefunds(r.refunds);
      setLoaded(true);
    });
    return () => clearTimeout(timer.current);
  }, []);

  if (role === 'moderator') {
    return <NoAccess title="Moderators can't open Billing." body="Switch role in the top bar to see this section." />;
  }

  const openFailed = failed.filter((f) => f.status === 'failed');

  const retry = (f: FailedRow) => {
    if (f.status === 'paid' || retrying) return;
    setRetrying(f.id);
    timer.current = setTimeout(() => {
      const ok = f.id !== EXPIRED_CARD;
      setRetrying(null);
      setFailed((xs) => xs.map((x) => (x.id === f.id ? { ...x, status: ok ? 'paid' : 'failed', attempts: x.attempts + 1, last: '2026-10-16' } : x)));
      if (ok) {
        setInvoices((xs) => xs.map((x) => (x.id === f.id ? { ...x, status: 'Paid' } : x)));
        setSubs((xs) => xs.map((x) => (x.business === f.business ? { ...x, status: 'Active' } : x)));
        flash(aed(f.amount) + ' collected from ' + f.business + '.');
      } else {
        flash('Retry failed: card expired. Contact ' + f.business + ' for a new card.', true);
      }
    }, 1200);
  };

  const savePrice = (p: Plan) => {
    const v = parseInt(editVal, 10);
    if (!v || v < 1) return flash('Enter a price above AED 0.', true);
    setPlans((xs) => xs.map((x) => (x.id === p.id ? { ...x, price: v } : x)));
    setEditPlan(null);
    flash(p.name + ' is now ' + aed(v) + ' a month for new subscriptions.');
  };

  const kpis = [
    { label: 'MRR', value: aed(184250), note: '↑ 3.6% vs last month' },
    { label: 'Active subscriptions', value: '393', note: '148 Starter · 214 Growth · 31 Enterprise' },
    { label: 'Trial to paid', value: '39%', note: 'Last 30 days' },
    { label: 'At risk', value: aed(openFailed.reduce((a, f) => a + f.amount, 0)), note: openFailed.length + ' failed payments' },
  ];

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="m-0 font-display text-[28px] font-bold leading-[1.2] text-brand-purple">Billing and revenue</h1>
          <span className="rounded-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.06em] text-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]">Later</span>
        </div>
        <span className="text-sm text-muted">393 paying businesses · 62 on trial · prices in AED, VAT included</span>
      </div>
      {!isSuper && (
        <div className="flex items-center gap-2.5 rounded-[14px] bg-[var(--activities-blue-opacity-10)] px-4 py-3 text-sm text-[var(--activities-blue-variable-700)]">
          View only for Admins. Refunds and price changes need a Super admin.
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`${CARD} flex flex-col gap-1.5 px-5 py-[18px]`}>
            <span className="text-[13px] text-muted">{k.label}</span>
            <span className="font-display text-2xl font-bold">{loaded ? k.value : '—'}</span>
            <span className="text-xs text-muted">{loaded ? k.note : ''}</span>
          </div>
        ))}
      </div>

      <div className="[&_[role=tab]_span]:bg-[var(--error-opacity-10)] [&_[role=tab]_span]:text-error">
        <Tabs
          tabs={[
            { id: 'subs', label: 'Subscriptions' },
            { id: 'plans', label: 'Plans and prices' },
            { id: 'invoices', label: 'Invoices' },
            { id: 'failed', label: 'Failed payments', count: openFailed.length || undefined },
            { id: 'refunds', label: 'Refunds' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'subs' && (
        <div className={`${CARD} overflow-x-auto`}>
          <div className="min-w-[760px]">
            <div className={`${SUB_COLS} ${HEAD}`}>
              <span className="px-5">Business</span>
              <span className="px-3">Plan</span>
              <span className="px-3">Status</span>
              <span className="px-3">Since</span>
              <span className="px-3">Next bill</span>
              <span className="px-3">Monthly</span>
            </div>
            {subs.map((s) => (
              <div key={s.business} className={`${SUB_COLS} ${ROW}`}>
                <span className="px-5 font-semibold">{s.business}</span>
                <span className={GREY}>{s.plan}</span>
                <span className="px-3">
                  <Badge tone={TONE[s.status]}>{s.status}</Badge>
                </span>
                <span className={GREY}>{fmtDate(s.since)}</span>
                <span className={GREY}>{s.next === '—' ? '—' : fmtDate(s.next)}</span>
                <span className="px-3 font-medium">{s.amount ? aed(s.amount) : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'plans' && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-4">
          {plans.map((p) => (
            <section key={p.id} className={`${CARD} flex flex-col gap-3 p-[22px]`}>
              <span className="font-display text-lg font-semibold">{p.name}</span>
              <span className="font-display text-[28px] font-bold text-brand-purple">
                {aed(p.price)}
                <span className="font-body text-sm font-normal text-muted"> / month</span>
              </span>
              <span className="text-[13px] text-muted">
                {p.outlets} · {p.subs} businesses
              </span>
              <div className="flex flex-col gap-1.5">
                {p.features.map((f) => (
                  <span key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-success">
                      <Icon name="check" size={14} />
                    </span>
                    {f}
                  </span>
                ))}
              </div>
              {editPlan === p.id ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">AED</span>
                    <input
                      type="number"
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && savePrice(p)}
                      aria-label={p.name + ' price'}
                      autoFocus
                      className="h-[38px] w-[90px] rounded-[12px] border-none bg-surface-muted px-2.5 text-sm font-medium outline-none focus:shadow-[inset_0_0_0_1px_var(--color-brand-purple)]"
                    />
                    <Button size="sm" onClick={() => savePrice(p)}>
                      Save
                    </Button>
                  </div>
                  <span className="text-xs text-muted">New price applies to new subscriptions. Existing ones keep their price until renewal.</span>
                </>
              ) : (
                isSuper && (
                  <span className="self-start">
                    <Button
                      variant="text"
                      onClick={() => {
                        setEditPlan(p.id);
                        setEditVal(String(p.price));
                      }}
                    >
                      Change price
                    </Button>
                  </span>
                )
              )}
            </section>
          ))}
        </div>
      )}

      {tab === 'invoices' && (
        <div className={`${CARD} overflow-x-auto`}>
          <div className="min-w-[640px]">
            {invoices.map((i, k) => (
              <div key={i.id} className={`${INV_COLS} ${ROW} ${k ? '' : 'border-t-0'}`}>
                <span className="px-5 font-semibold">{i.id}</span>
                <span className="px-3">{i.business}</span>
                <span className={GREY}>{fmtDate(i.date)}</span>
                <span className="px-3 font-medium">{aed(i.amount)}</span>
                <span className="px-3">
                  <Badge tone={TONE[i.status]}>{i.status}</Badge>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'failed' && (
        <>
          {loaded && failed.length === 0 && (
            <div className={`${CARD} flex flex-col gap-1.5 px-6 py-12 text-center`}>
              <span className="text-[15px] font-semibold">No failed payments.</span>
              <span className="text-[13px] text-muted">Cards that decline show up here.</span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {failed.map((f) => {
              const paid = f.status === 'paid';
              const busy = retrying === f.id;
              return (
                <section key={f.id} className={`${CARD} flex flex-wrap items-center gap-4 px-5 py-[18px]`}>
                  <div className="flex flex-[1_1_260px] flex-col gap-1">
                    <span className="text-[15px] font-semibold">
                      {f.business} · {aed(f.amount)}
                    </span>
                    <span className="text-[13px] text-muted">
                      {f.id} · {f.reason} · {f.attempts} attempts, last {fmtDate(f.last)}
                    </span>
                  </div>
                  <Badge tone={paid ? 'success' : 'error'}>{paid ? 'Paid' : 'Failed'}</Badge>
                  <a
                    href={'mailto:' + f.contact}
                    onClick={() => flash('Email to ' + f.contact + ' opened with the failed-payment template.')}
                    className="ds-button ds-button-outline ds-button-sm"
                  >
                    Contact business
                  </a>
                  <Button size="sm" disabled={paid || busy} onClick={() => retry(f)}>
                    {paid ? 'Paid' : busy ? 'Retrying' : 'Retry'}
                  </Button>
                </section>
              );
            })}
          </div>
        </>
      )}

      {tab === 'refunds' &&
        (isSuper ? (
          <>
            <div className={`${CARD} overflow-x-auto`}>
              <div className="min-w-[700px]">
                {refunds.map((r, k) => (
                  <div key={r.id} className={`${REF_COLS} min-h-14 items-center text-sm ${k ? 'border-t border-subtle' : ''}`}>
                    <span className="px-5 font-semibold">{r.id}</span>
                    <span className={GREY}>{r.invoice}</span>
                    <span className="px-3">{r.business}</span>
                    <span className="px-3 font-medium">{aed(r.amount)}</span>
                    <span className={GREY}>{fmtDate(r.date)}</span>
                    <span className="px-3 text-[13px] text-muted">
                      {r.by} · {r.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <span className="text-[13px] text-muted">To issue a new refund, open the business and use Subscription and invoices.</span>
          </>
        ) : (
          <div className={`${CARD} flex flex-col gap-1.5 px-6 py-12 text-center`}>
            <span className="text-[15px] font-semibold">Refunds are Super admin only.</span>
            <span className="text-[13px] text-muted">Ask Ahmad Karimi or John Doe to issue one.</span>
          </div>
        ))}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
        {[
          { title: 'Boosts', body: 'Paid placement for listings in For You and on the map. Pricing per day, per emirate.' },
          { title: 'Campaigns', body: 'Bundled boosts with push and banner placements, booked by date range.' },
        ].map((l) => (
          <section
            key={l.title}
            className="flex flex-col gap-1.5 rounded-xl p-5 shadow-[inset_0_0_0_1px_rgba(0,0,0,.1)] outline-dashed outline-1 -outline-offset-1 outline-[var(--primary-orange-opacity-40)]"
          >
            <span className="flex items-center gap-2">
              <span className="font-display text-[17px] font-semibold">{l.title}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-brand-peach">Coming later</span>
            </span>
            <span className="text-sm leading-normal text-muted">{l.body}</span>
          </section>
        ))}
      </div>
    </>
  );
}
