# Choices theme

Every design-system value in this app lives in this folder. Imported from the
**Choices Design System** project on claude.ai/design
(`5c243588-8c26-487e-b166-d6755cc8b87c`), the same system `portal/theme/`
comes from.

```
theme/
├── index.css            single CSS entry point (imported by app/globals.css)
├── fonts.ts             next/font loaders (Plus Jakarta Sans, Montserrat)
├── components.css       base defaults, .ds-button, .ds-chip, keyframes
└── tokens/
    ├── fig-tokens.css   raw Figma variables, verbatim
    ├── colors.css       the design system's semantic aliases and spacing
    └── theme.css        the @theme block Tailwind reads
```

Write new work against the utilities `theme.css` generates (`bg-brand-purple`,
`text-muted`, `bg-surface-muted`, `bg-tint-purple`, `rounded-xl`,
`shadow-card`, `font-display`, `font-button`). The Figma file names Grift and
Trueno; the design system substitutes Plus Jakarta Sans and Montserrat.
