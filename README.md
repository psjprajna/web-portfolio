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

- ✅ **Slice 5.4a** — i18n scaffold + LangToggle wired (next-intl 4 routing,
  `[locale]` segment, EN/AR `<html lang dir>` swap, Noto Sans Arabic loaded)
- ✅ **Slice 5.4b** — UI chrome translation (Hero/Footer/Social/ChatFAB/Mobile
  menu translated; partial Hero RTL anchoring; production locale-rendering fix:
  `setRequestLocale` in every layout+page, static-import message map)
- ✅ **Slice 5.4c** — Section content + data-file translation: About bio +
  Lineage timeline entries (roles, locations, dates, bullets) + Arsenal section
  chrome + Arsenal skill cards (eyebrows + titles; keywords stay Latin as
  technical proper nouns) + Projects content (descriptions, statuses, meta
  labels & values) + ProjectCard buttons + Footer name ("Prajna Shetty" →
  "براجنا شيتي") translated. RTL CSS pass on relevant chrome: bio quote accent
  bar mirrors to physical-right; lineage timeline spine fully mirrors (logo on
  physical-left of spine, text on physical-right); detail card repositions to
  physical-left with spine buffer; "Select an entry" chevron flips; ChatFAB
  anchors at bottom-left for inline-end visual symmetry with hero pills + social
  icons. React 19 script-tag warning fixed by moving the pre-paint theme
  initializer to `public/prepaint-theme.js` and referencing via `<script src>`.
  Proper nouns (Scale AI, MITRE, project titles, technical libraries) stay
  Latin in all locales. Arabic prose is machine-authored and flagged for
  pre-launch native review via `_review` keys in `ar.json` + comments in
  `journey.ts` / `projects.ts` / `skills.ts`.
- [ ] **Slice 5.4d** — ChatDrawer welcome shell + multilingual RAG (SYSTEM_PROMPT
  §8 LANGUAGE RULE, Arabic REFUSAL_EMPTY)
- [ ] **Slice 5.5a/b** — Remaining RTL CSS (ChatDrawer slide direction, theme
  toggle ball, projects card actions reversal) + 9-breakpoint audit
- 🚫 **Slices 5.1–5.3** — MDX blog deferred indefinitely (Session 32 user decision)

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
