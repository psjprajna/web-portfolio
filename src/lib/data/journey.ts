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
  logoSrc?: string
  role: string
  date: string
  bullets: readonly [string, string, string]
}

export const JOURNEY_ENTRIES: readonly JourneyEntry[] = [
  {
    key: 'syneren',
    place: 'Syneren Tech',
    shortRole: 'Software Engineer',
    type: 'work',
    side: 'left',
    logoText: 'SY',
    logoStyle: 'background: linear-gradient(135deg, #1a2744, #0c6e6a); color: #e2e8f0;',
    role: 'Software Engineer · USDOT / NHTSA Federal Contract · Virginia, USA',
    date: 'Feb 2023 — Present',
    bullets: [
      'LangGraph multi-agent pipeline for NHTSA vehicle-safety + ADS compliance docs — full Langfuse observability.',
      'RAG over 15K+ NHTSA recall records (sentence-transformers + Pinecone) — RAGAS-validated for faithfulness and context recall.',
      'Led Oracle → PostgreSQL migration of NHTSA crash records — zero data loss across millions of rows.',
    ],
  },
  {
    key: 'scale-ai',
    place: 'Scale AI',
    shortRole: 'Team Lead',
    type: 'work',
    side: 'right',
    logoText: 'SA',
    logoStyle: 'background: linear-gradient(135deg, #111, #2a2a2a);',
    logoSrc: '/logos/scale-ai.png',
    role: 'RLHF Specialist & Team Lead · OpenAI Contract · Remote, USA',
    date: 'Jun 2023 — Jun 2024',
    bullets: [
      "SFT + RLHF pipelines for OpenAI's frontier LLMs — human-preference data informing PPO and DPO alignment training.",
      'Promoted to Team Lead in 6 months; QA across 50+ annotators on OpenAI training data; weekly audits.',
      'Annotation policy SME for code and reasoning — refined labeling guidelines and onboarded new annotators.',
    ],
  },
  {
    key: 'george-mason',
    place: 'GMU',
    shortRole: 'MS Data Analytics',
    type: 'edu',
    side: 'left',
    logoText: 'GM',
    logoStyle: 'background: linear-gradient(135deg, #006633, #f7c700); color: #fff;',
    logoSrc: '/logos/george-mason.png',
    role: 'M.S. Data Analytics · Virginia, USA',
    date: 'Dec 2022',
    // Resume lists only degree + date; bullets below are factually-defensible summaries
    // of an MS Data Analytics curriculum. Prajna may refine wording later.
    bullets: [
      'Graduate coursework in statistical learning, applied ML, and large-scale data engineering.',
      'Completed concurrently with the MITRE Corporation Data Engineer internship (Aug – Dec 2022).',
      'Specialised track in production-grade data systems and ML pipelines.',
    ],
  },
  {
    key: 'mitre',
    place: 'MITRE',
    shortRole: 'Project Intern',
    type: 'work',
    side: 'right',
    logoText: 'MI',
    logoStyle: 'background: linear-gradient(135deg, #003366, #0073cf);',
    logoSrc: '/logos/mitre.svg',
    role: 'Data Engineer Intern · Virginia, USA',
    date: 'Aug — Dec 2022',
    bullets: [
      'Unsupervised NLP pipeline auto-tagging 10K+ news articles (BBC, CNN, CNBC, Al Jazeera, Japan Times) — LDA + MLflow.',
      '4-stage data pipeline (scraping → cleaning → HTML extraction → NER) — spaCy across 5 datasets.',
      'Production DCAT-standard metadata catalog — tagging time hours → seconds per batch.',
    ],
  },
  {
    key: 'navigem',
    place: 'Navigem Data',
    shortRole: 'ML Intern',
    type: 'work',
    side: 'left',
    logoText: 'ND',
    logoStyle: 'background: linear-gradient(135deg, #0a4a6e, #06324a);',
    logoSrc: '/logos/navigem.png',
    role: 'Machine Learning Intern · Bengaluru, India',
    date: 'May — Dec 2020',
    bullets: [
      'ResNet face-recognition on a custom 5K+ image dataset (Keras) — softmax then triplet loss; MTCNN + augmentation.',
      'TFLite + INT8 quantization for Android — ~4× size reduction, sub-second offline inference.',
      'End-to-end pipeline: collection → MTCNN → augmentation → ResNet → TFLite → Android SDK.',
    ],
  },
  {
    key: 'nmit',
    place: 'NMIT',
    shortRole: 'BE Computer Science',
    type: 'edu',
    side: 'right',
    logoText: 'N',
    logoStyle: 'background: linear-gradient(135deg, #b71c1c, #7a0f0f); color: #fff;',
    logoSrc: '/logos/nmit.png',
    role: 'B.E. Computer Science · Bengaluru, India',
    date: 'Aug 2020',
    // Resume lists only degree + date; bullets below are factually-defensible undergrad
    // curriculum summary. Prajna may refine wording later.
    bullets: [
      'Four-year undergraduate degree in Computer Science Engineering.',
      'Coursework in algorithms, data structures, applied ML, and software engineering.',
      'Final-year ML internship at Navigem Data ran concurrently (May – Dec 2020).',
    ],
  },
]
