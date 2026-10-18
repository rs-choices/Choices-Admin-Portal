'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { NoAccess } from '@/components/shell/NoAccess';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui/Button';
import { ChipGroup } from '@/components/ui/ChipGroup';
import { Dialog, FIELD } from '@/components/ui/Dialog';
import { FilterField } from '@/components/ui/FilterField';
import { Tabs } from '@/components/ui/Tabs';
import { getVerificationQueue } from '@/lib/data/verification';
import { ago } from '@/lib/format';
import type { Duplicate, Verification } from '@/lib/types';
import { ME, REJECT_REASONS, STATUS_CHIPS, detailFields, isOpen, logEntry, matchesStatus, type StatusFilter } from '@/lib/verification';
import { Duplicates } from './Duplicates';
import { QueueTable } from './QueueTable';
import { VerificationDetail, type DetailAction, type NoteAction } from './VerificationDetail';

export type Demo = 'live' | 'loading' | 'empty' | 'error';
type Dlg = DetailAction | { dupReject: Duplicate } | NoteAction | null;

const byOldest = (a: Verification, b: Verification) => new Date(a.submitted).getTime() - new Date(b.submitted).getTime();

export function VerificationQueue({ demo }: { demo: Demo }) {
  const router = useRouter();
  const selId = useSearchParams().get('id');
  const { role, flash, bumpCount } = useAdmin();

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [items, setItems] = useState<Verification[]>([]);
  const [dupes, setDupes] = useState<Duplicate[]>([]);
  const [tab, setTab] = useState<'business' | 'dupes'>('business');
  const [status, setStatus] = useState<StatusFilter>('open');
  const [q, setQ] = useState('');

  const [dlg, setDlg] = useState<Dlg>(null);
  const [text, setText] = useState('');
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [picks, setPicks] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState('');

  const fetchData = useCallback(() => {
    getVerificationQueue()
      .then((r) => {
        setItems(r.items);
        setDupes(r.dupes);
        setLoaded(true);
      })
      .catch(() => setFailed(true));
  }, []);
  useEffect(fetchData, [fetchData]);

  const retry = () => {
    setLoaded(false);
    setFailed(false);
    fetchData();
  };

  if (role === 'moderator') {
    return <NoAccess title="Moderators can't open the verification queue." body="Ask a Super admin to change your role, or switch role in the top bar." />;
  }

  const isError = demo === 'error' || failed;
  const isLoading = !isError && (demo === 'loading' || !loaded);
  const ready = !isError && !isLoading;
  const list = demo === 'empty' ? [] : items;
  const dupeList = demo === 'empty' ? [] : dupes;
  const sel = ready && selId ? list.find((v) => v.id === selId) ?? null : null;

  const update = (id: string, fn: (v: Verification) => Verification) => setItems((xs) => xs.map((v) => (v.id === id ? fn(v) : v)));
  const openDlg = (d: Dlg) => {
    setDlg(d);
    setText('');
    setErr('');
    setPicks({});
  };
  const closeDlg = () => {
    setDlg(null);
    setErr('');
  };

  const confirm = () => {
    if (!dlg) return;
    if (typeof dlg === 'object' && ('edit' in dlg || 'del' in dlg)) {
      if (!sel) return;
      if ('edit' in dlg) {
        if (!text.trim()) return setErr('Write the note first.');
        update(sel.id, (x) => ({ ...x, history: x.history.map((h, i) => (i === dlg.edit ? { ...h, body: text, at: new Date().toISOString(), what: 'Internal note (edited)' } : h)) }));
        flash('Note updated.');
      } else {
        update(sel.id, (x) => ({ ...x, history: x.history.filter((_, i) => i !== dlg.del) }));
        flash('Note deleted.');
      }
      return closeDlg();
    }
    if (typeof dlg === 'object') {
      const p = dlg.dupReject;
      setDupes((xs) => xs.filter((x) => x.id !== p.id));
      flash(p.b.name + ' rejected. The owner gets an email saying ' + p.a.name + ' already exists.');
      return closeDlg();
    }
    if (!sel) return;
    if (dlg === 'approve') {
      update(sel.id, (x) => ({ ...x, status: 'approved', history: logEntry(x, 'Approved') }));
      bumpCount('queue', -1);
      flash(
        sel.kind === 'business'
          ? sel.name + ' approved. The business can now publish its listing.'
          : sel.kind === 'branch'
            ? sel.name + ' verified. Drafts on this branch can now be published.'
            : sel.name + ' approved. It shows in the app as its own place.',
      );
    }
    if (dlg === 'changes') {
      const keys = Object.keys(picks).filter((k) => picks[k]);
      if (!keys.length) return setErr('Tick at least one field or document.');
      if (!text.trim()) return setErr('Write a message so the business knows what to fix.');
      update(sel.id, (x) => ({ ...x, status: 'changes', flags: keys, history: logEntry(x, 'Requested changes: ' + keys.join(', '), text, 'msg') }));
      flash('Changes requested from ' + sel.name + '. They get an email and a portal notice.');
    }
    if (dlg === 'reject') {
      update(sel.id, (x) => ({ ...x, status: 'rejected', history: logEntry(x, 'Rejected: ' + reason, text.trim() || undefined, 'msg') }));
      bumpCount('queue', -1);
      flash(sel.kind === 'business' ? sel.name + ' rejected for good. Its account is blocked and the owner gets an email.' : sel.name + ' rejected. The business gets an email.');
    }
    if (dlg === 'note') {
      if (!text.trim()) return setErr('Write the note first.');
      update(sel.id, (x) => ({ ...x, history: logEntry(x, 'Internal note', text, 'note') }));
      flash('Note added. Only the Choices team can see it.');
    }
    closeDlg();
  };

  // --- Detail ---
  if (sel) {
    return (
      <>
        <VerificationDetail
          v={sel}
          onAction={(a) => openDlg(a)}
          onAssign={() => {
            update(sel.id, (x) => ({ ...x, assignee: ME, history: logEntry(x, 'Assigned to ' + ME) }));
            flash('Assigned to you.');
          }}
          canUnassign={role === 'super'}
          onUnassign={() => {
            const who = sel.assignee;
            update(sel.id, (x) => ({ ...x, assignee: null, history: logEntry(x, 'Unassigned ' + who) }));
            flash(who === ME ? 'You are no longer assigned.' : who + ' is no longer assigned.');
          }}
          onNote={(a) => {
            openDlg(a);
            if ('edit' in a) setText(sel.history[a.edit]?.body ?? '');
          }}
          onDownload={(name) => flash(name + ' downloaded.')}
        />
        {renderDialog()}
      </>
    );
  }

  // --- List ---
  const open = list.filter(isOpen).sort(byOldest);
  const ql = q.trim().toLowerCase();
  const rows = ready
    ? list
        .filter((v) => matchesStatus(v, status))
        .filter((v) => !ql || (v.name + v.licence).toLowerCase().includes(ql))
        .sort(byOldest)
    : [];

  return (
    <>
      <PageHeader title="Verification queue" subtitle={ready ? `${open.length} open · oldest waiting ${open.length ? ago(open[0].submitted) : '—'}` : 'Loading'} />
      <Tabs
        tabs={[
          { id: 'business', label: 'Businesses', count: list.filter(isOpen).length },
          { id: 'dupes', label: 'Possible duplicates', count: dupeList.length },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'business' ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <FilterField value={q} onChange={setQ} placeholder="Filter by name or licence" />
            <ChipGroup label="Status" chips={STATUS_CHIPS} value={status} onChange={setStatus} />
          </div>
          <QueueTable
            rows={rows}
            loading={isLoading}
            error={isError}
            emptyTitle={ql ? `Nothing matches “${q}”.` : 'Queue clear.'}
            emptyBody={ql ? 'Check the spelling or clear the filter.' : 'New submissions land here as businesses send them.'}
            onOpen={(id) => {
              router.push('/verification?id=' + id);
              window.scrollTo(0, 0);
            }}
            onRetry={retry}
          />
        </>
      ) : (
        ready && (
          <Duplicates
            dupes={dupeList}
            onDismiss={(p) => {
              setDupes((xs) => xs.filter((x) => x.id !== p.id));
              flash('Flag dismissed. ' + p.a.name + ' and ' + p.b.name + ' stay separate.');
            }}
            onReject={(p) => openDlg({ dupReject: p })}
          />
        )
      )}
      {renderDialog()}
    </>
  );

  // A plain render function (not a component), so inputs keep focus while typing.
  function renderDialog() {
    if (!dlg) return null;
    if (typeof dlg === 'object' && ('edit' in dlg || 'del' in dlg)) {
      const editing = 'edit' in dlg;
      return (
        <Dialog
          title={editing ? 'Edit internal note' : 'Delete this note?'}
          description={editing ? 'Only the Choices team sees internal notes.' : 'The note is removed from the history for everyone.'}
          onClose={closeDlg}
          footer={
            <>
              <Button variant="text" onClick={closeDlg} className="px-3">
                Cancel
              </Button>
              <Button variant={editing ? 'primary' : 'danger'} size="sm" onClick={confirm}>
                {editing ? 'Save note' : 'Delete note'}
              </Button>
            </>
          }
        >
          {editing && (
            <label className="flex flex-col gap-2 text-sm">
              Note
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setErr('');
                }}
                rows={4}
                className={`${FIELD} resize-y py-3 leading-normal`}
              />
            </label>
          )}
          {err && <span className="text-[13px] text-error">{err}</span>}
        </Dialog>
      );
    }
    const dupReject = typeof dlg === 'object' && 'dupReject' in dlg ? dlg.dupReject : null;
    const name = sel?.name ?? '';
    const [title, desc, cta, danger, width] = dupReject
      ? [
          `Reject ${dupReject.b.name}?`,
          `The owner gets an email saying a business under this name already exists (${dupReject.a.name}). Nothing is merged.`,
          'Reject',
          true,
          480,
        ]
      : {
          approve: [`Approve ${name}?`, 'The business is verified and can publish its listing. The owner gets an email.', 'Approve', false, 440],
          changes: ['Request changes', 'Tick what needs fixing. The business sees these items flagged in the Business Portal.', 'Send request', false, 560],
          reject: [
            `Reject ${name}?`,
            sel?.kind === 'business'
              ? 'This rejects the business for good. Its email, Google or Apple account is blocked, so the owner needs a new account and verification starts over. This can’t be undone.'
              : `This ${sel?.kind === 'branch' ? 'branch' : 'extra outlet'} can’t be published. ${sel?.parent ?? 'The business'} keeps its account and can apply again.`,
            'Reject',
            true,
            480,
          ],
          note: ['Add internal note', 'Only the Choices team sees internal notes.', 'Add note', false, 480],
        }[dlg as DetailAction] as [string, string, string, boolean, number];

    const pick = (label: string) => (
      <label
        key={label}
        className={`flex cursor-pointer items-center gap-2.5 rounded-[12px] px-2.5 py-2 text-sm ${picks[label] ? 'bg-tint-purple' : 'bg-surface-muted'}`}
      >
        <input
          type="checkbox"
          checked={!!picks[label]}
          onChange={() => {
            setPicks((p) => ({ ...p, [label]: !p[label] }));
            setErr('');
          }}
          className="size-[18px] accent-[var(--color-brand-purple)]"
        />
        {label}
      </label>
    );
    const textLabel = dlg === 'changes' ? 'Message to the business' : dlg === 'reject' ? 'Note to the business (optional)' : 'Note';
    const placeholder =
      dlg === 'changes'
        ? 'The trade licence copy has expired. Upload the renewed licence.'
        : dlg === 'reject'
          ? 'Explain the decision in one or two sentences.'
          : 'Called the owner, licence renewal is in progress.';

    return (
      <Dialog
        title={title}
        description={desc}
        width={width}
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
        {dlg === 'changes' && sel && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold">Fields</span>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">{detailFields(sel).map(([l]) => pick(l))}</div>
            <span className="mt-1.5 text-[13px] font-semibold">Documents</span>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">{sel.docs.map((d) => pick(d.name))}</div>
          </div>
        )}
        {dlg === 'reject' && (
          <label className="flex flex-col gap-2 text-sm">
            Reason
            <select value={reason} onChange={(e) => setReason(e.target.value)} className={`${FIELD} h-12 text-[15px]`}>
              {REJECT_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        )}
        {(dlg === 'changes' || dlg === 'reject' || dlg === 'note') && (
          <label className="flex flex-col gap-2 text-sm">
            {textLabel}
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setErr('');
              }}
              rows={4}
              placeholder={placeholder}
              className={`${FIELD} resize-y py-3 leading-normal`}
            />
          </label>
        )}
        {err && <span className="text-[13px] text-error">{err}</span>}
      </Dialog>
    );
  }
}
