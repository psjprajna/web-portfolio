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

### Shipped to production (Phase 0 → 4)

- **Phase 0** — Repo scaffold, TS strict, Zod env validation, arch-boundary fitness
  tests, CI pipeline
- **Phase 1** — Cloudflare Workers deployment via OpenNext (replaced Pages on
  2026-05-17 for Next.js 16 support)
- **Phase 2** — Core UI: warm editorial design system, alternating-spine lineage
  timeline, project grid, light/dark mode
- **Phase 3** — Real content: 6 lineage entries with real entity logos,
  6-category Arsenal/Tech Stack, 4 curated projects, third-person bio
- **Phase 4** — Production RAG live at
  [`web-portfolio.prajna-shetty39.workers.dev`](https://web-portfolio.prajna-shetty39.workers.dev/)
  (v0.4.0): Voyage `voyage-3` embeddings into Supabase pgvector across bio,
  resume, projects, and READMEs; Haiku 4.5 multi-query expansion; Sonnet 4.6
  streaming synthesis through a token-by-token ChatDrawer with source
  attribution and SYSTEM_PROMPT-only refusal. See
  [`docs/AI_FEATURES.md`](docs/AI_FEATURES.md) for the technical deep-dive.

### Phase 5 — Bilingual EN/AR (complete)

Bilingual surface (English + Arabic) wired through next-intl 4 routing, the
`[locale]` App Router segment, a Noto Sans Arabic font load, and a full RTL
CSS pass spanning hero, lineage timeline, project grid, ChatDrawer, and
footer. Voyage `voyage-3` is natively multilingual, so cross-lingual
retrieval works without a separate Arabic corpus — a SYSTEM_PROMPT Language
rule and per-query script-range detector keep answer language aligned with
visitor language regardless of URL locale. Cookie-based dark-mode
persistence makes locale toggling zero-flash. The chatbot renders a
constrained markdown emphasis hierarchy (bold for headlines, italic for
model and benchmark names, plain for proper-noun lists) via react-markdown
with a `[p, strong, em]` allowlist that blocks prompt-injection. Project
card grid uses a structural row-template anchor so the row baselines align
across locales at all desktop widths.

MDX blog (Slices 5.1–5.3) deferred until the bilingual surface ships.

### Next

- **Phase 6** — Lighthouse audit, SEO + OG + JSON-LD, mobile pass,
  analytics + persona events, v1.0.0 launch

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
