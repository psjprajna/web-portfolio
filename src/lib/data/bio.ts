import { SKILLS } from './skills'

export type BioSection = 'about' | 'arsenal'

export interface BioChunk {
  section: BioSection
  heading: string | null
  display_order: number
  content: string
}

const ABOUT_CHUNKS: readonly BioChunk[] = [
  {
    section: 'about',
    // Heading "Profile facts" is deliberately distinct from the in-code
    // ANCHOR_CHUNK's title "Profile snapshot" (synthesize.ts) — dedupeChunks
    // keys by `${source}::${title}`, so distinct titles let both surfaces
    // co-exist when this chunk is retrieved alongside the always-on anchor.
    heading: 'Profile facts',
    display_order: 0,
    content:
      'Based in Dubai, UAE. Available for AI engineering roles immediately. ' +
      'Contact: prajna.shetty39@gmail.com, linkedin.com/in/psjprajna, github.com/psjprajna. ' +
      'AI/ML Engineer with 3+ years of production AI experience. ' +
      'Currently Software Engineer at Syneren Technology Corporation since Feb 2023, ' +
      'shipping LangGraph multi-agent pipelines and RAG into U.S. federal NHTSA workflows. ' +
      'Previously RLHF Specialist & Team Lead at Scale AI from Jun 2023 to Jun 2024, ' +
      'contributing to OpenAI frontier model alignment via SFT + RLHF/PPO/DPO. ' +
      'M.S. Data Analytics, George Mason University (Dec 2022). ' +
      'B.E. Computer Science, NMIT (Aug 2020).',
  },
  {
    section: 'about',
    heading: null,
    display_order: 1,
    content:
      'I build AI systems that ship — to federal infrastructure, frontier-model training pipelines, and real users.',
  },
  {
    section: 'about',
    heading: null,
    display_order: 2,
    content:
      "AI/ML Engineer with direct experience inside OpenAI's frontier LLM training pipeline — Team Lead at Scale AI leading 50+ annotators on SFT + RLHF/PPO/DPO evaluations — and 3+ years building production AI systems on U.S. federal infrastructure for the U.S. Department of Transportation / NHTSA.",
  },
  {
    section: 'about',
    heading: null,
    display_order: 3,
    content:
      'Specialise in RAG pipeline engineering (hybrid retrieval, RAGAS evaluation, LangFuse observability), multi-agent architectures (LangGraph, ReAct), and end-to-end MLOps from MLflow tracking to drift monitoring and FastAPI deployment. Now Dubai-based, available immediately.',
  },
]

const ARSENAL_CHUNKS: readonly BioChunk[] = SKILLS.map((skill, index) => ({
  section: 'arsenal' as const,
  heading: skill.title,
  display_order: index + 1,
  content: `${skill.title}: ${skill.keywords}`,
}))

export const BIO_CHUNKS: readonly BioChunk[] = [
  ...ABOUT_CHUNKS,
  ...ARSENAL_CHUNKS,
]
