import { describe, it, expect } from 'vitest'
import {
  parseReadme,
  SECTION_MIN_LENGTH,
} from '@/lib/data/project-readme-chunks'

describe('parseReadme', () => {
  it('splits markdown on H2 headings and keeps sections at or above SECTION_MIN_LENGTH', () => {
    const md = [
      '# UAE Government Policy RAG',
      '',
      'A production RAG system over UAE Labour Law, MOHRE rules, and Visa regulations.',
      '',
      '## Architecture',
      '',
      'Heading-aware PDF chunking pipeline feeds hybrid BM25 + dense retrieval on Azure AI Search with BGE cross-encoder reranking. RAGAS-evaluated, LangFuse-traced, deployed on Azure App Service in UAE North region.',
      '',
      '## Quickstart',
      '',
      'Clone, install, run.',
      '',
      '## Evaluation',
      '',
      'RAGAS faithfulness + context recall measured on a 50-question gold set; observed +20% context precision vs baseline retrieval. LangFuse traces every retrieval call for downstream debugging.',
      '',
    ].join('\n')

    const sections = parseReadme(md)

    expect(sections).toHaveLength(2)
    expect(sections.map((s) => s.section)).toEqual(['Architecture', 'Evaluation'])
    expect(sections[0]?.content.length).toBeGreaterThanOrEqual(SECTION_MIN_LENGTH)
    expect(sections[1]?.content.length).toBeGreaterThanOrEqual(SECTION_MIN_LENGTH)
  })

  it('falls back to a single "README" chunk when the markdown has no H2 headings', () => {
    const md = [
      '# Telecom Churn Prediction',
      '',
      'Gradient boosting classifier on the IBM Telco dataset with 4 engineered features and SHAP TreeExplainer identifying month-to-month contract as the top churn predictor. Deployed as FastAPI with opt-in SHAP explainability and 5-fold StratifiedKFold validation.',
      '',
    ].join('\n')

    const sections = parseReadme(md)

    expect(sections).toHaveLength(1)
    expect(sections[0]?.section).toBe('README')
    expect(sections[0]?.content.length).toBeGreaterThanOrEqual(SECTION_MIN_LENGTH)
  })

  it('returns an empty array when the markdown has no H2 headings and the body is below SECTION_MIN_LENGTH', () => {
    const md = '# Tiny\n\nToo short.\n'

    expect(parseReadme(md)).toEqual([])
  })

  it('preserves H3-and-deeper content inside the parent H2 section', () => {
    const md = [
      '## Architecture',
      '',
      'The pipeline has three layers, each described below.',
      '',
      '### Ingestion',
      '',
      'Documents are chunked using a heading-aware splitter that respects PDF outline structure.',
      '',
      '### Retrieval',
      '',
      'Hybrid BM25 + dense retrieval with optional cross-encoder reranking.',
      '',
    ].join('\n')

    const sections = parseReadme(md)

    expect(sections).toHaveLength(1)
    expect(sections[0]?.section).toBe('Architecture')
    expect(sections[0]?.content).toContain('### Ingestion')
    expect(sections[0]?.content).toContain('### Retrieval')
    expect(sections[0]?.content).toContain('cross-encoder reranking')
  })

  it('returns an empty array for empty or whitespace-only markdown', () => {
    expect(parseReadme('')).toEqual([])
    expect(parseReadme('   \n\n  \n')).toEqual([])
  })
})
