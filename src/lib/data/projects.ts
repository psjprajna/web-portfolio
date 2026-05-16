export type ProjectStatus =
  | { kind: 'live'; label: string }
  | { kind: 'internal'; label: string }
  | { kind: 'closed'; label: string }
  | { kind: 'plain'; label: string }

export interface ProjectMetaItem {
  label: string
  value: string
  accent?: boolean
}

export interface Project {
  num: string
  title: string
  description: string
  status: ProjectStatus
  thumbIcon: string
  metaArchitecture: ProjectMetaItem
  metaImpact: ProjectMetaItem
  githubUrl: string
  specUrl: string
}

export const PROJECTS: readonly Project[] = [
  {
    num: '01',
    title: 'Artemis Financial Copilot',
    description:
      'An autonomous LLM agent that synthesizes real-time market data, client history, and regulatory documents to generate personalized investment briefs for financial advisors.',
    status: { kind: 'live', label: 'Closed Beta' },
    thumbIcon: 'play_circle',
    metaArchitecture: { label: 'Architecture', value: 'LLM Agent / FinTech' },
    metaImpact: { label: 'Impact', value: '50k+ daily queries', accent: true },
    githubUrl: '#',
    specUrl: '#',
  },
  {
    num: '02',
    title: 'MedParse Intelligence',
    description:
      'A HIPAA-compliant RAG pipeline that extracts and summarizes critical patient timelines from unstructured clinical notes with 99.2% entity extraction precision.',
    status: { kind: 'internal', label: 'Select Access' },
    thumbIcon: 'image',
    metaArchitecture: { label: 'Architecture', value: 'RAG System / Health' },
    metaImpact: { label: 'Precision', value: '99.2% entity ext.', accent: true },
    githubUrl: '#',
    specUrl: '#',
  },
  {
    num: '03',
    title: 'Lexicon Base Model',
    description:
      'Fine-tuned a 7B parameter open-source model on a proprietary corpus of case law to create a specialized drafting assistant for junior legal associates, reducing draft time by 40%.',
    status: { kind: 'plain', label: 'v1.4 / Active' },
    thumbIcon: 'play_circle',
    metaArchitecture: { label: 'Architecture', value: 'Fine-Tuning / Legal' },
    metaImpact: { label: 'Efficiency', value: '−40% draft time', accent: true },
    githubUrl: '#',
    specUrl: '#',
  },
  {
    num: '04',
    title: 'Omni-Router Framework',
    description:
      'A dynamic routing framework that evaluates prompts and automatically directs them to the most cost-effective and capable model API, cutting infrastructure costs by 35%.',
    status: { kind: 'closed', label: 'Internal Only' },
    thumbIcon: 'play_circle',
    metaArchitecture: { label: 'Architecture', value: 'Automation / Int. Tool' },
    metaImpact: { label: 'Optimization', value: '−35% API costs', accent: true },
    githubUrl: '#',
    specUrl: '#',
  },
]
