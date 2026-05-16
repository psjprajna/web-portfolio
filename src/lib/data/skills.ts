export type SkillDot = 'd-gold' | 'd-ink' | 'd-terra'

export type SkillIconName =
  | 'genai'
  | 'ml'
  | 'languages'
  | 'frameworks'
  | 'cloud'
  | 'data'

export interface Skill {
  num: string
  dot: SkillDot
  eyebrow: string
  title: string
  keywords: string
  iconName: SkillIconName
}

export const SKILLS: readonly Skill[] = [
  {
    num: '01',
    dot: 'd-gold',
    eyebrow: 'GenAI',
    title: 'GenAI / LLMs',
    keywords:
      'LLMs, RAG, SFT, RLHF, DPO, LangChain, LangGraph, Langfuse, RAGAS, FAISS, Pinecone, BGE Reranker, sentence-transformers, LoRA (PEFT), Claude API, AraBERT, spaCy, HITL',
    iconName: 'genai',
  },
  {
    num: '02',
    dot: 'd-ink',
    eyebrow: 'Core ML',
    title: 'ML / Deep Learning',
    keywords:
      'TensorFlow, Keras, TFLite, ResNet, MTCNN, OpenCV, Diffusion Models, XGBoost, CatBoost, SHAP',
    iconName: 'ml',
  },
  {
    num: '03',
    dot: 'd-terra',
    eyebrow: 'Code',
    title: 'Languages',
    keywords: 'Python, JavaScript, TypeScript, SQL, Bash, HTML / CSS',
    iconName: 'languages',
  },
  {
    num: '04',
    dot: 'd-ink',
    eyebrow: 'Frameworks',
    title: 'Frameworks',
    keywords: 'Next.js, React, Flask, FastAPI, Pydantic, Pandas, Prisma',
    iconName: 'frameworks',
  },
  {
    num: '05',
    dot: 'd-gold',
    eyebrow: 'Cloud',
    title: 'Cloud / DevOps',
    keywords:
      'AWS (CodePipeline, Elastic Beanstalk), Azure (OpenAI, AI Search, Container Apps), Docker, Linux cron, Airflow, MLflow',
    iconName: 'cloud',
  },
  {
    num: '06',
    dot: 'd-terra',
    eyebrow: 'Data',
    title: 'Data / BI',
    keywords: 'PostgreSQL, MySQL, Oracle, Power BI, Splunk',
    iconName: 'data',
  },
]
