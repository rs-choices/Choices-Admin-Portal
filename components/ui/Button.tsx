import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'text' | 'danger';

type Props = {
  children: ReactNode;
  variant?: Variant;
  size?: 'md' | 'sm';
  block?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
};

const VARIANT: Record<Variant, string> = {
  primary: '',
  outline: 'ds-button-outline',
  text: 'ds-button-text',
  danger: 'ds-button-danger',
};

// The design system Button. With `href` it renders a link styled as a button.
export function Button({ children, variant = 'primary', size = 'md', block, disabled, href, onClick, type = 'button', className = '' }: Props) {
  const cls = ['ds-button', VARIANT[variant], size === 'sm' && 'ds-button-sm', block && 'ds-button-block', className]
    .filter(Boolean)
    .join(' ');
  if (href && !disabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
