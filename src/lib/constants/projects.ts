export interface ProjectData {
  id: string
  num: string
  title: string
  description: string
  category: string
  tech: string[]
  mediaType: 'VIDEO' | 'IMAGE'
  gradient: string
  liveUrl: string | null
  codeUrl: string | null
  paperUrl: string | null
}

export const PROJECTS: ProjectData[] = [
  {
    id: 'rag-pipeline',
    num: '01',
    title: 'RAG Q&A Pipeline',
    description: 'Production retrieval. 10K+ daily queries, sub-200ms latency. Multi-tenant streaming.',
    category: 'RAG · LLM',
    tech: ['Claude API', 'pgvector', 'FastAPI'],
    mediaType: 'VIDEO',
    gradient: 'linear-gradient(160deg, #1a1610, #2e2010)',
    liveUrl: '#',
    codeUrl: '#',
    paperUrl: null,
  },
  {
    id: 'nlp-classifier',
    num: '02',
    title: 'NLP Intent Classifier',
    description: 'Fine-tuned BERT. 40+ intents, 94% accuracy. EN/AR support for regional deployment.',
    category: 'NLP · Classification',
    tech: ['PyTorch', 'HuggingFace', 'BERT'],
    mediaType: 'IMAGE',
    gradient: 'linear-gradient(160deg, #1c1a14, #2a2420)',
    liveUrl: null,
    codeUrl: '#',
    paperUrl: '#',
  },
  {
    id: 'persona-engine',
    num: '03',
    title: 'Persona Detection Engine',
    description: "Real-time visitor classification at edge latency. Powers this portfolio's adaptive content.",
    category: 'Agents · Edge',
    tech: ['Claude Haiku', 'CF Workers'],
    mediaType: 'VIDEO',
    gradient: 'linear-gradient(160deg, #181410, #2a1e0a)',
    liveUrl: '#',
    codeUrl: '#',
    paperUrl: null,
  },
  {
    id: 'llm-eval',
    num: '04',
    title: 'LLM Evaluation Suite',
    description: 'Custom eval framework tracking hallucination, relevance & latency across model versions.',
    category: 'Eval · LLM',
    tech: ['Python', 'W&B', 'Claude'],
    mediaType: 'IMAGE',
    gradient: 'linear-gradient(160deg, #1c1a14, #251e10)',
    liveUrl: null,
    codeUrl: '#',
    paperUrl: null,
  },
  {
    id: 'semantic-search',
    num: '05',
    title: 'Semantic Search API',
    description: 'Embedding-based search over 50K+ docs. Sub-100ms via Voyage AI + pgvector.',
    category: 'Search · RAG',
    tech: ['Voyage AI', 'pgvector', 'Next.js'],
    mediaType: 'IMAGE',
    gradient: 'linear-gradient(160deg, #1a1810, #2a2418)',
    liveUrl: null,
    codeUrl: '#',
    paperUrl: null,
  },
  {
    id: 'ai-portfolio',
    num: '06',
    title: 'AI Portfolio Assistant',
    description: "This portfolio — Claude-powered RAG assistant, persona detection, adaptive UI.",
    category: 'Claude · Next.js',
    tech: ['Claude API', 'Supabase', 'Next.js'],
    mediaType: 'VIDEO',
    gradient: 'linear-gradient(160deg, #1c1810, #2e2414)',
    liveUrl: '#',
    codeUrl: '#',
    paperUrl: null,
  },
]
