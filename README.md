# Choices Admin

The internal back-office for the Choices team. This is a front-end prototype:
everything runs on mock data, with no backend.

## Run it

```bash
npm install
npm run dev        # http://localhost:3001
```

If `next dev` stops with "OS file watch limit reached", either raise the
Linux inotify limit (`fs.inotify.max_user_watches=524288` in
`/etc/sysctl.d/`) or run `npm run dev:poll`, which uses webpack with polling
instead of file watches (slower reloads).

Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Prototype controls

- **Sign-in:** any `@thechoicesapp.com` email gets a code. `123456` signs in,
  `000000` is an expired code. Wrong codes never lock the account.
  `/sign-in?state=` opens a state directly: `code`, `domain`, `wrong`,
  `expired-code`, `invite`, `session-expired`, `signed-out`. The chips
  under the card do the same.
- **Role:** the switcher in the top bar changes between Super admin, Admin and
  Moderator. The choice is kept in `localStorage` (`ca.role`).
- **Dashboard states:** `/dashboard?demo=loading`, `?demo=empty`, `?demo=error`.

## Where things live

| Path | What |
| --- | --- |
| `app/(auth)/sign-in` | Sign-in screens |
| `app/(admin)/layout.tsx` | Shell: sidebar, top bar, toast |
| `app/(admin)/dashboard` | Dashboard |
| `app/(admin)/[section]` | "Coming next" pages for the other sections |
| `lib/mock/` | All prototype data |
| `lib/data/` | Data access; replace with real API calls later |
| `lib/permissions.ts` | Sections per role |
| `theme/` | Choices design system tokens, fonts and component classes |
