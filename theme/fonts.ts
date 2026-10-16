import { Montserrat, Plus_Jakarta_Sans } from 'next/font/google';

/* The Figma file specifies Grift (display/body) and Trueno (buttons), but no
   font files exist for either — Grift is a paid font and Trueno has no reliable
   free source — so the design system permanently substitutes Plus Jakarta Sans
   and Montserrat.

   next/font self-hosts both at build time, so there is no render-blocking
   request to Google and no layout shift. Each one exposes a CSS variable that
   the font tokens in ./tokens/theme.css point at; app/layout.tsx puts
   `fontVariables` on <html> so those variables exist. */

export const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const fontVariables = `${jakarta.variable} ${montserrat.variable}`;
