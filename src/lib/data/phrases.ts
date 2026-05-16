export const HERO_PHRASES = [
  'RAG pipelines',
  'NLP classifiers',
  'LLM agents',
  'fine-tuned models',
] as const

export type HeroPhrase = (typeof HERO_PHRASES)[number]
