import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/env'

// Haiku-classified natural-language project filter (Slice 4.3).
//
// Given a visitor's filter phrase ("RAG", "Azure", "production ML"), Haiku
// returns which of the hardcoded portfolio projects match. Plain-text output
// with two sentinels: `MATCH: 01,03` (1+ matches) or `NO_MATCH` (none).
// We deliberately avoid JSON-mode at this label space (4 classes) — Haiku 4.5
// follows strict text formats reliably and the plain-text round-trip is
// ~3-4× faster than JSON-mode wrap overhead.
//
// Architecture-boundary note: this module sits under src/lib/ai/ and the
// fitness function (tests/arch/boundaries.test.ts) forbids any
// `import ... from "@/lib/data/..."` here. The route file owns the
// projects-to-descriptors adapter; we accept descriptors as an argument.

export const FILTER_MODEL = 'claude-haiku-4-5-20251001'
export const FILTER_REFUSE_SENTINEL = 'NO_MATCH'
const FILTER_MAX_TOKENS = 50

export interface ProjectDescriptor {
  num: string // "01" | "02" | "03" | "04"
  title: string
  archStack: string
  impact: string
}

export interface FilterResult {
  matching: string[] // e.g. ["01", "03"]
  degraded: boolean // true on Haiku error → caller falls back to all
}

// Pure prompt-builder. Exported so the fitness test in
// tests/api/filter.test.ts can assert that every project's archStack/impact/num
// appears in the produced system prompt — catches the F11 mode (project data
// renamed without updating the classifier prompt) at CI time.
export function buildFilterSystemPrompt(descriptors: ProjectDescriptor[]): string {
  const projectsList = descriptors
    .map((d) => `Project ${d.num}: ${d.title} | ${d.archStack} | ${d.impact}`)
    .join('\n')

  return `You are a project-matching classifier for Prajna Shetty's AI portfolio.
You see ${descriptors.length} projects. A visitor types a filter phrase. Output which projects match.

Projects:
${projectsList}

Rules:
- Output ONE line only.
- If 1+ projects match the filter (by topic, tech stack, architecture, domain, OR impact metric), output:
  MATCH: ID,ID,...
  Example: MATCH: 01,03
- If NO projects match the filter, output:
  NO_MATCH
- Match generously by intent — a recruiter typing "RAG" wants the RAG project; typing "NLP" wants the NLP/sentiment project; typing "Python" matches all projects since they all use Python; typing "Azure" matches any project deployed on Azure.
- IDs MUST be from {${descriptors.map((d) => d.num).join(', ')}}. Never invent IDs.
- Never explain. Never add prose. Never quote IDs. ONE line only.`
}

export async function filterProjects(
  filter: string,
  descriptors: ProjectDescriptor[]
): Promise<FilterResult> {
  const trimmed = filter.trim()
  if (!trimmed) {
    return { matching: descriptors.map((d) => d.num), degraded: false }
  }

  const validIds = new Set(descriptors.map((d) => d.num))

  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    const response = await client.messages.create({
      model: FILTER_MODEL,
      max_tokens: FILTER_MAX_TOKENS,
      system: buildFilterSystemPrompt(descriptors),
      messages: [{ role: 'user', content: trimmed }],
    })

    const block = response.content[0]
    const text = block && block.type === 'text' ? block.text.trim() : ''
    const firstLine = text.split('\n')[0]?.trim() ?? ''

    if (firstLine.toUpperCase() === FILTER_REFUSE_SENTINEL) {
      console.log('[filterProjects] NO_MATCH')
      return { matching: [], degraded: false }
    }

    const matchPattern = firstLine.match(/^MATCH:\s*(.+)$/i)
    if (!matchPattern) {
      // Malformed output — degrade to all so the page never breaks.
      console.warn('[filterProjects] malformed output, degrading to all:', firstLine)
      return {
        matching: descriptors.map((d) => d.num),
        degraded: true,
      }
    }

    // Clamp IDs to the descriptor set — Haiku occasionally invents IDs under
    // edge inputs (typos, ambiguous filters). The validIds Set filter discards
    // anything outside {01, 02, 03, 04} silently.
    const ids = matchPattern[1]!
      .split(',')
      .map((s) => s.trim().replace(/[^0-9]/g, ''))
      .filter((s) => validIds.has(s))

    console.log('[filterProjects]', { filter: trimmed, matching: ids })
    return { matching: ids, degraded: false }
  } catch (err) {
    // Anthropic 5xx / 429 / timeout → degrade to all so the page never breaks.
    console.warn('[filterProjects] Haiku error, falling back to all:', err)
    return {
      matching: descriptors.map((d) => d.num),
      degraded: true,
    }
  }
}
