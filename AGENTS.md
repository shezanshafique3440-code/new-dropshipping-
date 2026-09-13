<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project conventions

- Storefront copy, navigation, currency and social links come from
  `src/config/site.ts` — never hard-code them in components.
- Styling is token-driven: add design tokens in `src/styles/globals.css`
  (`@theme inline`) rather than reaching for raw hex values or arbitrary
  Tailwind values.
- Keep components Server Components unless they need state, effects or browser
  APIs.
- Run `npm run check` (lint + typecheck) before committing.
