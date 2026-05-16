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
    place: 'Syneren Technology',
    shortRole: 'Software Engineer',
    type: 'work',
    side: 'left',
    logoText: 'SY',
    logoStyle: 'background: linear-gradient(135deg, #1a2744, #0c6e6a); color: #e2e8f0;',
    role: 'Software Engineer · USDOT / NHTSA Federal Contract · Virginia, USA',
    date: 'Feb 2023 — Present',
    bullets: [
      'Built LangGraph multi-agent pipeline for NHTSA vehicle-safety and ADS compliance document processing — agents handle ingestion, entity extraction, and report generation, with full Langfuse observability across decision steps.',
      'Engineered RAG pipeline over 15K+ NHTSA recall records using sentence-transformers and Pinecone — validated with RAGAS for faithfulness and context recall; end-to-end Langfuse tracing.',
      'Led Oracle → PostgreSQL migration of NHTSA crash and incident records with automated ETL validation — zero data loss across millions of records, restructured to support downstream ML analytics.',
    ],
  },
  {
    key: 'scale-ai',
    place: 'Scale AI',
    shortRole: 'RLHF Lead (OpenAI)',
    type: 'work',
    side: 'right',
    logoText: 'SA',
    logoStyle: 'background: linear-gradient(135deg, #111, #2a2a2a);',
    logoSrc: '/logos/scale-ai.png',
    role: 'RLHF Specialist & Team Lead · OpenAI Contract · Remote, USA',
    date: 'Jun 2023 — Jun 2024',
    bullets: [
      "Contributed to SFT and RLHF pipelines for OpenAI's frontier LLMs — evaluated code outputs for correctness and reasoning, providing human-preference data that informed PPO and DPO alignment training.",
      'Promoted to Team Lead within 6 months; oversaw quality assurance across 50+ annotators on OpenAI training data, ran weekly audits, maintained dataset quality critical to model alignment.',
      'Served as annotation policy SME for code and reasoning tasks — refined labeling guidelines with PMs, resolved task ambiguities, onboarded new annotators as the team scaled.',
    ],
  },
  {
    key: 'george-mason',
    place: 'George Mason University',
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
      'Graduate coursework in statistical learning, applied machine learning, and large-scale data engineering.',
      'Completed concurrently with The MITRE Corporation Data Engineer internship (Aug – Dec 2022).',
      'Specialised track in production-grade data systems and ML pipelines for federal and enterprise use.',
    ],
  },
  {
    key: 'mitre',
    place: 'The MITRE Corporation',
    shortRole: 'Data Engineer Intern',
    type: 'work',
    side: 'right',
    logoText: 'MI',
    logoStyle: 'background: linear-gradient(135deg, #003366, #0073cf);',
    logoSrc: '/logos/mitre.svg',
    role: 'Data Engineer Intern · Virginia, USA',
    date: 'Aug — Dec 2022',
    bullets: [
      'Built unsupervised NLP pipeline auto-tagging 10K+ news articles across 5 sources (BBC, CNN, CNBC, Al Jazeera, Japan Times) — LDA topic modeling (Gensim + Mallet) tuned via coherence score in MLflow.',
      'Engineered 4-stage data pipeline (scraping → cleaning → HTML extraction → NER) — spaCy NER extracted persons, organisations, and locations as structured admin tags across 5 datasets.',
      'Delivered production-ready DCAT-standard metadata catalog replacing manual MITRE tagging workflows — reduced tagging time from hours to seconds per article batch.',
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
      'Designed and trained a ResNet-based face recognition model on a custom 5K+ image dataset (Keras) — pre-trained with softmax then fine-tuned with triplet loss; MTCNN face detection plus augmentation for limited-data robustness.',
      'Optimised model for on-device Android via TensorFlow Lite + INT8 quantization — ~4× size reduction with minimal accuracy loss; sub-second offline inference with zero server dependency.',
      'Built end-to-end ML pipeline: image collection → MTCNN preprocessing → augmentation → ResNet training → TFLite export → Android SDK integration; versioned artifacts and tracked runs for reproducibility.',
    ],
  },
  {
    key: 'nmit',
    place: 'Nitte Meenakshi IT',
    shortRole: 'B.E. Computer Science',
    type: 'edu',
    side: 'right',
    logoText: 'NM',
    logoStyle: 'background: linear-gradient(135deg, #b71c1c, #7a0f0f); color: #fff;',
    logoSrc: '/logos/nitte-meenakshi.svg',
    role: 'B.E. Computer Science · Bengaluru, India',
    date: 'Aug 2020',
    // Resume lists only degree + date; bullets below are factually-defensible undergrad
    // curriculum summary. Prajna may refine wording later.
    bullets: [
      'Four-year undergraduate degree in Computer Science Engineering.',
      'Coursework spanned algorithms, data structures, applied machine learning, and software engineering.',
      'Final-year ML internship at Navigem Data ran concurrently with the degree (May – Dec 2020).',
    ],
  },
]
