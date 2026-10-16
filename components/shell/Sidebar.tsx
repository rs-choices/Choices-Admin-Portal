'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { SECTIONS } from '@/lib/permissions';
import { ROLE_LABEL } from '@/lib/types';
import { useAdmin } from './AdminProvider';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { role, counts } = useAdmin();
  const items = SECTIONS.filter((s) => s.roles.includes(role));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <nav
        aria-label="Admin sections"
        data-print="hide"
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[248px] flex-col gap-6 overflow-y-auto border-r border-subtle bg-white px-3.5 py-5 transition-transform lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 px-2.5 py-1 no-underline">
          <Image src="/brand/choices-logo.svg" alt="Choices" width={90} height={36} priority className="block h-9 w-auto" style={{ width: "auto" }} />
          <span className="rounded-pill bg-tint-purple px-2 py-[3px] text-[11px] font-semibold uppercase tracking-[.12em] text-muted">
            Admin
          </span>
        </Link>

        <div className="flex flex-col gap-0.5">
          {items.map((s) => {
            const active = pathname === s.href || pathname.startsWith(s.href + '/');
            const count = s.countKey ? counts[s.countKey] : 0;
            return (
              <Link
                key={s.id}
                href={s.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`flex h-[42px] items-center gap-3 rounded-md px-3 text-sm no-underline ${
                  active
                    ? 'bg-tint-purple font-semibold text-brand-purple hover:text-brand-purple'
                    : 'font-medium text-[var(--pure-black-variable-400)] hover:bg-page hover:text-[var(--pure-black-variable-400)]'
                }`}
              >
                <span className={active ? 'text-brand-purple' : 'text-[var(--pure-black-variable-200)]'}>
                  <Icon name={s.icon} size={18} />
                </span>
                <span className="flex-1">{s.label}</span>
                {s.later && (
                  <span className="rounded-pill px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[.06em] text-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,.1)]">
                    Later
                  </span>
                )}
                {count > 0 && (
                  <span
                    className={`grid h-5 min-w-[22px] place-items-center rounded-pill px-[7px] text-[11px] font-bold ${
                      active
                        ? 'bg-brand-purple text-white'
                        : 'bg-tint-peach text-brand-peach shadow-[inset_0_0_0_1px_var(--primary-orange-opacity-20)]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-1 rounded-lg bg-page p-3.5">
          <span className="text-[11px] font-semibold uppercase tracking-[.12em] text-muted">Viewing as</span>
          <span className="text-sm font-semibold text-brand-purple">{ROLE_LABEL[role]}</span>
        </div>
      </nav>
    </>
  );
}
