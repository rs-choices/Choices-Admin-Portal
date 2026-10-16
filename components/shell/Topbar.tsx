'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Segmented } from '@/components/ui/Segmented';
import { NOTIFICATIONS, SEARCH_INDEX } from '@/lib/mock';
import { can, sectionById } from '@/lib/permissions';
import { ROLE_LABEL, ROLES, type Role } from '@/lib/types';
import { useAdmin } from './AdminProvider';

const ROLE_OPTS = ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }));
// On phones the panels pin to the screen edges so they never run off-screen.
const PANEL = 'absolute right-0 top-[52px] z-50 rounded-xl bg-white p-2 shadow-pop max-sm:fixed max-sm:inset-x-4 max-sm:top-[76px] max-sm:w-auto';
const ROW = 'flex rounded-[12px] px-3 py-2.5 no-underline hover:bg-page';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { role, setRole } = useAdmin();
  const [q, setQ] = useState('');
  const [panel, setPanel] = useState<'bell' | 'me' | null>(null);
  // Notifications read so far, by text. Moderators only see the ones for
  // sections they can open.
  const [read, setRead] = useState<string[]>([]);
  const notifs = NOTIFICATIONS.filter((n) => {
    const id = n.href.split(/[/?]/)[1];
    const sec = sectionById(id);
    return !sec || can(role, sec.id);
  });
  const unreadCount = notifs.filter((n) => !read.includes(n.text)).length;
  const ref = useRef<HTMLElement>(null);

  // Clicking outside the bar or pressing Escape closes the open panel.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPanel(null);
        setQ('');
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const ql = q.trim().toLowerCase();
  const results = ql ? SEARCH_INDEX.filter((r) => (r.name + r.meta).toLowerCase().includes(ql)).slice(0, 8) : [];
  const toggle = (p: 'bell' | 'me') => setPanel((cur) => (cur === p ? null : p));
  const close = () => {
    setPanel(null);
    setQ('');
  };

  return (
    <header
      ref={ref}
      data-print="hide"
      className="sticky top-0 z-40 flex h-[68px] items-center gap-3 border-b border-subtle bg-white/[.86] px-4 backdrop-blur-[16px] sm:px-6"
    >
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-none bg-transparent text-brand-purple hover:bg-page lg:hidden"
      >
        <Icon name="menu" size={20} />
      </button>

      <div className="relative min-w-0 max-w-[460px] flex-[1_1_160px]">
        <label className="flex h-11 items-center gap-2.5 rounded-md bg-surface-muted px-3.5 text-muted">
          <Icon name="search" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search businesses, clients, tickets"
            aria-label="Search businesses, clients, tickets"
            className="min-w-0 flex-1 border-none bg-transparent text-sm text-ink outline-none"
          />
          {ql && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="Clear"
              className="grid cursor-pointer place-items-center border-none bg-transparent p-0 text-muted"
            >
              <Icon name="x" size={18} />
            </button>
          )}
        </label>
        {ql && (
          <div className="absolute inset-x-0 top-[52px] z-50 flex max-h-[420px] min-w-[min(280px,calc(100vw-32px))] flex-col gap-0.5 overflow-auto rounded-xl bg-white p-2 shadow-pop">
            {results.map((r) => (
              <Link key={r.href} href={r.href} onClick={close} className={`${ROW} items-center gap-3 text-ink hover:text-ink`}>
                <span className="text-brand-purple">
                  <Icon name={r.icon} size={16} />
                </span>
                <span className="flex-1 text-sm font-medium">{r.name}</span>
                <span className="text-xs text-muted">
                  {r.kind} · {r.meta}
                </span>
              </Link>
            ))}
            {results.length === 0 && (
              <div className="px-3 py-4 text-sm text-muted">
                Nothing matches “{q}”. Try a trade licence number, email or ticket ID.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1" />

      <div title="Prototype role switcher" className="shrink-0">
        <div className="hidden sm:block">
          <Segmented label="Prototype role" size="sm" options={ROLE_OPTS} value={role} onChange={setRole} />
        </div>
        <select
          aria-label="Prototype role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="h-9 rounded-pill border-none bg-surface-muted px-3 text-xs font-semibold text-brand-purple sm:hidden"
        >
          {ROLE_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggle('bell')}
          aria-label="Notifications"
          aria-expanded={panel === 'bell'}
          className="grid size-11 cursor-pointer place-items-center rounded-full border-none bg-transparent text-brand-purple hover:bg-page"
        >
          <Icon name="bell" size={20} />
        </button>
        {unreadCount > 0 && (
          <span
            aria-label={unreadCount + ' unread'}
            className="pointer-events-none absolute right-1.5 top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-pill bg-brand-peach px-1 text-[10px] font-bold text-white shadow-[0_0_0_2px_#fff]"
          >
            {unreadCount}
          </span>
        )}
        {panel === 'bell' && (
          <div className={`${PANEL} w-[360px]`}>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-ink">Notifications</span>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setRead(notifs.map((n) => n.text))}
                  className="cursor-pointer border-none bg-transparent font-button text-xs font-bold text-brand-peach"
                >
                  Mark all as read
                </button>
              ) : (
                <span className="text-xs text-muted">All caught up</span>
              )}
            </div>
            {notifs.length === 0 && <div className="px-3 py-6 text-center text-sm text-muted">No notifications yet.</div>}
            {notifs.map((n) => {
              const isUnread = !read.includes(n.text);
              return (
                <div key={n.text} className={`${ROW} items-start gap-3 ${isUnread ? 'bg-page' : ''}`}>
                  <Link
                    href={n.href}
                    onClick={() => {
                      setRead((r) => (r.includes(n.text) ? r : [...r, n.text]));
                      close();
                    }}
                    className="flex min-w-0 flex-1 gap-3 no-underline"
                  >
                    <span className="grid size-[34px] shrink-0 place-items-center rounded-full bg-tint-purple text-brand-purple">
                      <Icon name={n.icon} size={16} />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className={`text-[13px] leading-[1.4] text-ink ${isUnread ? 'font-semibold' : ''}`}>{n.text}</span>
                      <span className="text-xs text-muted">{n.time}</span>
                    </span>
                  </Link>
                  {isUnread && (
                    <button
                      type="button"
                      onClick={() => setRead((r) => [...r, n.text])}
                      aria-label={'Mark as read: ' + n.text}
                      title="Mark as read"
                      className="mt-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border-none bg-transparent hover:bg-tint-purple"
                    >
                      <span className="size-2 rounded-full bg-brand-peach" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => toggle('me')}
          aria-label="Account menu"
          aria-expanded={panel === 'me'}
          className="size-10 cursor-pointer rounded-full border-none bg-brand-purple font-button text-[13px] font-bold text-white"
        >
          JD
        </button>
        {panel === 'me' && (
          <div className={`${PANEL} w-[270px]`}>
            <div className="flex flex-col gap-0.5 border-b border-subtle px-3 pb-3 pt-2.5">
              <span className="text-sm font-semibold text-ink">John Doe</span>
              <span className="text-xs text-muted">johndoe@thechoicesapp.com · {ROLE_LABEL[role]}</span>
            </div>
            <Link href="/settings" onClick={close} className={`${ROW} text-sm text-ink hover:text-ink`}>
              My profile
            </Link>
            <Link href="/sign-in?state=session-expired" onClick={close} className={`${ROW} text-sm text-ink hover:text-ink`}>
              Preview session expired
            </Link>
            <Link
              href="/sign-in?state=signed-out"
              onClick={close}
              className={`${ROW} text-sm font-medium text-error hover:bg-[var(--error-opacity-10)] hover:text-error`}
            >
              Sign out
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
