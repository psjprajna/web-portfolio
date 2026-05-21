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
