# Prajna Shetty — AI Portfolio

A production AI portfolio for an Applied AI engineer (Dubai, UAE). The site
itself demonstrates the work it describes: a multi-stage RAG pipeline answers
visitor questions about the resume, bio, and project READMEs with
streaming Claude Sonnet synthesis. Embedded at the data layer (pgvector) and
served from the edge (Cloudflare Workers). Bilingual (English + Arabic) with
full RTL support across hero, lineage timeline, project grid, and chat surfaces.

For a full technical deep-dive of every AI subsystem (query expansion, multi-query
retrieval, anchor + dedup, prompt caching, refusal architecture, telemetry,
failure modes, cost model, test results), see **[`docs/AI_FEATURES.md`](docs/AI_FEATURES.md)**.

---

## Stack

- **Next.js 16** (App Router, RSC, Turbopack) on TypeScript strict mode
- **Cloudflare Workers** via `@opennextjs/cloudflare` — single Worker serves the
  whole app (SSR, RSC, API, middleware)
- **Supabase** (PostgreSQL + pgvector + Auth + Storage) — persistence + 1024-dim
  semantic search
- **Voyage AI** `voyage-3` for embeddings (1024-dim, L2-normalized)
- **Anthropic Claude API** — Haiku for low-latency NLP, Sonnet for higher-quality
  RAG synthesis
- **Tailwind CSS v4** + **Framer Motion** for the design system
- **next-intl 4** for routing-aware bilingual (EN/AR) i18n with RTL CSS pass
- **Vitest** + **Testing Library** for unit/integration tests

---

## Status

### Shipped to production (Phase 0 → 3)

- **Phase 0** — Repo scaffold, TS strict, Zod env validation, arch-boundary fitness
  tests, CI pipeline
- **Phase 1** — Cloudflare Workers deployment via OpenNext (replaced Pages on
  2026-05-17 for Next.js 16 support)
- **Phase 2** — Core UI: warm editorial design system, alternating-spine lineage
  timeline, project grid, light/dark mode
- **Phase 3** — Real content: 6 lineage entries with real entity logos,
  6-category Arsenal/Tech Stack, 4 curated projects, first-person bio

### Phase 4 — AI features (complete)

Multi-stage RAG pipeline shipped end-to-end and live in production at
[`web-portfolio.prajna-shetty39.workers.dev`](https://web-portfolio.prajna-shetty39.workers.dev/)
(v0.4.0): Voyage `voyage-3` embeddings into Supabase pgvector across bio,
resume, projects, and project READMEs (47 chunks); Haiku 4.5 multi-query
expansion with a `NO_REWRITE` sentinel for off-corpus inputs; Postgres
`match_chunks` RPC for HNSW cosine retrieval; Anthropic prompt caching plus
an in-process answer LRU; Sonnet 4.6 streaming synthesis through a
token-by-token ChatDrawer with source attribution. SYSTEM_PROMPT-only
refusal (off-corpus + anti-injection — no score-based gate). See
[`docs/AI_FEATURES.md`](docs/AI_FEATURES.md) for the full technical
deep-dive (query expansion, anchor + dedup, prompt-cache mechanics,
refusal architecture, telemetry, failure modes, cost model).

### Phase 5 — Bilingual EN/AR (in progress)

- ✅ **Slice 5.4a** — I wired up the i18n scaffold and the LangToggle pill:
  next-intl 4 routing, `[locale]` segment under the App Router, the EN/AR
  `<html lang dir>` swap, and the Noto Sans Arabic font load. Two-key proof
  via the navbar to validate the end-to-end pipeline before scaling translation
  surface.
- ✅ **Slice 5.4b** — I translated the UI chrome — Hero, Footer, Social icons,
  ChatFAB, mobile menu — and added partial Hero RTL anchoring (location pill +
  availability pill + social block + name H1) at four breakpoints. Shipped this
  alongside a production locale-rendering fix that took three coupled changes:
  `setRequestLocale` in every layout AND every page (the layout's wasn't enough
  under static rendering), a static-imports + map object in `request.ts` (the
  bundler couldn't statically analyze my template-literal dynamic import and
  silently dropped `ar.json` from the worker bundle), and an explicit `{ locale,
  messages }` prop on `<NextIntlClientProvider>`. Without those, `/ar` and
  `/en` served byte-identical English content despite correct `<html dir>`
  attrs.
- ✅ **Slice 5.4c** — I pushed the full section + data-file translation in one
  slice: About bio, Lineage timeline entries (roles, locations, dates, bullets),
  Arsenal section chrome + skill cards (eyebrows + titles; keywords stay Latin
  as technical proper nouns), Projects content (descriptions, statuses, meta
  labels & values), ProjectCard buttons, and the Footer name ("Prajna Shetty"
  → "براجنا شيتي"). For the RTL layout, I mirrored the bio quote accent bar to
  physical-right, fully mirrored the lineage timeline spine (logos on
  physical-left of the spine, text on physical-right), repositioned the detail
  card to physical-left with a spine-side buffer (`margin-right` swap because
  `margin-left` was the LTR buffer side), flipped the "Select an entry"
  chevron, and (initially) moved the ChatFAB to bottom-left for inline-end
  symmetry with the hero pills and social icons — later reverted in a
  Session 36 polish pass, see below. The React 19 script-tag
  warning that fired on every locale toggle is gone too — I moved the
  pre-paint theme initializer to `public/prepaint-theme.js` and reference it
  via `<script src>` (React 19 only warns about inline scripts with `children`
  / `dangerouslySetInnerHTML`; `<script src>` is exempt). Proper nouns (Scale
  AI, MITRE, project titles, technical libraries) stay Latin in all locales.
  The Arabic prose is machine-authored best-effort; I've flagged the strings
  via `_review` keys in `ar.json` and inline comments in `journey.ts` /
  `projects.ts` / `skills.ts` so a native reviewer can refine before launch.
- ✅ **Session 36 follow-ups** — A small batch of polish after living with 5.4c
  for a session. The EN↔AR locale toggle now preserves the active section: I
  read the active link from `.nav-links a.active` (written by `SectionObserver`)
  and carry it as a hash fragment into `router.replace(target, { locale, scroll:
  false })`, so toggling from About or Projects lands at the same section in the
  new locale instead of snapping back to Hero. The ChatFAB is back to
  bottom-right under both locales — global chat-trigger convention won over
  local RTL symmetry. The lineage spine RTL mirror now extends to iPad/mobile
  (`≤1199px` or `≤879px` height) — 5.4c only mirrored the desktop alternating
  spine, leaving the single-rail tablet/mobile spine on physical-left under
  `/ar` and fighting reading flow; the new block also flips the spine's
  sub-pixel `translateX(-0.5px)` and the dot's `translate(-50%, 0)` centering
  math, since CSS transforms are physical-coordinate and don't auto-flip with
  `dir`. And the 4th project card (Telecom Churn) got its missing status dot
  back — was using a `'plain'` status variant that rendered text-only, switched
  to `'live'` to match the other deployed projects.
- ✅ **Slice 5.4d** — I translated the ChatDrawer chrome (18 keys: welcome
  shell, suggestion chips, ARIA labels, input placeholder, Sources/Source
  labels, two error variants) and made the RAG pipeline multilingual. I
  appended a Language rule to my SYSTEM_PROMPT — Sonnet now responds in the
  same language as the visitor's most recent message, follows mid-conversation
  switches on the next reply, and preserves a fixed list of proper nouns
  (`Prajna`, `Scale AI`, `MITRE`, `Dubai`, `Syneren`, `NHTSA`, `OpenAI`, plus
  every technology and library name) in their original English form
  regardless of answer language. I also added a one-line Arabic-preservation
  rule to my EXPANSION_SYSTEM so Haiku emits Arabic rewrites for Arabic input
  (Voyage `voyage-3` is multilingual; matching against the English corpus
  works either way — no need to translate-to-English-then-expand). On the
  refusal side, I added an Arabic `REFUSAL_EMPTY_AR` constant guarded by a
  per-query Arabic script-range detector (`/[؀-ۿ]/`), so locale (URL) and
  answer language are deliberately decoupled — a visitor on `/en` who types
  Arabic gets an Arabic refusal, and the SYSTEM_PROMPT applies the same
  per-message language detection at the synthesis layer. The route change
  is a one-line swap (`const refusalCopy = REFUSAL_EMPTY` →
  `pickRefusalCopy(query)`) — English path byte-identical, with a regression
  test that asserts the literal English string. Cross-lingual retrieval
  works "for free": an Arabic Scale AI question matches the same English
  `resume` chunk at `0.542` cosine vs `0.577` for English — within the same
  retrieval range. The 13-session cross-session retrieval invariant
  (`0.577302345907969` on "What did you do at Scale AI?") held byte-exact
  both before and after the slice, ratified now as a 14-session lattice.
  Three new tests landed (Arabic refusal with a negative English-leak guard,
  English byte-identical regression, Arabic expansion preservation) — full
  suite is 79/79 passing. Arabic copy is machine-authored and flagged via
  `_review` keys in `ar.json` (18 keys to pass to a native reviewer
  pre-launch). ChatDrawer slide direction RTL, theme-toggle ball, and projects
  card actions reversal remain explicitly scoped to Slice 5.5a — not regressed
  here.
- ✅ **Slice 5.5a** — I closed out the remaining RTL CSS surfaces from
  Phase 5's plan. The ChatDrawer slides in from physical-left under `/ar`
  now: anchor swapped (`right: 0` → `left: 0`), border side flipped,
  shadow x-offset sign-flipped, closed-state transform sign-flipped
  (`translateX(100%)` → `translateX(-100%)`), and the open-state transform
  re-declared under the `html[dir="rtl"]` selector — the closed-state rule
  has higher specificity than the global `body.chat-open` rule and would
  otherwise leave the drawer stranded off-screen-left after the user
  clicks the FAB. Project card action buttons (`<> GITHUB` + `📄 READ
  SPEC`) are intentionally left to RTL's default flex auto-flip — they
  read `[READ SPEC][GITHUB]` grouped at physical-left of the card under
  `/ar`, mirroring the rest of the page's chrome. The theme toggle ball
  stayed put — I treated it as a chrome atom whose physical position
  should not depend on reading direction (iOS/Apple convention for
  non-text UI controls). Net change: one file, +21 lines, all append-only
  inside the existing `html[dir="rtl"]` section. (Lineage timeline mirror
  is fully done across all breakpoints via 5.4c + Session 36 follow-ups.)
- ✅ **Dark-mode persistence fix** — Surfaced during the Slice 5.5a
  walkthrough. The bug: toggling EN ↔ AR while in dark mode reset the
  page back to light. Root cause was subtle — on locale switch the
  layout re-renders, sending a fresh `<html lang dir className>` payload
  that carries the font variables and `antialiased` but NOT the
  `dark-mode` class (because `dark-mode` was being added imperatively by
  the prepaint script, which only runs on initial page load, not on
  client-side soft nav). The fix uses a cookie as the server-readable
  theme persistence: `layout.tsx` reads `ps-theme` via `await cookies()`
  and conditionally appends `dark-mode` to the `<html>` className
  server-side; `ThemeToggle` writes the cookie alongside the existing
  localStorage write on every toggle; the prepaint script picks up the
  migration path by syncing localStorage → cookie on first load for
  existing users whose theme is only in localStorage. Zero flash on
  locale switch — the server renders the correct class on the very
  first byte of the navigation.
- ✅ **Chatbot formatting hierarchy** — I added a meaningful emphasis
  hierarchy to the chatbot's answers: `**bold**` reserved for ONE
  headline per sentence (the single most important metric, or a project
  name on its first mention), `*italic*` for model and method names
  (*AraBERT*, *LoRA*, *RLHF*) and benchmark/dataset names, plain prose
  for infrastructure (FastAPI, Azure, Docker, etc.) and proper-noun-list
  names like `Scale AI` / `MITRE` / `Prajna`. Pre-edit Sonnet was
  bolding every proper noun, which made the asterisks visual noise
  rather than emphasis. To actually render those markers, I wired
  `react-markdown` into the ChatDrawer with a minimal allowlist (`p`,
  `strong`, `em`) and `unwrapDisallowed` + `skipHtml` so prompt-injection
  attempts can't inject headings, links, or HTML. Refused and errored
  messages bypass the parser entirely (server-controlled plain text),
  and the screen-reader `sr-only` mirror runs through the same pipeline
  so semantic `<strong>` / `<em>` voice cues replace the literal "asterisk
  asterisk Scale AI asterisk asterisk" announcement. Bold weight is 600
  (not 700) so emphasis stays confident without re-introducing the
  pre-edit shouty effect. While I was in the same surface, I tightened
  two `/ar` details that surfaced in the walkthrough: I removed the
  Session 38 ChatDrawer anchor-flip so the drawer slides from the same
  side as the FAB (bottom-right) under both locales — having the trigger
  and the drawer on opposite corners was a UX inconsistency — and added
  `text-align: right` scoped to `html[dir="rtl"] .chat-msg` so English
  answers under `/ar` read aligned with the rest of the RTL chrome.
  SYSTEM_PROMPT now has a §8 Formatting rule that applies identically
  to English and Arabic answers. Five new tests assert the rendering
  contract (bold, italic, mixed, disallowed-strip, Arabic); full suite
  is 84/84 passing.
- [ ] **Slice 5.5b** — Final Phase 5 work: 9-breakpoint visual audit
  plus a detail-card geometry invariant probe under `/ar` to make sure
  the LTR clearance math (col 1 ≥ 40px, max-width clamp ≤ 380 + margin
  clamp ≤ 120) holds in the mirrored layout.
- 🟡 **Slices 5.1–5.3 (MDX blog)** — deferred. The bilingual surface takes
  priority for the UAE hiring audience; blog work resumes once Phase 5's
  i18n surface fully lands.

### Planned

- **Phase 6** — Lighthouse audit, SEO/OG/JSON-LD, mobile pass, analytics +
  persona events, v1.0.0 launch

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000

npm run lint         # ESLint
npm run typecheck    # tsc --noEmit (strict)
npm run test         # vitest run

npm run embed bio              # re-embed bio_chunks via Voyage
npm run embed resume           # re-embed resume_chunks via Voyage
npm run embed seed-projects    # seed + embed all 4 curated projects
npm run embed project <uuid>   # re-embed a single project's readme
npm run probe "your query"     # semantic similarity probe (verification)
```

Local dev requires `.env.local` with Supabase URL + anon key + service role,
Anthropic API key, Voyage API key, and a webhook secret. See `.env.local.example`.

---

## Architecture rules (fitness functions enforced by tests)

- UI layer (`src/app/`, `src/components/`) never imports `src/lib/db/` directly
- All DB access goes through `src/lib/db/*` modules (consumed by Server
  Components or API routes only)
- All AI calls go through `src/app/api/*` routes — secrets never reach the client
  bundle
- Edge-runtime constraints: no Node.js-only modules in API routes (Web APIs +
  edge-compatible packages only)
