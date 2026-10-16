'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { saveRole } from '@/components/shell/AdminProvider';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { LucideName } from '@/lib/types';
import { CodeBoxes } from './CodeBoxes';
import { StateJumps } from './StateJumps';
import { activeJump, presetFor, TEAM_EMAIL, type CodeErr, type Jump, type SignInState } from './states';

// Mock sign-in. Nothing leaves the browser: 123456 signs in, 000000 is an
// expired code. There is no lock after wrong codes (Ralph, 2026-10-16).

const TONES = {
  error: ['var(--error-opacity-10)', 'var(--error-500)'],
  warning: ['var(--warning-opacity-10)', 'var(--warning-variable-700)'],
  info: ['var(--activities-blue-opacity-10)', 'var(--activities-blue-variable-700)'],
} as const;

function codeMessage(err: CodeErr): [string, keyof typeof TONES, LucideName] | null {
  switch (err) {
    case 'short':
      return ['Enter all 6 digits.', 'info', 'info'];
    case 'wrong':
      return ['That code is not right. Check the latest email or send a new code.', 'error', 'circle-x'];
    case 'expired':
      return ['This code has expired. Send a new one.', 'warning', 'clock'];
    default:
      return null;
  }
}

function Alert({ tone, icon, children }: { tone: keyof typeof TONES; icon: LucideName; children: ReactNode }) {
  const [bg, fg] = TONES[tone];
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-[14px] px-3.5 py-3 text-sm leading-[1.45]" style={{ background: bg, color: fg }}>
      <span className="mt-px shrink-0">
        <Icon name={icon} size={18} />
      </span>
      <span>{children}</span>
    </div>
  );
}

function Heading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="m-0 font-display text-2xl font-bold leading-[1.25] text-brand-purple">{title}</h1>
      {children && <span className="text-sm leading-normal text-muted">{children}</span>}
    </div>
  );
}

const WHITE_BTN =
  'flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-pill border-none bg-white font-button text-sm font-bold text-ink shadow-[inset_0_0_0_1px_rgba(0,0,0,.14)] hover:bg-page';

export function SignIn({ initial }: { initial: Jump }) {
  const router = useRouter();
  const [s, setS] = useState<SignInState>(() => presetFor(initial));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const patch = (p: Partial<SignInState>) => setS((cur) => ({ ...cur, ...p }));
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  // Resend countdown, one tick a second while the code screen is open.
  const counting = s.view === 'code' && s.left > 0;
  useEffect(() => {
    if (!counting) return;
    const id = setInterval(() => setS((cur) => (cur.left > 0 ? { ...cur, left: cur.left - 1 } : cur)), 1000);
    return () => clearInterval(id);
  }, [counting]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const jump = (j: Jump) => {
    setS((cur) => presetFor(j, cur));
    router.replace(j === 'signin' ? '/sign-in' : '/sign-in?state=' + j, { scroll: false });
  };

  const succeed = (asModerator = false) => {
    patch({ view: 'success', email: TEAM_EMAIL });
    if (asModerator) saveRole('moderator');
    later(() => router.push('/dashboard'), 900);
  };

  const send = () => {
    const e = s.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return patch({ emailErr: 'Enter a valid email address.' });
    if (!e.endsWith('@thechoicesapp.com')) return patch({ domain: e, emailErr: '' });
    patch({ sending: true });
    later(() => patch({ sending: false, view: 'code', email: e, code: '', codeErr: null, left: 60, domain: '' }), 700);
  };

  const verify = () => {
    if (s.code.length < 6) return patch({ codeErr: 'short' });
    if (s.code === '123456') return succeed();
    if (s.code === '000000') return patch({ codeErr: 'expired' });
    patch({ codeErr: 'wrong' });
  };

  const msg = codeMessage(s.codeErr);
  const mm = Math.floor(s.left / 60);
  const ss = String(s.left % 60).padStart(2, '0');

  return (
    <div className="flex min-h-screen flex-col items-center gap-7 bg-tint-peach px-5 pb-6 pt-12">
      <Image src="/brand/choices-logo.svg" alt="Choices" width={130} height={52} priority className="block h-[52px] w-auto" style={{ width: "auto" }} />

      <div key={s.view} className="ca-rise flex w-full max-w-[420px] flex-col gap-[18px] rounded-xl bg-white px-7 py-8 shadow-card">
        {s.view === 'signin' && (
          <>
            <Heading title="Sign in to Choices Admin">Access is by invite only. Use your Choices team account.</Heading>
            {s.domain && (
              <Alert tone="error" icon="shield-alert">
                Only Choices team accounts can sign in. {s.domain} is not a @thechoicesapp.com account.
              </Alert>
            )}
            <div className="flex flex-col gap-2.5">
              <button type="button" onClick={() => succeed()} className={WHITE_BTN}>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => succeed()}
                className="flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-pill border-none bg-black font-button text-sm font-bold text-white"
              >
                Continue with Apple
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-[var(--color-border-subtle)]" />
              or use a one-time code
              <span className="h-px flex-1 bg-[var(--color-border-subtle)]" />
            </div>
            <label className="flex flex-col gap-2 text-sm">
              Work email
              <input
                type="email"
                value={s.email}
                autoComplete="email"
                onChange={(e) => patch({ email: e.target.value, emailErr: '', domain: '' })}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="name@thechoicesapp.com"
                aria-invalid={!!(s.emailErr || s.domain)}
                className="h-12 rounded-[14px] border-none bg-surface-muted px-3.5 text-[15px] outline-none focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--color-brand-purple)]"
                style={s.emailErr || s.domain ? { boxShadow: 'inset 0 0 0 1px var(--error-500)' } : undefined}
              />
            </label>
            {s.emailErr && <span className="-mt-2 text-[13px] text-error">{s.emailErr}</span>}
            <Button block onClick={send} disabled={s.sending}>
              {s.sending ? 'Sending code' : 'Send code'}
            </Button>
          </>
        )}

        {s.view === 'code' && (
          <>
            <button
              type="button"
              onClick={() => jump('signin')}
              className="flex w-fit cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 text-sm font-medium text-brand-purple"
            >
              <Icon name="arrow-left" size={16} />
              Use another email
            </button>
            <Heading title="Check your email">
              We sent a 6-digit code to <strong className="text-ink">{s.email}</strong>. It expires in 10 minutes.
            </Heading>
            <CodeBoxes
              code={s.code}
              bad={s.codeErr === 'wrong' || s.codeErr === 'expired'}
              locked={false}
              onChange={(code) => patch({ code, codeErr: null })}
              onEnter={verify}
            />
            {msg && (
              <Alert tone={msg[1]} icon={msg[2]}>
                {msg[0]}
              </Alert>
            )}
            <Button block onClick={verify}>
              Sign in
            </Button>
            <div className="flex justify-center text-sm text-muted">
              {s.left === 0 && (
                <button
                  type="button"
                  onClick={() => patch({ left: 60, code: '', codeErr: null })}
                  className="cursor-pointer border-none bg-transparent p-0 font-button text-sm font-bold text-brand-peach"
                >
                  Resend code
                </button>
              )}
              {s.left > 0 && (
                <span>
                  Resend code in {mm}:{ss}
                </span>
              )}
            </div>
            <span className="text-center text-xs text-muted">
              Prototype: 123456 signs in · 000000 is expired
            </span>
          </>
        )}

        {s.view === 'invite' && (
          <>
            <span className="grid size-[52px] place-items-center rounded-full bg-tint-purple font-button text-base font-bold text-brand-purple">
              AK
            </span>
            <Heading title="Ahmad invited you as Moderator">
              Ahmad Karimi added <strong className="text-ink">{TEAM_EMAIL}</strong> to Choices Admin. Moderators handle reports,
              moderation and support.
            </Heading>
            <div className="flex flex-col rounded-[14px] text-sm shadow-[inset_0_0_0_1px_var(--color-border-subtle)]">
              <div className="flex justify-between px-3.5 py-3">
                <span className="text-muted">Role</span>
                <span className="font-semibold">Moderator</span>
              </div>
              <div className="flex justify-between border-t border-subtle px-3.5 py-3">
                <span className="text-muted">Invite expires</span>
                <span className="font-semibold">23 Oct 2026</span>
              </div>
            </div>
            <Button block onClick={() => succeed(true)}>
              Accept and continue with Google
            </Button>
            <button
              type="button"
              onClick={() => {
                saveRole('moderator');
                setS((cur) => presetFor('code', cur));
              }}
              className={WHITE_BTN.replace('h-12', 'h-11')}
            >
              Accept with a one-time code
            </button>
            <span className="text-center text-xs leading-normal text-muted">
              Not you? Ignore this invite and it expires on its own.
            </span>
          </>
        )}

        {(s.view === 'expired' || s.view === 'signedout') && (
          <>
            {s.view === 'expired' ? (
              <span className="grid size-[52px] place-items-center rounded-full bg-[var(--warning-opacity-10)] text-[var(--warning-variable-700)]">
                <Icon name="timer-off" size={24} />
              </span>
            ) : (
              <span className="grid size-[52px] place-items-center rounded-full bg-tint-purple text-brand-purple">
                <Icon name="log-out" size={24} />
              </span>
            )}
            {s.view === 'expired' ? (
              <Heading title="Your session expired">
                You were signed out after 7 days. Sign in again to pick up where you left off.
              </Heading>
            ) : (
              <Heading title="You are signed out">
                Signed out of Choices Admin on this device. Other sessions stay active.
              </Heading>
            )}
            <Button block onClick={() => jump('signin')}>
              Sign in again
            </Button>
          </>
        )}

        {s.view === 'success' && (
          <>
            <span className="grid size-[52px] place-items-center rounded-full bg-[var(--success-opacity-10)] text-success">
              <Icon name="check" size={24} />
            </span>
            <h1 className="m-0 font-display text-2xl font-bold leading-[1.25] text-brand-purple">Signed in as John Doe</h1>
            <span className="text-sm text-muted">Opening the dashboard</span>
          </>
        )}
      </div>

      <StateJumps active={activeJump(s)} onPick={jump} />
    </div>
  );
}
