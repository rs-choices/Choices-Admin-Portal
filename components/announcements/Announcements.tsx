'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { NoAccess } from '@/components/shell/NoAccess';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, FIELD } from '@/components/ui/Dialog';
import { fmtDateTime, fmtNum } from '@/lib/format';
import { ANNOUNCEMENTS, NOW } from '@/lib/mock';
import type { Announcement, Tone } from '@/lib/types';
import { ME } from '@/lib/verification';

type Channel = Announcement['channel'];

// Audiences per channel, with how many people each reaches. From the design.
const AUD: Record<Channel, [string, string, number][]> = {
  Push: [
    ['clients-all', 'All clients', 48210],
    ['clients-dxb', 'Clients · Dubai', 27140],
    ['clients-auh', 'Clients · Abu Dhabi', 13880],
    ['clients-shj', 'Clients · Sharjah', 7190],
    ['clients-new', 'Clients who joined in the last 30 days', 5210],
  ],
  Email: [
    ['biz-all', 'All businesses', 455],
    ['biz-trial', 'Businesses on trial', 62],
    ['biz-paid', 'Paying businesses', 393],
    ['biz-fb', 'F&B businesses', 288],
  ],
  Banner: [
    ['biz-all', 'All businesses', 455],
    ['biz-trial', 'Businesses on trial', 62],
    ['biz-paid', 'Paying businesses', 393],
  ],
};
const CHANNELS: [Channel, string, string][] = [
  ['Push', 'Push notification', 'Clients · mobile app'],
  ['Email', 'Email', 'Businesses · inbox'],
  ['Banner', 'Banner', 'Businesses · Business Portal'],
];
const STATUS_TONE: Record<Announcement['status'], Tone> = { Sent: 'success', Scheduled: 'info', Draft: 'neutral', Cancelled: 'error' };
const LABEL = 'flex flex-col gap-2 text-[13px] font-semibold';

// datetime-local values have no timezone; the prototype treats them as Dubai time.
const atIso = (v: string) => new Date(v + ':00+04:00').toISOString();
const fmtAt = (v: string) => fmtDateTime(atIso(v));

export function Announcements() {
  const { role, flash } = useAdmin();
  const [list, setList] = useState<Announcement[]>(() => ANNOUNCEMENTS.map((x) => ({ ...x })));
  const [ch, setCh] = useState<Channel>('Push');
  const [aud, setAud] = useState('clients-all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [when, setWhen] = useState<'now' | 'later'>('now');
  const [at, setAt] = useState('2026-10-20T10:00');
  const [err, setErr] = useState('');
  const [dlg, setDlg] = useState(false);
  const nextId = useRef(1);

  if (role === 'moderator') {
    return <NoAccess title="Moderators can't send announcements." body="Switch role in the top bar to see this section." />;
  }

  const opts = AUD[ch];
  const cur = opts.find((o) => o[0] === aud) ?? opts[0];
  const max = ch === 'Push' ? 50 : 90;
  const unit = ch === 'Push' ? 'clients' : 'businesses';

  const valid = () => {
    if (!title.trim()) return 'Add a title.';
    if (!body.trim()) return 'Add a message.';
    if (when === 'later' && new Date(atIso(at)) <= new Date(NOW)) return 'Pick a time in the future.';
    return '';
  };
  const add = (status: Announcement['status']) => {
    const item: Announcement = {
      id: 'new' + nextId.current++,
      channel: ch,
      audience: cur[1],
      title: title.trim() || 'Untitled',
      body,
      status,
      when: status === 'Draft' ? null : status === 'Scheduled' ? atIso(at) : new Date().toISOString(),
      reach: cur[2],
      by: ME,
    };
    setList((xs) => [item, ...xs]);
    setTitle('');
    setBody('');
    setErr('');
    setDlg(false);
  };
  const pvTitle = title || 'Your title';
  const pvBody = body || 'Your message shows here.';

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="m-0 font-display text-[28px] font-bold leading-[1.2] text-brand-purple">Announcements</h1>
        <span className="rounded-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[.06em] text-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]">Later</span>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <section className="flex min-w-0 flex-[999_1_420px] flex-col gap-4 rounded-xl bg-white p-6 shadow-card">
          <h2 className="m-0 font-display text-lg font-semibold">New announcement</h2>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">Channel</span>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
              {CHANNELS.map(([v, l, to]) => {
                const on = ch === v;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setCh(v);
                      setAud(AUD[v][0][0]);
                    }}
                    className={`flex cursor-pointer flex-col gap-1 rounded-[14px] border-none px-3.5 py-3 text-left ${
                      on ? 'bg-tint-purple shadow-[inset_0_0_0_1px_var(--color-brand-purple)]' : 'bg-surface-muted'
                    }`}
                  >
                    <span className="text-sm font-semibold text-ink">{l}</span>
                    <span className="text-xs text-muted">{to}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <label className={LABEL}>
            Audience
            <select value={cur[0]} onChange={(e) => setAud(e.target.value)} className={`${FIELD} h-[46px] font-normal`}>
              {opts.map((o) => (
                <option key={o[0]} value={o[0]}>
                  {o[1]}
                </option>
              ))}
            </select>
            <span className="font-normal text-muted">
              About {fmtNum(cur[2])} {ch === 'Push' ? 'clients with notifications on' : 'businesses'}
            </span>
          </label>
          <label className={LABEL}>
            {ch === 'Push' ? 'Title' : ch === 'Email' ? 'Subject' : 'Headline'}
            <input
              value={title}
              maxLength={max}
              onChange={(e) => {
                setTitle(e.target.value);
                setErr('');
              }}
              placeholder="Diwali dinners near you"
              className={`${FIELD} h-[46px] px-3.5 text-[15px] font-normal`}
            />
            <span className="font-normal text-muted">
              {title.length} / {max}
            </span>
          </label>
          <label className={LABEL}>
            Message
            <textarea
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setErr('');
              }}
              rows={4}
              placeholder="12 spots have Diwali menus this weekend."
              className={`${FIELD} resize-y px-3.5 py-3 font-normal leading-normal`}
            />
          </label>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">When</span>
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  ['now', 'Send now'],
                  ['later', 'Schedule'],
                ] as const
              ).map(([v, l]) => (
                <button key={v} type="button" className="ds-chip ds-chip-sm" aria-pressed={when === v} onClick={() => setWhen(v)}>
                  {l}
                </button>
              ))}
              {when === 'later' && (
                <input
                  type="datetime-local"
                  value={at}
                  aria-label="Send at"
                  onChange={(e) => {
                    setAt(e.target.value);
                    setErr('');
                  }}
                  className={`${FIELD} h-[38px] px-2.5`}
                />
              )}
            </div>
          </div>
          {err && <span className="text-[13px] text-error">{err}</span>}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="text"
              className="px-2"
              onClick={() => {
                if (!title.trim()) return setErr('Add a title to save a draft.');
                add('Draft');
                flash('Draft saved.');
              }}
            >
              Save draft
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const e = valid();
                if (e) return setErr(e);
                setDlg(true);
              }}
            >
              {when === 'later' ? 'Schedule' : 'Send now'}
            </Button>
          </div>
        </section>

        <section className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5 rounded-xl bg-white p-6 shadow-card">
          <h2 className="m-0 font-display text-lg font-semibold">Preview</h2>
          {ch === 'Push' && (
            <div className="flex flex-col gap-2.5 rounded-[28px] bg-[var(--primary-dark-green-500)] px-3.5 pb-10 pt-7">
              <span className="text-center font-body text-[40px] font-light text-white">9:41</span>
              <div className="flex gap-2.5 rounded-[18px] bg-white/[.86] px-3.5 py-3">
                <Image src="/brand/choices-mark.svg" alt="" width={34} height={34} className="size-[34px] shrink-0 rounded-sm bg-white object-contain p-1" />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13px] font-bold">{pvTitle}</span>
                  <span className="text-[13px] leading-[1.35] text-[var(--pure-black-variable-400)]">{pvBody}</span>
                </span>
              </div>
            </div>
          )}
          {ch === 'Email' && (
            <div className="overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_var(--color-border-subtle)]">
              <div className="bg-surface-muted px-3.5 py-2.5 text-xs text-muted">From Choices for Business · To {cur[1].toLowerCase()}</div>
              <div className="flex flex-col gap-2.5 p-5">
                <Image src="/brand/choices-logo.svg" alt="Choices" width={70} height={28} className="h-7 w-auto self-start" style={{ width: 'auto' }} />
                <span className="font-display text-lg font-bold">{pvTitle}</span>
                <span className="text-sm leading-normal text-[var(--pure-black-variable-400)]">{pvBody}</span>
              </div>
            </div>
          )}
          {ch === 'Banner' && (
            <div className="overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_var(--color-border-subtle)]">
              <div className="flex flex-wrap items-center gap-2.5 bg-tint-purple px-3.5 py-3">
                <span className="text-sm font-semibold text-brand-purple">{pvTitle}</span>
                <span className="text-[13px] text-[var(--pure-black-variable-400)]">{pvBody}</span>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <div className="h-2.5 w-3/5 rounded-[6px] bg-surface-muted" />
                <div className="h-2.5 w-[85%] rounded-[6px] bg-surface-muted" />
                <div className="h-[60px] rounded-[12px] bg-surface-muted" />
              </div>
              <div className="px-3.5 pb-2.5 text-[11px] text-muted">Business Portal dashboard</div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl bg-white px-5 pb-3 pt-2 shadow-card">
        <h2 className="mb-1 mt-3 font-display text-lg font-semibold">Past and scheduled</h2>
        {list.map((p) => (
          <div key={p.id} className="flex min-h-[60px] flex-wrap items-center gap-3 border-t border-subtle py-2 text-sm">
            <Badge tone="brand">{p.channel}</Badge>
            <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
              <span className="font-semibold">{p.title}</span>
              <span className="text-xs text-muted">
                {p.audience} · {p.by}
              </span>
            </span>
            <span className="whitespace-nowrap text-[13px] text-[var(--pure-black-variable-300)]">{p.when ? fmtDateTime(p.when) : 'Not scheduled'}</span>
            <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
            {p.status === 'Scheduled' && (
              <Button
                variant="text"
                onClick={() => {
                  setList((xs) => xs.map((x) => (x.id === p.id ? { ...x, status: 'Cancelled' } : x)));
                  flash('“' + p.title + '” cancelled.');
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        ))}
      </section>

      {dlg && (
        <Dialog
          title={(when === 'later' ? 'Schedule' : 'Send') + ' to ' + fmtNum(cur[2]) + ' ' + unit + '?'}
          description={ch + ' to ' + cur[1] + (when === 'later' ? ' on ' + fmtAt(at) + '. You can cancel until then.' : ' goes out straight away. It can’t be recalled.')}
          width={440}
          onClose={() => setDlg(false)}
          footer={
            <>
              <Button variant="text" onClick={() => setDlg(false)} className="px-3">
                Back
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const sch = when === 'later';
                  add(sch ? 'Scheduled' : 'Sent');
                  flash(sch ? 'Scheduled for ' + fmtAt(at) + '.' : 'Sent to ' + fmtNum(cur[2]) + ' ' + unit + '.');
                }}
              >
                {when === 'later' ? 'Schedule' : 'Send now'}
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
