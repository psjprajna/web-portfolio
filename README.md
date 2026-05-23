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

- ✅ **Slice 4.0** — RAG schema migration: `bio_chunks`, `resume_chunks`,
  `rag_queries`, `project_chunks`, projects extended for resume-only entries
- ✅ **Slice 4.1** — pgvector embedding pipeline (Voyage `voyage-3` via direct
  fetch, batched to respect free-tier 3 RPM)
- ✅ **Slice 4.1b/c + verify** — bio (10 chunks), resume (6 chunks), retrieval
  probe (9/10 hand-curated queries return expected chunk in top-3)
- ✅ **Task #18** — seed `projects` table from curated data (4 rows embedded
  via batched Voyage call)
- ✅ **Slice 4.2** — `<ChatDrawer>` end-to-end:
  `match_chunks` Postgres RPC (UNION over bio ∪ resume ∪ projects ∪ project_readme,
  HNSW cosine distance) → `/api/ai/rag` SSE-streaming route → token-by-token
  streaming UI with source attribution chips
- ✅ **Slice 4.2.x** — Project README chunking (corpus 19 → 47 chunks)
- ✅ **Slice 4.2e** — Anthropic prompt caching + in-process answer LRU +
  `cache_hit` telemetry — single Sonnet warm-replay measured at **1085× latency drop**
- ✅ **Slice 4.2f/f.1/f.2/f.3** — Multi-query expansion via Haiku 4.5
  (`expandQuery` + `matchChunksMulti`), `NO_REWRITE` sentinel for off-corpus
  inputs, refusal-band rationale refresh
- 🔁 **Slice 4.3** — Natural-language project filter: shipped + reverted
  (4-project corpus too small to justify NL filtering over eyeballing the grid).
  Net carryover: `createCache` factory, `ProjectCard` extraction,
  `rag_queries.feature` CHECK enum.
- ✅ **Slice 4.2g** — Chatbot quality pass: Profile-facts bio chunk +
  AI-assistant voice + score-based refusal gate **removed**. The SYSTEM_PROMPT's
  off-corpus refusal + anti-injection rules are now the sole refusal mechanism.
  **Closes Phase 4.** See `docs/AI_FEATURES.md` for the full technical
  deep-dive.
- 🚫 **Slices 4.4 / 4.5 / 4.6** — Persona-adaptive hero, inline code explainer,
  terminal easter egg. Retired Session 30 on a scope-discipline decision —
  visitor-driven rather than demo-driven Phase 4 close.

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
- [ ] **Slice 5.4d** — Next up: I'm translating the ChatDrawer welcome shell
  and making the RAG pipeline multilingual — adding a §8 LANGUAGE RULE to my
  SYSTEM_PROMPT so Claude follows the visitor's language across turns, an
  Arabic REFUSAL_EMPTY constant, and an Arabic-input expansion test through
  the Haiku rewrite phase. The Voyage `voyage-3` embedding model is already
  multilingual, so retrieval support is free.
- [ ] **Slice 5.5a/b** — Then I'm closing out the remaining RTL CSS pass —
  ChatDrawer slide direction, theme toggle ball, and projects card actions
  reversal — followed by a 9-breakpoint audit and a detail-card geometry
  invariant probe under `/ar` to make sure the LTR clearance math holds in
  the mirrored layout. (Lineage timeline mirror is now fully done across all
  breakpoints via 5.4c + Session 36 follow-ups.)
- 🟡 **Slices 5.1–5.3 (MDX blog)** — Deferred for now. I'm prioritizing the
  bilingual surface to unblock the Arabic-speaking part of my UAE hiring
  audience first; the blog work resumes once Phase 5's i18n surface fully
  lands.

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
