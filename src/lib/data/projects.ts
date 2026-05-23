// All `translations.ar` fields are machine-authored best-effort. Native-speaker
// review required pre-launch — see Slice 5.4c handoff. Proper nouns (project
// titles: "UAE Government Policy RAG" / "Arabic Sentiment Analysis" / "AI Job
// Application Agent" / "Telecom Churn Prediction") and technical/library names
// (Azure AI Search, AraBERT, LoRA, FastAPI, Stripe, Clerk, Supabase, etc.)
// deliberately stay Latin in all locales.

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

export interface ProjectAr {
  description?: string
  status?: { label?: string }
  metaArchitecture?: Partial<ProjectMetaItem>
  metaImpact?: Partial<ProjectMetaItem>
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
  translations?: { ar?: ProjectAr }
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
    translations: {
      ar: {
        description:
          'RAG إنتاجي على قانون العمل الإماراتي ولوائح MOHRE والتأشيرات — تقسيم PDF واعٍ بالعناوين، استرجاع هجين BM25 + كثيف على Azure AI Search مع إعادة ترتيب عبر BGE cross-encoder. مُقيَّم بـRAGAS، مُتعقَّب بـLangFuse، منشور على Azure App Service (UAE North).',
        status: { label: 'قيد التنفيذ' },
        metaArchitecture: { label: 'البنية' },
        metaImpact: { label: 'الأثر', value: '+٢٠٪ دقة السياق' },
      },
    },
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
    translations: {
      ar: {
        description:
          'ضبط دقيق لـAraBERT على بيانات المشاعر العربية الإماراتية (معيار HARD) باستخدام LoRA — تفوَّق على خط أساس CatBoost TF-IDF بنسبة ١٨٪ في F1 على اللهجات العربية الخليجية. منشور كـFastAPI على Azure Container Apps مع مراقبة انحراف المفردات المبنية على PSI.',
        status: { label: 'قيد التنفيذ' },
        metaArchitecture: { label: 'البنية' },
        metaImpact: { label: 'الأثر', value: '+١٨٪ F1 (العربية الخليجية)' },
      },
    },
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
    translations: {
      ar: {
        description:
          'منصة SaaS كاملة الحزم تؤتمت البحث عن الوظائف عبر خط أنابيب من ٥ وكلاء Claude — Resume Parser، وJob Ranker (درجة ملاءمة ٠–١٠٠)، وATS Content Generator، وCover Letter Writer، وInterview Prep بإجابات بصيغة STAR. فوترة Stripe، ومصادقة Clerk، وخلفية Supabase.',
        status: { label: 'v1.0 نشط' },
        metaArchitecture: { label: 'البنية' },
        metaImpact: { label: 'الأثر', value: 'خط أنابيب ٥ وكلاء' },
      },
    },
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
    translations: {
      ar: {
        description:
          'مُصنِّف Gradient Boosting على مجموعة بيانات IBM Telco (٧ آلاف صف، معدل تسرب ٢٦٪) — ٤ ميزات مُهَنْدَسة، AUC-ROC تساوي ٠٫٨٥ عبر StratifiedKFold ٥-طية، وSHAP TreeExplainer يحدد عقود الشهرية كأقوى مؤشر تسرب. منشور كـFastAPI مع تفسير SHAP اختياري.',
        status: { label: 'مباشر' },
        metaArchitecture: { label: 'البنية' },
        metaImpact: { label: 'الأثر', value: 'AUC-ROC ٠٫٨٥' },
      },
    },
  },
]

export function localizeProject(project: Project, locale: string): Project {
  if (locale !== 'ar' || !project.translations?.ar) return project
  const ar = project.translations.ar
  return {
    ...project,
    description: ar.description ?? project.description,
    status: { ...project.status, ...ar.status } as ProjectStatus,
    metaArchitecture: { ...project.metaArchitecture, ...ar.metaArchitecture },
    metaImpact: { ...project.metaImpact, ...ar.metaImpact },
  }
}
