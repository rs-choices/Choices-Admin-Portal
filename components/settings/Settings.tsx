'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAdmin } from '@/components/shell/AdminProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, FIELD } from '@/components/ui/Dialog';
import { Toggle } from '@/components/ui/Toggle';
import { fmtDate } from '@/lib/format';
import { ADMINS, INVITES, LEGAL, SESSIONS } from '@/lib/mock';
import { ROLE_LABEL, ROLES, type Admin, type Invite, type LegalDoc, type Role } from '@/lib/types';
import { ME } from '@/lib/verification';

export type SettingsTab = 'profile' | 'security' | 'team' | 'roles' | 'legal';

type Dlg =
  | { type: 'invite' }
  | { type: 'role'; id: string; name: string; role: Role }
  | { type: 'remove'; id: string; name: string }
  | { type: 'revoke'; email: string }
  | { type: 'everywhere' }
  | { type: 'legal'; id: LegalDoc['id']; name: string }
  | null;

const TODAY = '2026-10-16';
const INVITE_EXPIRES = '2026-10-23';
const TABS: { id: SettingsTab; label: string; superOnly: boolean }[] = [
  { id: 'profile', label: 'My profile', superOnly: false },
  { id: 'security', label: 'Security', superOnly: false },
  { id: 'team', label: 'Team', superOnly: true },
  { id: 'roles', label: 'Roles and permissions', superOnly: true },
  { id: 'legal', label: 'Legal', superOnly: true },
];
const NOTIFS: { k: 'verification' | 'report' | 'ticket' | 'payment'; label: string }[] = [
  { k: 'verification', label: 'New verification' },
  { k: 'report', label: 'New report' },
  { k: 'ticket', label: 'New ticket' },
  { k: 'payment', label: 'Failed payment' },
];
// Read-only matrix from the design. Kept in step with lib/permissions.ts.
const MATRIX: [string, string, string, string][] = [
  ['Dashboard', 'Full', 'Full', 'Reduced'],
  ['Verification queue', 'Full', 'Full', '—'],
  ['Businesses', 'Full', 'Full', '—'],
  ['Clients', 'Full', 'Full', '—'],
  ['Reports and moderation', 'Full', 'Full', 'Full'],
  ['Support', 'Full', 'Full', 'Full'],
  ['Content', 'Full', 'Full', '—'],
  ['Billing and revenue', 'Full', 'View only', '—'],
  ['Refunds', 'Full', '—', '—'],
  ['Announcements', 'Full', 'Full', '—'],
  ['Settings: profile and security', 'Full', 'Full', 'Full'],
  ['Settings: team, roles, legal', 'Full', '—', '—'],
  ['Audit log', 'Full', '—', '—'],
];
const PHOTO = ['var(--color-brand-purple)', 'var(--color-brand-teal)', 'var(--color-brand-peach)'];
const CARD = 'flex flex-col rounded-xl bg-white p-6 shadow-card';
const H2 = 'm-0 font-display text-lg font-semibold';
const INPUT = `${FIELD} h-[46px] px-3.5 text-[15px] font-normal`;
const DANGER_OUTLINE =
  'h-[38px] cursor-pointer rounded-pill border-none bg-transparent px-4 font-button text-sm font-bold text-error shadow-[inset_0_0_0_1px_var(--error-500)] hover:bg-[var(--error-opacity-10)]';
const LINK_DANGER = 'cursor-pointer border-none bg-transparent px-2 font-button text-[13px] font-bold text-error';

const initials = (n: string) =>
  n
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

export function Settings({ tab }: { tab: SettingsTab }) {
  const router = useRouter();
  const { role, flash } = useAdmin();
  const isSuper = role === 'super';

  const [name, setName] = useState('John Doe');
  const [photo, setPhoto] = useState(0);
  const [notif, setNotif] = useState({ verification: true, report: true, ticket: false, payment: true });
  const [sessions, setSessions] = useState(() => SESSIONS.map((s) => ({ ...s })));
  const [team, setTeam] = useState<Admin[]>(() => ADMINS.map((a) => ({ ...a })));
  const [invites, setInvites] = useState<Invite[]>(() => INVITES.map((i) => ({ ...i })));
  const [legal, setLegal] = useState<LegalDoc[]>(() => LEGAL.map((l) => ({ ...l, history: [...l.history] })));

  const [dlg, setDlg] = useState<Dlg>(null);
  const [invEmail, setInvEmail] = useState('');
  const [invRole, setInvRole] = useState<Role>('moderator');
  const [legalVer, setLegalVer] = useState('');
  const [err, setErr] = useState('');

  const superTab = TABS.find((t) => t.id === tab)?.superOnly ?? false;
  const locked = superTab && !isSuper;
  const pick = (t: SettingsTab) => router.replace(t === 'profile' ? '/settings' : '/settings?tab=' + t, { scroll: false });
  const closeDlg = () => {
    setDlg(null);
    setErr('');
  };

  const confirm = () => {
    if (!dlg) return;
    if (dlg.type === 'invite') {
      const e = invEmail.trim().toLowerCase();
      if (!e.endsWith('@thechoicesapp.com')) return setErr('Only Choices team accounts can be invited.');
      if (team.some((m) => m.email === e) || invites.some((i) => i.email === e)) return setErr(e + ' already has access or an invite.');
      setInvites((xs) => [{ email: e, role: invRole, sent: TODAY, by: ME, expires: INVITE_EXPIRES }, ...xs]);
      flash('Invite sent to ' + e + '.');
    }
    if (dlg.type === 'role') {
      setTeam((xs) => xs.map((m) => (m.id === dlg.id ? { ...m, role: dlg.role } : m)));
      flash(dlg.name + ' is now ' + ROLE_LABEL[dlg.role] + '.');
    }
    if (dlg.type === 'remove') {
      setTeam((xs) => xs.filter((m) => m.id !== dlg.id));
      flash(dlg.name + ' removed. Their sessions are signed out.');
    }
    if (dlg.type === 'revoke') {
      setInvites((xs) => xs.filter((i) => i.email !== dlg.email));
      flash('Invite to ' + dlg.email + ' revoked.');
    }
    if (dlg.type === 'everywhere') {
      const n = sessions.filter((s) => !s.current).length;
      setSessions((xs) => xs.filter((s) => s.current));
      flash('Signed out of ' + n + (n === 1 ? ' other session.' : ' other sessions.'));
    }
    if (dlg.type === 'legal') {
      const v = legalVer.trim();
      if (!v) return setErr('Enter a version number.');
      setLegal((xs) => xs.map((l) => (l.id === dlg.id ? { ...l, version: v, published: TODAY, accepted: 0, history: [{ v, date: TODAY, by: ME }, ...l.history] } : l)));
      flash(dlg.name + ' ' + v + ' published. Clients are asked to accept it next time they open the app.');
    }
    closeDlg();
  };

  const dlgText = (): [string, string, string, boolean] => {
    if (!dlg) return ['', '', '', false];
    switch (dlg.type) {
      case 'invite':
        return ['Invite to Choices Admin', 'They get an email link that expires in 7 days.', 'Send invite', false];
      case 'role':
        return ['Make ' + dlg.name + ' ' + ROLE_LABEL[dlg.role] + '?', 'Their access changes the next time they load a page.', 'Change role', false];
      case 'remove':
        return ['Remove ' + dlg.name + '?', 'They lose access straight away and are signed out everywhere. Their past actions stay in the audit log.', 'Remove', true];
      case 'revoke':
        return ['Revoke invite to ' + dlg.email + '?', 'The link in their email stops working.', 'Revoke', true];
      case 'everywhere':
        return ['Sign out everywhere?', 'Every session except this one is signed out, including your phone.', 'Sign out everywhere', true];
      case 'legal':
        return [
          'Publish a new ' + dlg.name.toLowerCase() + '?',
          'Every client must accept it again before they can book. The current version stays readable in the history.',
          'Publish',
          true,
        ];
    }
  };
  const [dTitle, dDesc, dCta, danger] = dlgText();

  return (
    <>
      <h1 className="m-0 font-display text-[28px] font-bold leading-[1.2] text-brand-purple">Settings</h1>
      <div className="flex flex-wrap items-start gap-5">
        <nav aria-label="Settings sections" className="flex min-w-[180px] flex-[0_1_220px] flex-col gap-0.5 rounded-xl bg-white p-2 shadow-card">
          {TABS.filter((t) => isSuper || !t.superOnly).map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                aria-current={on ? 'page' : undefined}
                onClick={() => pick(t.id)}
                className={`flex h-[42px] cursor-pointer items-center justify-between gap-2 rounded-[14px] border-none px-3 text-left text-sm ${
                  on ? 'bg-tint-purple font-semibold text-brand-purple' : 'bg-transparent font-medium text-ink'
                }`}
              >
                {t.label}
                {t.superOnly && <span className="text-[10px] font-semibold text-muted">Super admin</span>}
              </button>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-4">
          {locked && (
            <div className="flex flex-col gap-2 rounded-xl bg-white px-6 py-14 text-center shadow-card">
              <span className="text-[17px] font-semibold">Super admin only.</span>
              <span className="text-sm text-muted">Ask Ahmad Karimi or John Doe for changes here.</span>
            </div>
          )}

          {tab === 'profile' && (
            <section className={`${CARD} gap-[18px]`}>
              <h2 className={H2}>My profile</h2>
              <div className="flex flex-wrap items-center gap-4">
                <span className="grid size-[72px] place-items-center rounded-full font-button text-[22px] font-bold text-white" style={{ background: PHOTO[photo % 3] }}>
                  JD
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPhoto((p) => p + 1);
                    flash('Photo updated.');
                  }}
                >
                  Change photo
                </Button>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
                <label className="flex flex-col gap-2 text-[13px] font-semibold">
                  Name
                  <input value={name} onChange={(e) => setName(e.target.value)} className={INPUT} />
                </label>
                <label className="flex flex-col gap-2 text-[13px] font-semibold">
                  Email
                  <input value="johndoe@thechoicesapp.com" disabled className={`${INPUT} text-muted`} />
                  <span className="font-normal text-muted">Managed by your Google Workspace account.</span>
                </label>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold">Email me when</span>
                {NOTIFS.map((n) => (
                  <div key={n.k} className="flex min-h-12 items-center justify-between gap-3 border-t border-subtle text-sm">
                    {n.label}
                    <Toggle label={n.label} on={notif[n.k]} onChange={(v) => setNotif((x) => ({ ...x, [n.k]: v }))} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={() => (name.trim() ? flash('Profile saved.') : flash('Name can’t be empty.', true))}>
                  Save changes
                </Button>
              </div>
            </section>
          )}

          {tab === 'security' && (
            <section className={`${CARD} gap-2`}>
              <div className="flex flex-wrap items-center gap-3 pb-2">
                <h2 className={`${H2} flex-1`}>Active sessions</h2>
                <button
                  type="button"
                  className={DANGER_OUTLINE}
                  onClick={() => (sessions.length < 2 ? flash('No other sessions.') : setDlg({ type: 'everywhere' }))}
                >
                  Sign out everywhere
                </button>
              </div>
              {sessions.map((s) => (
                <div key={s.id} className="flex min-h-[60px] flex-wrap items-center gap-3 border-t border-subtle text-sm">
                  <span className="flex flex-[1_1_220px] flex-col gap-0.5">
                    <span className="font-semibold">{s.device}</span>
                    <span className="text-xs text-muted">
                      {s.location} · {s.ip} · {s.last}
                    </span>
                  </span>
                  {s.current ? (
                    <Badge tone="success">This device</Badge>
                  ) : (
                    <Button
                      variant="text"
                      onClick={() => {
                        setSessions((xs) => xs.filter((x) => x.id !== s.id));
                        flash('Signed out of ' + s.device + '.');
                      }}
                    >
                      Sign out
                    </Button>
                  )}
                </div>
              ))}
            </section>
          )}

          {tab === 'team' && isSuper && (
            <section className={`${CARD} gap-2`}>
              <div className="flex items-center gap-3 pb-2">
                <h2 className={`${H2} flex-1`}>Team</h2>
                <Button
                  size="sm"
                  onClick={() => {
                    setDlg({ type: 'invite' });
                    setInvEmail('');
                    setInvRole('moderator');
                    setErr('');
                  }}
                >
                  Invite
                </Button>
              </div>
              {team.map((m) => {
                const self = m.name === ME;
                return (
                  <div key={m.id} className="flex min-h-[60px] flex-wrap items-center gap-3 border-t border-subtle text-sm">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tint-purple font-button text-xs font-bold text-brand-purple">{initials(m.name)}</span>
                    <span className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
                      <span className="font-semibold">
                        {m.name}
                        {self ? ' (you)' : ''}
                      </span>
                      <span className="truncate text-xs text-muted">{m.email}</span>
                    </span>
                    <select
                      aria-label={'Role for ' + m.name}
                      value={m.role}
                      disabled={self}
                      onChange={(e) => setDlg({ type: 'role', id: m.id, name: m.name, role: e.target.value as Role })}
                      className="h-9 rounded-[14px] border-none bg-surface-muted px-3 text-[13px] font-medium text-ink disabled:opacity-60"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                    {!self && (
                      <button type="button" className={LINK_DANGER} onClick={() => setDlg({ type: 'remove', id: m.id, name: m.name })}>
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
              <h3 className="mb-1 mt-4 font-display text-[15px] font-semibold">Pending invites</h3>
              {invites.length === 0 && <span className="py-2 text-sm text-muted">No pending invites.</span>}
              {invites.map((i) => (
                <div key={i.email} className="flex min-h-14 flex-wrap items-center gap-3 border-t border-subtle text-sm">
                  <span className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
                    <span className="truncate font-semibold">{i.email}</span>
                    <span className="text-xs text-muted">
                      {ROLE_LABEL[i.role]} · invited by {i.by} · {i.expired ? 'expired ' + fmtDate(i.expires) : 'expires ' + fmtDate(i.expires)}
                    </span>
                  </span>
                  <Button
                    variant="text"
                    onClick={() => {
                      setInvites((xs) => xs.map((x) => (x.email === i.email ? { ...x, expired: false, expires: INVITE_EXPIRES } : x)));
                      flash('Invite resent to ' + i.email + '. New link expires 23 Oct.');
                    }}
                  >
                    Resend invite
                  </Button>
                  <button type="button" className={LINK_DANGER} onClick={() => setDlg({ type: 'revoke', email: i.email })}>
                    Revoke
                  </button>
                </div>
              ))}
            </section>
          )}

          {tab === 'roles' && isSuper && (
            <section className={`${CARD} gap-3 overflow-x-auto`}>
              <div className="flex flex-col gap-1">
                <h2 className={H2}>Roles and permissions</h2>
                <span className="text-[13px] text-muted">Read only. Changes need an engineering release.</span>
              </div>
              <div className="grid min-w-[520px] grid-cols-[minmax(200px,1fr)_repeat(3,120px)] text-sm">
                <span className="py-2.5 text-xs font-semibold uppercase tracking-[.06em] text-muted">Section</span>
                {ROLES.map((r) => (
                  <span key={r} className="py-2.5 text-center text-xs font-semibold text-muted">
                    {ROLE_LABEL[r]}
                  </span>
                ))}
                {MATRIX.map(([section, ...cells]) => (
                  <div key={section} className="contents">
                    <span className="border-t border-subtle py-2.5">{section}</span>
                    {cells.map((v, k) => (
                      <span
                        key={k}
                        className="border-t border-subtle py-2.5 text-center text-[13px] font-semibold"
                        style={{ color: v === 'Full' ? 'var(--success-500)' : v === '—' ? 'var(--pure-black-variable-50)' : 'var(--warning-variable-700)' }}
                      >
                        {v === '—' ? 'No access' : v}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'legal' &&
            isSuper &&
            legal.map((l) => (
              <section key={l.id} className={`${CARD} gap-2.5`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex flex-[1_1_200px] flex-col gap-0.5">
                    <span className="font-display text-lg font-semibold">{l.name}</span>
                    <span className="text-[13px] text-muted">
                      Version {l.version} · published {fmtDate(l.published)} · {l.accepted}% of clients have accepted
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDlg({ type: 'legal', id: l.id, name: l.name });
                      setLegalVer((parseFloat(l.version) + 0.1).toFixed(1));
                      setErr('');
                    }}
                  >
                    Publish new version
                  </Button>
                </div>
                <div className="h-2 overflow-hidden rounded-pill bg-surface-muted">
                  <div className="h-full rounded-pill bg-brand-teal" style={{ width: l.accepted + '%' }} />
                </div>
                {l.history.map((h) => (
                  <div key={h.v} className="flex justify-between gap-3 border-t border-subtle py-2.5 text-sm">
                    <span className="font-medium">Version {h.v}</span>
                    <span className="text-muted">
                      {fmtDate(h.date)} · {h.by}
                    </span>
                  </div>
                ))}
              </section>
            ))}
        </div>
      </div>

      {dlg && (
        <Dialog
          title={dTitle}
          description={dDesc}
          width={460}
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
          {dlg.type === 'invite' && (
            <>
              <label className="flex flex-col gap-2 text-[13px] font-semibold">
                Email
                <input
                  value={invEmail}
                  onChange={(e) => {
                    setInvEmail(e.target.value);
                    setErr('');
                  }}
                  placeholder="name@thechoicesapp.com"
                  className={INPUT}
                />
              </label>
              <label className="flex flex-col gap-2 text-[13px] font-semibold">
                Role
                <select value={invRole} onChange={(e) => setInvRole(e.target.value as Role)} className={INPUT}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          {dlg.type === 'legal' && (
            <>
              <label className="flex flex-col gap-2 text-[13px] font-semibold">
                New version
                <input
                  value={legalVer}
                  onChange={(e) => {
                    setLegalVer(e.target.value);
                    setErr('');
                  }}
                  className={INPUT}
                />
              </label>
              <div className="flex flex-col gap-2 text-[13px] font-semibold">
                Document (PDF or Markdown)
                <span className="grid h-[72px] place-items-center rounded-[14px] font-normal text-muted outline-dashed outline-1 -outline-offset-1 outline-[var(--primary-purple-opacity-30)]">
                  {(dlg.id === 'terms' ? 'terms-of-use-' : 'privacy-policy-') + legalVer}.pdf · ready
                </span>
              </div>
            </>
          )}
          {err && <span className="text-[13px] text-error">{err}</span>}
        </Dialog>
      )}
    </>
  );
}
