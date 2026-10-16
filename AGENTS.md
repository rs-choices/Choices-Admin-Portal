# Choices Admin

Internal back-office for the Choices team: verification, moderation, support
and platform settings. Built from the Claude Design project
`2f76e94f-ac96-4000-8531-1ed1aec74d3e` (see `NEXTJS.md` there for the route map).

- Run with `npm run dev` on port 3001 (portal uses 3000).
- Checks: `npm run typecheck`, `npm run lint`, `npm run build`.
- **Mock data only.** Fixtures live in `lib/mock/`, typed by `lib/types.ts`.
  Screens read them through `lib/data/`, which is the swap point for a real API.
  Do not add Supabase or network calls without Ralph's decision.
- **Roles:** `super`, `admin`, `moderator`. `lib/permissions.ts` holds the
  section list and `can(role, section)`; use it in the sidebar, in pages and on
  every action button.
- **Theme:** every design-system value lives in `theme/` (see its README). Use
  the Tailwind utilities from `theme/tokens/theme.css`; do not invent colours.
- **Copy:** use the design's wording. Sentence case, no exclamation marks.
  Say "business", never "venue". AED as `AED 1,499`. Dates in Asia/Dubai.
- No `window` or `localStorage` during render: effects and handlers only.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
