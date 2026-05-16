export type JourneyType = 'work' | 'edu'
export type JourneySide = 'left' | 'right'

export interface JourneyEntry {
  key: string
  place: string
  shortRole: string
  type: JourneyType
  side: JourneySide
  logoText: string
  logoStyle: string
  role: string
  date: string
  bullets: readonly [string, string, string]
}

export const JOURNEY_ENTRIES: readonly JourneyEntry[] = [
  {
    key: 'presight',
    place: 'Presight AI',
    shortRole: 'AI Engineer',
    type: 'work',
    side: 'left',
    logoText: 'PA',
    logoStyle: 'background: linear-gradient(135deg, #2a2420, #4a3830);',
    role: 'AI Engineer · Abu Dhabi',
    date: '2023 — Present',
    bullets: [
      'Built and deployed RAG pipelines for Arabic + English document intelligence at scale.',
      'Fine-tuned LLMs on domain-specific corpora — 23% accuracy lift over baseline.',
      'Designed streaming API layer serving 10k+ daily real-time queries.',
    ],
  },
  {
    key: 'g42',
    place: 'G42 Healthcare',
    shortRole: 'ML Engineer',
    type: 'work',
    side: 'right',
    logoText: 'G4',
    logoStyle: 'background: linear-gradient(135deg, #b07a1a, #8a5e10);',
    role: 'ML Engineer · Abu Dhabi',
    date: '2021 — 2023',
    bullets: [
      'Developed NLP classifiers for clinical notes across 6 UAE hospital networks.',
      'Led model evaluation framework — reduced false-positive rate by 18% in production.',
      'Built NABIDH-compliant data pipelines for federated health data ingestion.',
    ],
  },
  {
    key: 'oxford',
    place: 'Oxford — Online',
    shortRole: 'Postgrad ML',
    type: 'edu',
    side: 'left',
    logoText: 'OX',
    logoStyle: 'background: linear-gradient(135deg, #1e2840, #141c30); color: #c8b896;',
    role: 'Postgrad ML · Remote',
    date: '2022 · Distinction',
    bullets: [
      'Advanced coursework in Bayesian inference, probabilistic graphical models, deep learning.',
      'Capstone: multi-modal retrieval system for scientific literature using dense embeddings.',
      'Completed alongside full-time ML role at G42 Healthcare.',
    ],
  },
  {
    key: 'noon',
    place: 'Noon.com',
    shortRole: 'Data Scientist',
    type: 'work',
    side: 'right',
    logoText: 'N',
    logoStyle: 'background: linear-gradient(135deg, #1a2e3a, #0d1e28);',
    role: 'Data Scientist · Dubai',
    date: '2020 — 2021',
    bullets: [
      'Built recommendation engine serving 5M+ users across the MENA e-commerce platform.',
      'Reduced cart abandonment 11% via intent-prediction model deployed at the edge.',
      'Created A/B testing framework with statistical-significance tooling for product teams.',
    ],
  },
  // TODO: replace with real 4th work entry (placeholder per STATUS.md follow-up)
  {
    key: 'acme',
    place: 'Acme Labs',
    shortRole: 'ML Intern',
    type: 'work',
    side: 'left',
    logoText: 'AL',
    logoStyle: 'background: linear-gradient(135deg, #3a3a3a, #2a2a2a);',
    role: 'ML Intern · (placeholder)',
    date: '2019 — Placeholder',
    bullets: [
      'Placeholder — describe the project, problem domain, or key responsibility.',
      'Placeholder — measurable outcome (latency, accuracy, scale, etc.).',
      'Placeholder — technologies or processes used.',
    ],
  },
  {
    key: 'manipal',
    place: 'Manipal University',
    shortRole: 'B.Tech, Computer Science',
    type: 'edu',
    side: 'right',
    logoText: 'MU',
    logoStyle: 'background: linear-gradient(135deg, #d4c9a8, #c0b090); color: #2a2420;',
    role: 'B.Tech, Computer Science · Dubai',
    date: '2016 — 2020 · First Class',
    bullets: [
      'Specialized in Artificial Intelligence and Machine Learning in the final year.',
      'Thesis: "Attention-based architectures for Arabic sentiment classification."',
      'VP, CS Society — organised 3 inter-university hackathons in the UAE.',
    ],
  },
]
