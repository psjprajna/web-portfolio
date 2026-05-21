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
  githubUrl?: string
  specUrl?: string
}

export const PROJECTS: readonly Project[] = [
  {
    num: '01',
    title: 'UAE Government Policy RAG',
    description:
      'Production RAG over UAE Labour Law, MOHRE, and Visa regulations — heading-aware PDF chunking, hybrid BM25 + dense retrieval on Azure AI Search with BGE cross-encoder reranking. RAGAS-evaluated, LangFuse-traced, deployed on Azure App Service (UAE North).',
    status: { kind: 'live', label: 'In Progress' },
    thumbIcon: 'play_circle',
    metaArchitecture: { label: 'Architecture', value: 'RAG / Azure AI Search' },
    metaImpact: { label: 'Impact', value: '+20% context precision', accent: true },
    githubUrl: 'https://github.com/psjprajna/UAE-Government-Policy-RAG',
  },
  {
    num: '02',
    title: 'Arabic Sentiment Analysis',
    description:
      'Fine-tuned AraBERT on UAE Arabic sentiment data (HARD benchmark) using LoRA — outperformed CatBoost TF-IDF baseline by 18% F1 on Gulf Arabic dialects. Deployed as FastAPI on Azure Container Apps with PSI-based vocabulary drift monitoring.',
    status: { kind: 'internal', label: 'In Progress' },
    thumbIcon: 'image',
    metaArchitecture: { label: 'Architecture', value: 'Fine-Tuning / AraBERT + LoRA' },
    metaImpact: { label: 'Impact', value: '+18% F1 (Gulf Arabic)', accent: true },
    githubUrl: 'https://github.com/psjprajna/arabic-sentiment-mlops/',
  },
  {
    num: '03',
    title: 'AI Job Application Agent',
    description:
      'Full-stack SaaS automating job search via a 5-agent Claude pipeline — Resume Parser, Job Ranker (0–100 fit score), ATS Content Generator, Cover Letter Writer, and Interview Prep with STAR-format answers. Stripe billing, Clerk auth, Supabase backend.',
    status: { kind: 'live', label: 'v1.0 Active' },
    thumbIcon: 'play_circle',
    metaArchitecture: { label: 'Architecture', value: 'Multi-Agent / Claude API' },
    metaImpact: { label: 'Impact', value: '5-agent pipeline', accent: true },
    githubUrl: 'https://github.com/psjprajna/AI-Job-Application-Agent',
  },
  {
    num: '04',
    title: 'Telecom Churn Prediction',
    description:
      'Gradient boosting classifier on the IBM Telco dataset (7K rows, 26% churn) — 4 engineered features, 0.85 AUC-ROC across 5-fold StratifiedKFold, SHAP TreeExplainer identifying month-to-month contract as the top churn predictor. Deployed as FastAPI with opt-in SHAP explainability.',
    status: { kind: 'plain', label: 'Live' },
    thumbIcon: 'play_circle',
    metaArchitecture: { label: 'Architecture', value: 'Gradient Boosting + SHAP' },
    metaImpact: { label: 'Impact', value: '0.85 AUC-ROC', accent: true },
    githubUrl: 'https://github.com/psjprajna/Telecom_Customer_Churn_Prediction',
  },
]
