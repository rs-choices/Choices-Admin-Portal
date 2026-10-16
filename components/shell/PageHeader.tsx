import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-[1_1_320px] flex-col gap-1">
        <h1 className="m-0 font-display text-[28px] font-bold leading-[1.2] text-brand-purple">{title}</h1>
        {subtitle && <span className="text-sm text-muted">{subtitle}</span>}
      </div>
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
