// Sign-in state machine presets, ported from the prototype's go() function.

export type View = 'signin' | 'code' | 'invite' | 'expired' | 'signedout' | 'success';
export type CodeErr = 'short' | 'wrong' | 'expired' | null;

export type SignInState = {
  view: View;
  email: string;
  emailErr: string;
  /** The non-team address that was refused, if any. */
  domain: string;
  code: string;
  codeErr: CodeErr;
  /** Seconds before "Resend code" is offered. */
  left: number;
  sending: boolean;
};

export const JUMPS = [
  'signin',
  'domain',
  'code',
  'wrong',
  'expired-code',
  'invite',
  'session-expired',
  'signed-out',
] as const;
export type Jump = (typeof JUMPS)[number];

export const JUMP_LABEL: Record<Jump, string> = {
  signin: 'Sign in',
  domain: 'Non-team account',
  code: 'Code',
  wrong: 'Wrong code',
  'expired-code': 'Expired code',
  invite: 'Accept invite',
  'session-expired': 'Session expired',
  'signed-out': 'Signed out',
};

export const TEAM_EMAIL = 'johndoe@thechoicesapp.com';

export const BLANK: SignInState = {
  view: 'signin',
  email: '',
  emailErr: '',
  domain: '',
  code: '',
  codeErr: null,
  left: 60,
  sending: false,
};

const PRESET: Record<Jump, Partial<SignInState>> = {
  signin: { view: 'signin', domain: '' },
  domain: { view: 'signin', domain: 'sara@gmail.com', email: 'sara@gmail.com' },
  code: { view: 'code', email: TEAM_EMAIL, code: '', codeErr: null, left: 60 },
  wrong: { view: 'code', email: TEAM_EMAIL, code: '482910', codeErr: 'wrong', left: 42 },
  'expired-code': { view: 'code', email: TEAM_EMAIL, code: '000000', codeErr: 'expired', left: 0 },
  invite: { view: 'invite' },
  'session-expired': { view: 'expired' },
  'signed-out': { view: 'signedout' },
};

/** The full state for a jump, applied on top of the current one. */
export function presetFor(j: Jump, current: SignInState = BLANK): SignInState {
  return { ...current, emailErr: '', domain: '', sending: false, ...PRESET[j] };
}

/** Which jump chip is lit for the current state. */
export function activeJump(s: SignInState): Jump | null {
  if (s.view === 'signin') return s.domain ? 'domain' : 'signin';
  if (s.view === 'code') {
    if (s.codeErr === 'wrong') return 'wrong';
    if (s.codeErr === 'expired') return 'expired-code';
    return s.codeErr ? null : 'code';
  }
  if (s.view === 'invite') return 'invite';
  if (s.view === 'expired') return 'session-expired';
  if (s.view === 'signedout') return 'signed-out';
  return null;
}
