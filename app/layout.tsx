import type { Metadata } from 'next';
import { fontVariables } from '@/theme/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Choices Admin', template: '%s · Choices Admin' },
  description: 'Internal back-office for the Choices team.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
