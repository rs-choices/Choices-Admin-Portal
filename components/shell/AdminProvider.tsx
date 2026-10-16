'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { ROLES, type CountKey, type Role } from '@/lib/types';

// Shared prototype state: the viewing role, the sidebar counters and the toast.
// The role lives in localStorage (`ca.role`) so it survives reloads. It is read
// through useSyncExternalStore, so the server and the first client render both
// use `super` and the saved role takes over right after hydration.

const KEY = 'ca.role';
const EVENT = 'ca-role';

function readRole(): Role {
  try {
    const v = window.localStorage.getItem(KEY);
    return v && (ROLES as string[]).includes(v) ? (v as Role) : 'super';
  } catch {
    return 'super';
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function saveRole(role: Role) {
  try {
    window.localStorage.setItem(KEY, role);
  } catch {
    // Private mode or blocked storage: the role still changes for this page.
  }
  window.dispatchEvent(new Event(EVENT));
}

type AdminState = {
  role: Role;
  setRole: (r: Role) => void;
  counts: Record<CountKey, number>;
  bumpCount: (k: CountKey, delta: number) => void;
  toast: string;
  /** True when the current toast reports a failure (red instead of purple). */
  toastErr: boolean;
  flash: (msg: string, error?: boolean) => void;
};

const Ctx = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const role = useSyncExternalStore(subscribe, readRole, () => 'super' as Role);
  const [counts, setCounts] = useState<Record<CountKey, number>>({ queue: 5, reports: 10, tickets: 23 });
  const [toast, setToast] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = useCallback((msg: string, error = false) => {
    clearTimeout(timer.current);
    setToast(msg);
    setToastErr(error);
    timer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const bumpCount = useCallback((k: CountKey, delta: number) => {
    setCounts((c) => ({ ...c, [k]: Math.max(0, c[k] + delta) }));
  }, []);

  const value = useMemo(() => ({ role, setRole: saveRole, counts, bumpCount, toast, toastErr, flash }), [role, counts, bumpCount, toast, toastErr, flash]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAdmin must be used inside <AdminProvider>');
  return v;
}
