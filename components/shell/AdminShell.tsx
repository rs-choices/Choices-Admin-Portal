'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Toast } from './Toast';
import { Topbar } from './Topbar';

// The frame every admin page sits in. Under 1024px the sidebar is a drawer;
// its links close it on navigation.
export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <div className="grid min-h-screen bg-page lg:grid-cols-[248px_minmax(0,1fr)]">
      <Sidebar open={open} onClose={close} />
      <div className="flex min-w-0 flex-col">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto flex w-full max-w-[1360px] flex-col gap-6 px-4 pb-16 pt-7 sm:px-8">{children}</main>
      </div>
      <Toast />
    </div>
  );
}
