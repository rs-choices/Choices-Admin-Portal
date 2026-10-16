'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

// Modal dialog: backdrop click and Escape close it, focus moves inside and is
// kept there with Tab, and returns to the opener on close.
export function Dialog({
  title,
  description,
  width = 480,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  width?: number;
  onClose: () => void;
  children?: ReactNode;
  footer: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Latest onClose, so the focus effect runs once per opening, not per render.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const box = ref.current;
    const focusables = () =>
      box ? [...box.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((e) => !e.hasAttribute('disabled')) : [];
    (focusables().find((e) => e.matches('input, select, textarea')) ?? focusables()[0])?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-6" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="ca-rise flex max-h-[calc(100vh-48px)] w-full flex-col gap-4 overflow-auto rounded-xl bg-white p-6 shadow-[0_18px_44px_rgba(0,0,0,.18)]"
        style={{ maxWidth: width }}
      >
        <div className="flex justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <h3 className="m-0 font-display text-xl font-bold leading-[1.3] text-ink">{title}</h3>
            {description && <span className="text-sm leading-normal text-muted">{description}</span>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border-none bg-surface-muted text-ink"
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        {children}
        <div className="flex justify-end gap-2 pt-1">{footer}</div>
      </div>
    </div>
  );
}

export const FIELD = 'rounded-[14px] border-none bg-surface-muted px-3 text-sm text-ink outline-none focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--color-brand-purple)]';
