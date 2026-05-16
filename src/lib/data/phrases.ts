export const HERO_PHRASES = [
  'RAG pipelines',
  'multi-agent systems',
  'RLHF datasets',
  'production ML',
] as const

export type HeroPhrase = (typeof HERO_PHRASES)[number]
