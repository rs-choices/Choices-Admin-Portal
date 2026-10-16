'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Right-side quick-view panel. Backdrop click and Escape close it.
export function Drawer({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/25" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-label={label}
        className="ca-slide fixed inset-y-0 right-0 z-[91] flex w-[min(420px,100vw)] flex-col gap-[18px] overflow-y-auto bg-white p-6 shadow-[-12px_0_40px_rgba(0,0,0,.12)]"
      >
        {children}
      </aside>
    </>
  );
}
