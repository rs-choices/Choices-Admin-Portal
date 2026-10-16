'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, FIELD } from '@/components/ui/Dialog';
import { FilterSelect } from '@/components/ui/FilterSelect';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/Segmented';
import { getSupport } from '@/lib/data/support';
import { ago, fmtDateTime } from '@/lib/format';
import type { Admin, Priority, SavedReply, Ticket, TicketStatus, Tone } from '@/lib/types';
import { ME } from '@/lib/verification';

export type Demo = 'live' | 'loading' | 'empty' | 'error';
type StatusFilter = TicketStatus | 'all';

const STATUS_TONE: Record<TicketStatus, Tone> = { open: 'warning', waiting: 'info', resolved: 'success' };
const PRIORITY: Record<Priority, [string, Tone]> = { urgent: ['Urgent', 'error'], high: ['High', 'warning'], normal: ['Normal', 'neutral'], low: ['Low', 'neutral'] };
const RANK: Record<Priority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
const CATEGORIES: [string, string][] = [
  ['all', 'All categories'],
  ['Billing', 'Billing'],
  ['Verification', 'Verification'],
  ['Listing', 'Listing'],
  ['Technical', 'Technical'],
  ['Client help', 'Client help'],
];
const INLINE_SELECT = 'h-9 min-w-0 max-w-full rounded-[14px] border-none bg-surface-muted px-3 text-[13px] font-medium text-ink';

const statusLabel = (t: Ticket) =>
  t.status === 'open' ? 'Open' : t.status === 'resolved' ? 'Resolved' : t.fromKind === 'business' ? 'Waiting on business' : 'Waiting on client';

export function Support({ demo }: { demo: Demo }) {
  const initialId = useSearchParams().get('id');
  const { flash, bumpCount } = useAdmin();

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [list, setList] = useState<Ticket[]>([]);
  const [saved, setSaved] = useState<SavedReply[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [status, setStatus] = useState<StatusFilter>('open');
  const [cat, setCat] = useState('all');
  const [who, setWho] = useState('all');
  const [selId, setSelId] = useState<string | null>(null);
  const [mode, setMode] = useState<'reply' | 'note'>('reply');
  const [draft, setDraft] = useState('');
  const [dlg, setDlg] = useState(false);
  // Edit or delete one of my own internal notes, by its index in the thread.
  const [noteDlg, setNoteDlg] = useState<{ edit: number } | { del: number } | null>(null);
  const [noteText, setNoteText] = useState('');

  const fetchData = useCallback(() => {
    getSupport()
      .then((r) => {
        setList(r.tickets);
        setSaved(r.saved);
        setAdmins(r.admins);
        // A ticket opened from a link selects it, and shows all statuses if it isn't open.
        const hit = r.tickets.find((t) => t.id === initialId);
        setSelId(hit ? hit.id : r.tickets[0]?.id ?? null);
        setStatus(hit && hit.status !== 'open' ? 'all' : 'open');
        setLoaded(true);
      })
      .catch(() => setFailed(true));
  }, [initialId]);
  useEffect(fetchData, [fetchData]);

  const isError = demo === 'error' || failed;
  const isLoading = !isError && (demo === 'loading' || !loaded);
  const ready = !isError && !isLoading;
  const all = demo === 'empty' ? [] : list;

  const tickets = ready
    ? all
        .filter(
          (t) =>
            (status === 'all' || t.status === status) &&
            (cat === 'all' || t.category === cat) &&
            (who === 'all' || (who === 'me' ? t.assignee === ME : who === 'none' ? !t.assignee : t.assignee === who)),
        )
        .sort((a, b) => RANK[a.priority] - RANK[b.priority] || new Date(a.updated).getTime() - new Date(b.updated).getTime())
    : [];
  const t = ready ? all.find((x) => x.id === selId) ?? null : null;

  const patch = (id: string, fn: (x: Ticket) => Ticket) => setList((xs) => xs.map((x) => (x.id === id ? fn(x) : x)));
  const sys = (x: Ticket, text: string): Ticket['thread'] => [...x.thread, { who: ME, side: 'sys', at: new Date().toISOString(), text }];

  const pick = (id: string) => {
    setSelId(id);
    setDraft('');
    window.history.replaceState(null, '', '/support?id=' + id);
  };

  const note = mode === 'note';
  const send = () => {
    if (!t) return;
    const body = draft.trim();
    if (!body) return flash(note ? 'Write the note first.' : 'Write a reply first.');
    const now = new Date().toISOString();
    patch(t.id, (x) => ({ ...x, status: note ? x.status : 'waiting', updated: now, thread: [...x.thread, { who: ME, side: note ? 'note' : 'us', at: now, text: body }] }));
    setDraft('');
    flash(note ? 'Note added to ' + t.id + '.' : 'Reply sent to ' + t.contact + '. They get a notification in the app.');
  };

  const chips: { id: StatusFilter; label: string }[] = [
    { id: 'open', label: 'Open' },
    { id: 'waiting', label: 'Waiting on business' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'all', label: 'All' },
  ];

  return (
    <>
      <PageHeader
        title="Support"
        subtitle={
          ready
            ? `${all.filter((x) => x.status === 'open').length} open · ${all.filter((x) => x.status === 'open' && !x.assignee).length} unassigned · ${
                all.filter((x) => x.priority === 'urgent' && x.status !== 'resolved').length
              } urgent`
            : 'Loading'
        }
      />
      <div className="flex flex-wrap items-center gap-2.5">
        <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button key={c.id} type="button" className="ds-chip ds-chip-sm" aria-pressed={status === c.id} onClick={() => setStatus(c.id)}>
              {c.label} {all.filter((x) => c.id === 'all' || x.status === c.id).length}
            </button>
          ))}
        </div>
        <span className="h-6 w-px bg-[var(--color-border-subtle)]" />
        <FilterSelect label="Category" value={cat} options={CATEGORIES} onChange={setCat} />
        <FilterSelect
          label="Assignee"
          value={who}
          options={[['all', 'Anyone'], ['me', 'Assigned to me'], ['none', 'Unassigned'], ...admins.filter((a) => a.name !== ME).map((a): [string, string] => [a.name, a.name])]}
          onChange={setWho}
        />
      </div>

      {isError ? (
        <div role="alert" className="flex flex-col items-center gap-2.5 rounded-xl bg-white px-6 py-14 text-center shadow-card">
          <span className="text-base font-semibold">Couldn&apos;t load the inbox.</span>
          <span className="text-sm text-muted">The support service didn&apos;t respond. Drafts are kept on this device.</span>
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
            {isLoading && [1, 2, 3, 4, 5].map((k) => <div key={k} className="ca-pulse m-1 h-[76px] rounded-[14px] bg-surface-muted" />)}
            {ready && tickets.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-[var(--success-opacity-10)] text-success">
                  <Icon name="inbox" size={22} />
                </span>
                <span className="text-[15px] font-semibold">Inbox clear.</span>
                <span className="text-[13px] text-muted">No tickets match these filters.</span>
              </div>
            )}
            {tickets.map((x) => {
              const on = x.id === selId;
              const hot = x.priority === 'urgent' || x.priority === 'high';
              return (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(x.id)}
                  className={`flex cursor-pointer flex-col gap-1 rounded-[14px] border-none px-3.5 py-3 text-left hover:bg-page ${
                    on ? 'bg-tint-purple shadow-[inset_0_0_0_1px_var(--primary-purple-opacity-20)]' : 'bg-transparent'
                  }`}
                >
                  <span className="flex w-full items-center gap-2">
                    <span className="text-xs font-bold text-brand-purple">{x.id}</span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-muted">{x.from}</span>
                    <span className="whitespace-nowrap text-xs text-muted">{ago(x.updated)}</span>
                  </span>
                  <span className="w-full truncate text-sm font-semibold text-ink">{x.subject}</span>
                  <span className="flex flex-wrap gap-1.5">
                    <Badge tone={STATUS_TONE[x.status]}>{statusLabel(x)}</Badge>
                    <Badge tone="neutral">{x.category}</Badge>
                    {hot && <Badge tone={PRIORITY[x.priority][1]}>{PRIORITY[x.priority][0]}</Badge>}
                  </span>
                </button>
              );
            })}
          </div>

          {t && (
            <section className="flex min-w-0 flex-[999_1_440px] flex-col rounded-xl bg-white shadow-card">
              <div className="flex flex-col gap-3.5 border-b border-subtle px-6 py-5">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-[.08em] text-muted">
                      {t.id} · {t.fromKind === 'business' ? 'Business · ' + t.category : 'Client help'}
                    </span>
                    <h2 className="m-0 font-display text-[22px] font-bold leading-[1.3]">{t.subject}</h2>
                    <span className="text-[13px] text-muted">
                      {t.from} · {t.contact}
                    </span>
                  </div>
                  <Badge tone={STATUS_TONE[t.status]} dot>
                    {statusLabel(t)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="flex min-w-0 max-w-full items-center gap-2 text-[13px] text-muted">
                    Assignee
                    <select
                      value={t.assignee ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        patch(t.id, (x) => ({ ...x, assignee: v || null, thread: sys(x, v ? 'Assigned to ' + v : 'Unassigned') }));
                        flash(v ? t.id + ' assigned to ' + v + '.' : t.id + ' unassigned.');
                      }}
                      className={INLINE_SELECT}
                    >
                      <option value="">Unassigned</option>
                      {admins.map((a) => (
                        <option key={a.id} value={a.name}>
                          {a.name === ME ? ME + ' (me)' : a.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex min-w-0 max-w-full items-center gap-2 text-[13px] text-muted">
                    Priority
                    <select
                      value={t.priority}
                      onChange={(e) => {
                        const v = e.target.value as Priority;
                        patch(t.id, (x) => ({ ...x, priority: v, thread: sys(x, 'Priority set to ' + PRIORITY[v][0]) }));
                        flash('Priority set to ' + PRIORITY[v][0] + '.');
                      }}
                      className={INLINE_SELECT}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>
                  <span className="flex-1" />
                  {t.status === 'resolved' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        patch(t.id, (x) => ({ ...x, status: 'open', thread: sys(x, 'Reopened') }));
                        bumpCount('tickets', 1);
                        flash(t.id + ' reopened.');
                      }}
                    >
                      Reopen
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setDlg(true)}>
                      Resolve
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3.5 px-6 py-5">
                {t.thread.map((m, k) => {
                  const align = m.side === 'them' ? 'self-start' : m.side === 'sys' ? 'self-center' : 'self-end';
                  const bubble =
                    m.side === 'them'
                      ? 'bg-surface-muted text-ink'
                      : m.side === 'us'
                        ? 'bg-brand-purple text-white'
                        : m.side === 'note'
                          ? 'bg-[var(--warning-opacity-10)] text-ink'
                          : 'bg-transparent text-muted shadow-[inset_0_0_0_1px_var(--color-border-subtle)]';
                  return (
                    <div key={m.at + k} className={`flex max-w-[78%] flex-col gap-1 ${align}`}>
                      <span className={`flex flex-wrap items-center gap-x-3 text-xs text-muted ${align}`}>
                        {m.side === 'note' ? 'Internal note · ' + m.who : m.who} · {fmtDateTime(m.at)}
                        {m.side === 'note' && m.who === ME && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setNoteDlg({ edit: k });
                                setNoteText(m.text);
                              }}
                              className="cursor-pointer border-none bg-transparent p-0 font-button text-xs font-bold text-brand-peach"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoteDlg({ del: k })}
                              className="cursor-pointer border-none bg-transparent p-0 font-button text-xs font-bold text-error"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </span>
                      <div className={`whitespace-pre-wrap rounded-lg px-3.5 py-3 text-sm leading-normal ${bubble}`}>{m.text}</div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2.5 border-t border-subtle px-6 pb-6 pt-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Segmented
                    label="Reply mode"
                    size="sm"
                    options={[
                      { value: 'reply', label: 'Reply' },
                      { value: 'note', label: 'Internal note' },
                    ]}
                    value={mode}
                    onChange={setMode}
                  />
                  <span className="flex-1" />
                  <select
                    value=""
                    aria-label="Saved replies"
                    onChange={(e) => {
                      const r = saved.find((x) => x.id === e.target.value);
                      if (!r) return;
                      setDraft((d) => (d ? d + '\n\n' : '') + r.body);
                      setMode('reply');
                    }}
                    className="h-9 rounded-[14px] border-none bg-white px-3 text-[13px] font-medium text-ink shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]"
                  >
                    <option value="">Saved replies</option>
                    {saved.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={4}
                  aria-label={note ? 'Internal note' : 'Reply'}
                  placeholder={note ? 'Only the Choices team sees this.' : 'Write a reply to ' + t.contact}
                  className={`resize-y rounded-[14px] border-none p-3 text-sm leading-normal outline-none focus:shadow-[inset_0_0_0_1px_var(--color-brand-purple)] ${
                    note ? 'bg-[var(--warning-opacity-10)]' : 'bg-surface-muted'
                  }`}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted">
                    {note
                      ? 'Internal notes never reach the ' + (t.fromKind === 'client' ? 'client' : 'business') + '.'
                      : 'Sending sets the ticket to ' + (t.fromKind === 'client' ? 'Waiting on client' : 'Waiting on business') + '.'}
                  </span>
                  <Button variant={note ? 'outline' : 'primary'} size="sm" onClick={send}>
                    {note ? 'Add note' : 'Send reply'}
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {noteDlg && t && (
        <Dialog
          title={'edit' in noteDlg ? 'Edit internal note' : 'Delete this note?'}
          description={'edit' in noteDlg ? 'Only the Choices team sees internal notes.' : 'The note is removed from the ticket for everyone.'}
          width={480}
          onClose={() => setNoteDlg(null)}
          footer={
            <>
              <Button variant="text" onClick={() => setNoteDlg(null)} className="px-3">
                Cancel
              </Button>
              <Button
                variant={'edit' in noteDlg ? 'primary' : 'danger'}
                size="sm"
                onClick={() => {
                  if ('edit' in noteDlg) {
                    const text = noteText.trim();
                    if (!text) return flash('Write the note first.');
                    patch(t.id, (x) => ({ ...x, thread: x.thread.map((m, i) => (i === noteDlg.edit ? { ...m, text, at: new Date().toISOString() } : m)) }));
                    flash('Note updated.');
                  } else {
                    patch(t.id, (x) => ({ ...x, thread: x.thread.filter((_, i) => i !== noteDlg.del) }));
                    flash('Note deleted.');
                  }
                  setNoteDlg(null);
                }}
              >
                {'edit' in noteDlg ? 'Save note' : 'Delete note'}
              </Button>
            </>
          }
        >
          {'edit' in noteDlg && (
            <label className="flex flex-col gap-2 text-sm">
              Note
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} className={`${FIELD} resize-y py-3 leading-normal`} />
            </label>
          )}
        </Dialog>
      )}

      {dlg && t && (
        <Dialog
          title={'Resolve ' + t.id + '?'}
          description={t.from + ' gets a closing email with a link to rate the answer. Any new reply reopens the ticket.'}
          width={440}
          onClose={() => setDlg(false)}
          footer={
            <>
              <Button variant="text" onClick={() => setDlg(false)} className="px-3">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  patch(t.id, (x) => ({ ...x, status: 'resolved', thread: sys(x, 'Resolved') }));
                  bumpCount('tickets', -1);
                  setDlg(false);
                  flash(t.id + ' resolved.');
                }}
              >
                Resolve
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
