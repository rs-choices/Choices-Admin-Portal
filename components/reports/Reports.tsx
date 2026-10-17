'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, FIELD } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { Timeline } from '@/components/ui/Timeline';
import { getModeration, isActive, recipients, type ModItem, type ModStatus, type ModTab } from '@/lib/data/moderation';
import { ago, fmtDate, fmtDateTime, hoursSince } from '@/lib/format';
import type { HistoryEntry, Tone } from '@/lib/types';
import { ME } from '@/lib/verification';

export type Demo = 'live' | 'loading' | 'empty' | 'error';
type Dlg = 'remove' | 'warn' | 'fix' | 'message' | 'warnClient' | 'suspendClient' | null;

const EMPTY: Record<ModTab, ModItem[]> = { reviews: [], listings: [], clients: [] };
const STATUS: Record<ModStatus, [string, Tone]> = {
  open: ['Open', 'warning'],
  fixing: ['Waiting on business', 'info'],
  kept: ['Kept', 'neutral'],
  removed: ['Removed', 'error'],
  dismissed: ['Dismissed', 'neutral'],
  warned: ['Warned', 'warning'],
  suspended: ['Suspended', 'error'],
};

const reporterName = (x: ModItem) => (x.reporter ?? '').replace('Client · ', '');
const titleOf = (x: ModItem) =>
  x.kind === 'review' ? x.author + ' on ' + x.business : x.kind === 'client' ? (x.client ?? '') + ' · reported by ' + x.business : x.sub + (x.target ? ' · ' + x.target.kind.toLowerCase() + ' ' + x.target.name : '') + ' · ' + x.business;
const dotOf = (h: HistoryEntry) =>
  /Removed|Suspended/.test(h.what)
    ? 'var(--error-500)'
    : /Kept|fixed|Dismissed/.test(h.what)
      ? 'var(--success-500)'
      : /Warned|Asked/.test(h.what)
        ? 'var(--warning-500)'
        : 'var(--color-brand-purple)';

export function Reports({ demo }: { demo: Demo }) {
  const { flash, bumpCount } = useAdmin();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [items, setItems] = useState(EMPTY);
  const [tab, setTab] = useState<ModTab>('reviews');
  const [sel, setSel] = useState<Partial<Record<ModTab, string>>>({});
  const [dlg, setDlg] = useState<Dlg>(null);
  const [text, setText] = useState('');
  const [err, setErr] = useState('');
  const [msgTo, setMsgTo] = useState('');

  const fetchData = useCallback(() => {
    getModeration()
      .then((r) => {
        setItems(r);
        setSel({ reviews: r.reviews[0]?.id, listings: r.listings[0]?.id, clients: r.clients[0]?.id });
        setLoaded(true);
      })
      .catch(() => setFailed(true));
  }, []);
  useEffect(fetchData, [fetchData]);

  const isError = demo === 'error' || failed;
  const isLoading = !isError && (demo === 'loading' || !loaded);
  const ready = !isError && !isLoading;
  const all = demo === 'empty' ? EMPTY : items;
  const openCount = (k: ModTab) => all[k].filter(isActive).length;
  // Open and waiting items first, then resolved ones, each group in data order.
  const list = ready ? [...all[tab]].sort((a, b) => (isActive(a) ? 0 : 1) - (isActive(b) ? 0 : 1)) : [];
  const it = list.find((x) => x.id === sel[tab]);

  const patch = (id: string, fn: (x: ModItem) => ModItem) => setItems((s) => ({ ...s, [tab]: s[tab].map((x) => (x.id === id ? fn(x) : x)) }));
  const log = (x: ModItem, what: string): HistoryEntry[] => [...x.history, { at: new Date().toISOString(), who: ME, what }];
  const resolve = (x: ModItem, status: ModStatus, what: string, msg: string) => {
    // Kept content goes back live; removed content stays down.
    patch(x.id, (y) => ({ ...y, status, hidden: status === 'removed' ? y.hidden : false, history: log(y, what) }));
    bumpCount('reports', -1);
    flash(msg);
  };
  const openDlg = (d: Dlg) => {
    setDlg(d);
    setText('');
    setErr('');
    if (it) setMsgTo(recipients(it)[0].id);
  };
  const closeDlg = () => {
    setDlg(null);
    setErr('');
  };
  const confirm = () => {
    if (!it || !dlg) return;
    const note = text.trim();
    if (dlg === 'remove') {
      resolve(
        it,
        'removed',
        'Removed' + (note ? ': ' + note : ''),
        it.kind === 'review'
          ? 'Review removed. ' + it.author + ' gets an email with the reason and ' + it.business + ' is told.'
          : it.sub + ' removed. ' + it.business + ' gets an email and ' + reporterName(it) + ' is told.',
      );
    }
    if (dlg === 'warn') {
      if (!note) return setErr('Write the warning the author will see.');
      patch(it.id, (y) => ({ ...y, authorWarnings: (y.authorWarnings ?? 0) + 1, history: log(y, 'Warned the author: ' + note) }));
      flash('Warning sent to ' + it.author + '. The review stays pending.');
    }
    if (dlg === 'message') {
      if (!note) return setErr('Write the message first.');
      const to = recipients(it).find((r) => r.id === msgTo) ?? recipients(it)[0];
      const name = to.label.replace(/ \(.*\)$/, '');
      patch(it.id, (y) => ({ ...y, history: [...y.history, { at: new Date().toISOString(), who: ME, what: 'Message sent to ' + name, body: note, kind: 'msg' }] }));
      flash('Message sent to ' + name + ' in the Business Portal.');
    }
    if (dlg === 'warnClient') {
      if (!note) return setErr('Write the warning the client will see.');
      resolve(
        { ...it },
        'warned',
        'Warned the client: ' + note,
        it.client + ' gets a warning in the app and by email. ' + it.business + ' is told.',
      );
      patch(it.id, (y) => ({ ...y, authorWarnings: (y.authorWarnings ?? 0) + 1 }));
    }
    if (dlg === 'suspendClient') {
      if (!note) return setErr('Add a reason. The client sees it in the email and in the app.');
      resolve(it, 'suspended', 'Suspended the client: ' + note, it.client + ' suspended. They get an email with the reason. ' + it.business + ' is told.');
    }
    if (dlg === 'fix') {
      if (!note) return setErr('Tell the business what to fix.');
      patch(it.id, (y) => ({ ...y, status: 'fixing', history: [...y.history, { at: new Date().toISOString(), who: ME, what: 'Asked ' + y.business + ' to fix it', body: note, kind: 'msg' }] }));
      flash(it.business + ' gets an email with what to fix. It stays open until they fix it or you decide.');
    }
    closeDlg();
  };

  // Prototype controls for what happens later, outside the admin app.
  const fixed = (x: ModItem) => resolve(x, 'kept', 'Fixed by ' + x.business, x.business + ' fixed the ' + x.sub.toLowerCase() + '. ' + reporterName(x) + ' is told.');

  const isReview = it?.kind === 'review';
  const [dTitle, dDesc, dCta, dLabel, dPh] = (
    {
      remove: [
        'Remove this ' + (isReview ? 'review' : it?.sub.toLowerCase() ?? '') + '?',
        isReview
          ? 'The review disappears from the listing and from the rating. The author gets an email with the reason.'
          : 'It disappears from the client app. The business gets an email and can upload a replacement.',
        'Remove',
        'Note to the ' + (isReview ? 'author' : 'business') + ' (optional)',
        'Contains insults towards staff.',
      ],
      message: [
        'Send a message about this report',
        'It goes to the business in the Business Portal (Messages and the bell) and is saved in the report history.',
        'Send message',
        'Message',
        'Can you send the booking reference so we can check this?',
      ],
      warnClient: [
        'Warn ' + (it?.client ?? ''),
        'The client gets a warning in the app and by email. A third warning suspends their account for 30 days.',
        'Send warning',
        'Warning',
        'Please cancel bookings you can’t make. Repeated no-shows lead to a suspension.',
      ],
      suspendClient: [
        'Suspend ' + (it?.client ?? '') + '?',
        'They can’t book and their reviews are hidden until you unsuspend them in Clients. They get an email with the reason.',
        'Suspend',
        'Reason (required)',
        'Repeated no-shows after a warning.',
      ],
      fix: [
        'Ask ' + (it?.business ?? '') + ' to fix it',
        'The business gets an email with your message. The ' + (it?.sub.toLowerCase() ?? '') + ' stays as it is while you wait. You can still keep or remove it at any time.',
        'Send request',
        'What to fix',
        'Replace the cover photo with one taken at your outlet.',
      ],
      warn: [
        'Warn ' + (it?.author ?? ''),
        'The author gets a warning in the app. A third warning suspends their account for 30 days.',
        'Send warning',
        'Warning',
        'Keep reviews about your visit and avoid insults.',
      ],
    } as const
  )[dlg ?? 'remove'];

  return (
    <>
      <PageHeader
        title="Reports and moderation"
        subtitle={ready ? `${openCount('reviews') + openCount('listings') + openCount('clients')} open reports` : 'Loading'}
      />
      <Tabs
        tabs={[
          { id: 'reviews', label: 'Reported reviews', count: openCount('reviews') },
          { id: 'listings', label: 'Reported listings and photos', count: openCount('listings') },
          { id: 'clients', label: 'Reported clients', count: openCount('clients') },
        ]}
        value={tab}
        onChange={setTab}
      />

      {isError ? (
        <div role="alert" className="flex flex-col items-center gap-2.5 rounded-xl bg-white px-6 py-14 text-center shadow-card">
          <span className="text-base font-semibold">Couldn&apos;t load reports.</span>
          <span className="text-sm text-muted">The moderation service didn&apos;t respond. Nothing was changed.</span>
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
      ) : (
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex min-w-0 max-w-full flex-[1_1_280px] flex-col gap-0.5 rounded-xl bg-white p-2 shadow-card">
            {isLoading && [1, 2, 3, 4].map((k) => <div key={k} className="ca-pulse m-1 h-[72px] rounded-[14px] bg-surface-muted" />)}
            {ready && list.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-[var(--success-opacity-10)] text-success">
                  <Icon name="check" size={22} />
                </span>
                <span className="text-[15px] font-semibold">Nothing reported.</span>
                <span className="text-[13px] text-muted">New items land here as they come in.</span>
              </div>
            )}
            {list.map((x) => {
              const on = x.id === it?.id;
              const late = x.status === 'open' && hoursSince(x.at) > 24;
              const [label, tone] = STATUS[x.status];
              return (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSel((s) => ({ ...s, [tab]: x.id }))}
                  className={`flex cursor-pointer flex-col gap-1 rounded-[14px] border-none px-3.5 py-3 text-left hover:bg-page ${
                    on ? 'bg-tint-purple shadow-[inset_0_0_0_1px_var(--primary-purple-opacity-20)]' : 'bg-transparent'
                  }`}
                >
                  <span className="flex w-full items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{titleOf(x)}</span>
                    <span className={`whitespace-nowrap text-xs ${late ? 'font-semibold text-error' : 'text-muted'}`}>{ago(x.at)}</span>
                  </span>
                  <span className="w-full truncate text-[13px] text-muted">{x.text}</span>
                  <span className="flex flex-wrap gap-1.5">
                    <Badge tone={tone}>{label}</Badge>
                    {x.hidden && x.status !== 'removed' && <Badge tone="error">Hidden</Badge>}
                    <Badge tone="neutral">{x.reason}</Badge>
                  </span>
                </button>
              );
            })}
          </div>

          {it && (
            <section className="flex min-w-0 flex-[999_1_440px] flex-col gap-5 rounded-xl bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex flex-[1_1_260px] flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-[.08em] text-muted">
                    {isReview ? 'Review on ' + it.business : it.kind === 'client' ? 'Client report from ' + it.business : 'Reported ' + it.sub.toLowerCase() + (it.target ? ' of ' + it.target.kind.toLowerCase() + ' ' + it.target.name : '') + ' · ' + it.business}
                  </span>
                  <h2 className="m-0 font-display text-[22px] font-bold leading-[1.3]">{it.reason}</h2>
                </div>
                <Badge tone={STATUS[it.status][1]} dot>
                  {STATUS[it.status][0]}
                </Badge>
              </div>

              {it.hidden && isActive(it) && (
                <div className="flex items-center gap-2.5 rounded-[14px] bg-[var(--error-opacity-10)] px-4 py-3 text-sm text-error">
                  <Icon name="ban" size={18} />
                  Hidden while you review it, because the reason is serious. Keep puts it back live.
                </div>
              )}
              {it.status === 'fixing' && (
                <div className="flex items-center gap-2.5 rounded-[14px] bg-[var(--activities-blue-opacity-10)] px-4 py-3 text-sm text-[var(--activities-blue-variable-700)]">
                  <Icon name="info" size={18} />
                  Waiting on {it.business} to fix it. You can still keep or remove it.
                </div>
              )}
              <div className="flex flex-col gap-2.5 rounded-lg bg-surface-muted p-[18px]">
                {isReview && (
                  <div className="flex flex-wrap items-center gap-2.5 text-sm">
                    <span className="font-semibold">{it.author}</span>
                    <span className="tracking-[1px] text-[var(--warning-500)]">{'★'.repeat(it.rating ?? 0) + '☆'.repeat(5 - (it.rating ?? 0))}</span>
                    <span className="text-xs text-muted">
                      Posted {it.posted ? fmtDate(it.posted) : ''} ·{' '}
                      {it.authorWarnings ? it.authorWarnings + (it.authorWarnings === 1 ? ' earlier warning' : ' earlier warnings') : 'No earlier warnings'}
                    </span>
                  </div>
                )}
                {it.kind === 'client' && (
                  <div className="flex flex-wrap items-center gap-2.5 text-sm">
                    <Link href={'/clients?id=' + it.cid} className="font-semibold">
                      {it.client}
                    </Link>
                    <span className="text-xs text-muted">
                      {it.booking ? it.booking + ' · ' : ''}
                      {it.authorWarnings ? it.authorWarnings + (it.authorWarnings === 1 ? ' earlier warning' : ' earlier warnings') : 'No earlier warnings'}
                    </span>
                  </div>
                )}
                {it.sub === 'Photo' && <div className="grid h-[180px] place-items-center rounded-[14px] bg-white text-[13px] text-muted">Reported photo</div>}
                <span className="text-[15px] leading-[1.55] text-ink">{it.text}</span>
              </div>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
                {(
                  [
                      ...(it.target ? [['Listing', it.target.kind + ': ' + it.target.name]] : []),
                      ['Reported by', isReview || it.kind === 'client' ? it.business + ' (business)' : it.reporter ?? ''],
                      ['Reason', it.reason ?? ''],
                      ['Reported', fmtDateTime(it.at) + ' · ' + ago(it.at) + ' ago'],
                    ]
                ).map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-1 rounded-[14px] px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--color-border-subtle)]">
                    <span className="text-xs text-muted">{k}</span>
                    <span className="text-sm font-medium">{v}</span>
                  </div>
                ))}
              </div>
              {it.note && (
                <div className="text-sm leading-normal">
                  <span className="text-muted">Note from {it.business}: </span>“{it.note}”
                </div>
              )}

              {isActive(it) && it.kind === 'client' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resolve(it, 'dismissed', 'Dismissed', 'Report dismissed.')}
                  >
                    Dismiss
                  </Button>
                  <button
                    type="button"
                    onClick={() => openDlg('warnClient')}
                    className="h-[38px] cursor-pointer rounded-pill border-none bg-tint-peach px-4 font-button text-[13px] font-bold text-brand-peach shadow-[inset_0_0_0_1.5px_var(--color-brand-peach)] hover:bg-brand-peach hover:text-white"
                  >
                    Warn the client
                  </button>
                  <Button variant="danger" size="sm" onClick={() => openDlg('suspendClient')}>
                    Suspend the client
                  </Button>
                </div>
              )}
              {isActive(it) && it.kind !== 'client' && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      resolve(
                        it,
                        'kept',
                        'Kept',
                        isReview
                          ? 'Review kept. ' + it.business + ' is told it stays.'
                          : 'Kept. ' + reporterName(it) + ' and ' + it.business + ' are told it stays.',
                      )
                    }
                  >
                    Keep
                  </Button>
                  {isReview && (
                    <button
                      type="button"
                      onClick={() => openDlg('warn')}
                      className="h-[38px] cursor-pointer rounded-pill border-none bg-tint-peach px-4 font-button text-[13px] font-bold text-brand-peach shadow-[inset_0_0_0_1.5px_var(--color-brand-peach)] hover:bg-brand-peach hover:text-white"
                    >
                      Warn the author
                    </button>
                  )}
                  {!isReview && it.status === 'open' && (
                    <Button size="sm" onClick={() => openDlg('fix')}>
                      Ask the business to fix it
                    </Button>
                  )}
                  <Button variant="danger" size="sm" onClick={() => openDlg('remove')}>
                    Remove
                  </Button>
                </div>
              )}
              {it.status === 'fixing' && (
                <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-dashed border-[var(--color-border-subtle)] px-3.5 py-2.5 text-[13px] text-muted">
                  Prototype:
                  <Button variant="text" onClick={() => fixed(it)}>
                    Business fixed it
                  </Button>
                </div>
              )}

              <span className="self-start">
                <Button variant="text" onClick={() => openDlg('message')}>
                  Send a message
                </Button>
              </span>

              <div className="flex flex-col gap-2.5 pt-1">
                <h3 className="m-0 font-display text-base font-semibold">History</h3>
                <Timeline
                  items={it.history
                    .slice()
                    .reverse()
                    .map((h, k) => ({ key: h.at + k, what: h.what, meta: h.who + ' · ' + fmtDateTime(h.at), dot: dotOf(h), body: h.body, bodyBg: 'var(--color-surface-muted)' }))}
                />
              </div>
            </section>
          )}
        </div>
      )}

      {dlg && it && (
        <Dialog
          title={dTitle}
          description={dDesc}
          onClose={closeDlg}
          footer={
            <>
              <Button variant="text" onClick={closeDlg} className="px-3">
                Cancel
              </Button>
              <Button variant={dlg === 'fix' || dlg === 'message' ? 'primary' : 'danger'} size="sm" onClick={confirm}>
                {dCta}
              </Button>
            </>
          }
        >
          {dlg === 'message' && (
            <label className="flex flex-col gap-2 text-sm">
              To
              <select value={msgTo} onChange={(e) => setMsgTo(e.target.value)} className={`${FIELD} h-12 text-[15px]`}>
                {recipients(it).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-2 text-sm">
            {dLabel}
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErr('');
              }}
              rows={3}
              placeholder={dPh}
              className={`${FIELD} resize-y py-3 leading-normal`}
            />
          </label>
          {err && <span className="text-[13px] text-error">{err}</span>}
        </Dialog>
      )}
    </>
  );
}
