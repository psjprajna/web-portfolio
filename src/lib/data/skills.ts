// All `translations.ar` fields are machine-authored best-effort. Native-speaker
// review required pre-launch — see Slice 5.4c handoff. Technical proper nouns
// inside `keywords` (LLMs, SFT, RLHF, LangChain, FastAPI, PostgreSQL, etc.)
// stay Latin in all locales. `eyebrow` and `title` get Arabic equivalents where
// a clear translation exists; acronyms ("GenAI") and brand-like terms ("RAG")
// stay Latin within the otherwise-translated title prose.

export type SkillDot = 'd-gold' | 'd-ink' | 'd-terra'

export type SkillIconName =
  | 'genai'
  | 'rag'
  | 'ml'
  | 'frameworks'
  | 'cloud'
  | 'data'

export interface SkillAr {
  eyebrow?: string
  title?: string
}

export interface Skill {
  num: string
  dot: SkillDot
  eyebrow: string
  title: string
  keywords: string
  iconName: SkillIconName
  translations?: { ar?: SkillAr }
}

export const SKILLS: readonly Skill[] = [
  {
    num: '01',
    dot: 'd-gold',
    eyebrow: 'GenAI',
    title: 'GenAI / LLMs',
    keywords:
      'LLMs, SFT, RLHF, DPO, LangChain, LangGraph, LoRA (PEFT), Claude API, AraBERT, spaCy, HITL',
    iconName: 'genai',
    translations: {
      ar: {
        eyebrow: 'GenAI',
        title: 'GenAI / نماذج لغوية كبيرة',
      },
    },
  },
  {
    num: '02',
    dot: 'd-terra',
    eyebrow: 'Retrieval',
    title: 'Retrieval & RAG',
    keywords:
      'RAG, Langfuse, RAGAS, FAISS, Pinecone, BGE Reranker, sentence-transformers',
    iconName: 'rag',
    translations: {
      ar: {
        eyebrow: 'الاسترجاع',
        title: 'الاسترجاع وRAG',
      },
    },
  },
  {
    num: '03',
    dot: 'd-ink',
    eyebrow: 'Core ML',
    title: 'ML / Deep Learning',
    keywords:
      'TensorFlow, Keras, TFLite, ResNet, MTCNN, OpenCV, Diffusion Models, XGBoost, CatBoost, SHAP',
    iconName: 'ml',
    translations: {
      ar: {
        eyebrow: 'تعلم آلي',
        title: 'تعلم آلي / تعلم عميق',
      },
    },
  },
  {
    num: '04',
    dot: 'd-ink',
    eyebrow: 'Stack',
    title: 'Languages & Frameworks',
    keywords:
      'Python, JavaScript, TypeScript, HTML / CSS, Next.js, React, Flask, FastAPI, Pydantic, Pandas, Prisma',
    iconName: 'frameworks',
    translations: {
      ar: {
        eyebrow: 'الحزم',
        title: 'اللغات والأطر',
      },
    },
  },
  {
    num: '05',
    dot: 'd-gold',
    eyebrow: 'Cloud',
    title: 'Cloud & Infra',
    keywords:
      'AWS (CodePipeline, Elastic Beanstalk), Azure (OpenAI, AI Search, Container Apps), Docker, Linux cron, Airflow, MLflow, Bash',
    iconName: 'cloud',
    translations: {
      ar: {
        eyebrow: 'السحابة',
        title: 'السحابة والبنية التحتية',
      },
    },
  },
  {
    num: '06',
    dot: 'd-terra',
    eyebrow: 'Data',
    title: 'Data / BI',
    keywords: 'PostgreSQL, MySQL, Oracle, SQL, Power BI, Splunk',
    iconName: 'data',
    translations: {
      ar: {
        eyebrow: 'البيانات',
        title: 'البيانات / ذكاء الأعمال',
      },
    },
  },
]

export function localizeSkill(skill: Skill, locale: string): Skill {
  if (locale === 'ar' && skill.translations?.ar) {
    return { ...skill, ...skill.translations.ar }
  }
  return skill
}
