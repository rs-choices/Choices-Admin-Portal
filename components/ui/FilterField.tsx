'use client';

import { Icon } from './Icon';

export function FilterField({ value, onChange, placeholder, className = '' }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={`flex h-10 flex-[0_1_300px] items-center gap-2.5 rounded-[14px] bg-white px-3.5 text-muted shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] ${className}`}>
      <Icon name="search" size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 border-none bg-transparent text-sm text-ink outline-none"
      />
    </label>
  );
}
