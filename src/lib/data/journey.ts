export type JourneyType = 'work' | 'edu'
export type JourneySide = 'left' | 'right'

export interface JourneyEntry {
  key: string
  // place: short form rendered in the desktop lineage timeline cards.
  // placeLong: full legal name rendered in iPad/mobile lineage cards AND in the desktop detail card.
  //   Education names ≥ 3 words use an embedded \n to break at the 2-word mark;
  //   .tl-place--long and .detail-place honor this via white-space: pre-line.
  place: string
  placeLong: string
  shortRole: string
  // role: title-only (no location decorator). Location lives in its own field.
  role: string
  // location: state-level place of work (e.g. "Virginia, USA", "Bengaluru, India", "Remote, USA").
  location: string
  type: JourneyType
  side: JourneySide
  logoText: string
  logoStyle: string
  logoSrc?: string
  date: string
  bullets: readonly [string, string, string]
}

export const JOURNEY_ENTRIES: readonly JourneyEntry[] = [
  {
    key: 'syneren',
    place: 'Syneren Tech',
    placeLong: 'Syneren Technology Corporation',
    shortRole: 'Software Engineer',
    role: 'Software Engineer',
    location: 'Virginia, USA',
    type: 'work',
    side: 'left',
    logoText: 'SY',
    logoStyle: 'background: linear-gradient(135deg, #1a2744, #0c6e6a); color: #e2e8f0;',
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
    placeLong: 'Scale AI',
    shortRole: 'Team Lead',
    role: 'RLHF Specialist & Team Lead',
    location: 'Remote, USA',
    type: 'work',
    side: 'right',
    logoText: 'SA',
    logoStyle: 'background: linear-gradient(135deg, #111, #2a2a2a);',
    logoSrc: '/logos/scale-ai.png',
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
    placeLong: 'George Mason\nUniversity',
    shortRole: 'MS Data Analytics',
    role: 'M.S. Data Analytics',
    location: 'Virginia, USA',
    type: 'edu',
    side: 'left',
    logoText: 'GM',
    logoStyle: 'background: linear-gradient(135deg, #006633, #f7c700); color: #fff;',
    logoSrc: '/logos/george-mason.png',
    date: 'Dec 2022',
    bullets: [
      'Graduate coursework in statistical learning, applied ML, and large-scale data engineering.',
      'Completed concurrently with the MITRE Corporation Data Engineer internship (Aug – Dec 2022).',
      'Specialised track in production-grade data systems and ML pipelines.',
    ],
  },
  {
    key: 'mitre',
    place: 'MITRE',
    placeLong: 'The MITRE Corporation',
    shortRole: 'Data Engineer Intern',
    role: 'Data Engineer Intern',
    location: 'Virginia, USA',
    type: 'work',
    side: 'right',
    logoText: 'MI',
    logoStyle: 'background: linear-gradient(135deg, #003366, #0073cf);',
    logoSrc: '/logos/mitre.svg',
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
    placeLong: 'Navigem Data',
    shortRole: 'ML Intern',
    role: 'Machine Learning Intern',
    location: 'Bengaluru, India',
    type: 'work',
    side: 'left',
    logoText: 'ND',
    logoStyle: 'background: linear-gradient(135deg, #0a4a6e, #06324a);',
    logoSrc: '/logos/navigem.png',
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
    placeLong: 'Nitte Meenakshi\nInstitute of Technology',
    shortRole: 'BE Computer Science',
    role: 'B.E. Computer Science',
    location: 'Bengaluru, India',
    type: 'edu',
    side: 'right',
    logoText: 'N',
    logoStyle: 'background: linear-gradient(135deg, #b71c1c, #7a0f0f); color: #fff;',
    logoSrc: '/logos/nmit.png',
    date: 'Aug 2020',
    bullets: [
      'Four-year undergraduate degree in Computer Science Engineering.',
      'Coursework in algorithms, data structures, applied ML, and software engineering.',
      'Final-year ML internship at Navigem Data ran concurrently (May – Dec 2020).',
    ],
  },
]
