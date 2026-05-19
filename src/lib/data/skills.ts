export type SkillDot = 'd-gold' | 'd-ink' | 'd-terra'

export type SkillIconName =
  | 'genai'
  | 'rag'
  | 'ml'
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
      'LLMs, SFT, RLHF, DPO, LangChain, LangGraph, LoRA (PEFT), Claude API, AraBERT, spaCy, HITL',
    iconName: 'genai',
  },
  {
    num: '02',
    dot: 'd-terra',
    eyebrow: 'Retrieval',
    title: 'Retrieval & RAG',
    keywords:
      'RAG, Langfuse, RAGAS, FAISS, Pinecone, BGE Reranker, sentence-transformers',
    iconName: 'rag',
  },
  {
    num: '03',
    dot: 'd-ink',
    eyebrow: 'Core ML',
    title: 'ML / Deep Learning',
    keywords:
      'TensorFlow, Keras, TFLite, ResNet, MTCNN, OpenCV, Diffusion Models, XGBoost, CatBoost, SHAP',
    iconName: 'ml',
  },
  {
    num: '04',
    dot: 'd-ink',
    eyebrow: 'Stack',
    title: 'Languages & Frameworks',
    keywords:
      'Python, JavaScript, TypeScript, HTML / CSS, Next.js, React, Flask, FastAPI, Pydantic, Pandas, Prisma',
    iconName: 'frameworks',
  },
  {
    num: '05',
    dot: 'd-gold',
    eyebrow: 'Cloud',
    title: 'Cloud & Infra',
    keywords:
      'AWS (CodePipeline, Elastic Beanstalk), Azure (OpenAI, AI Search, Container Apps), Docker, Linux cron, Airflow, MLflow, Bash',
    iconName: 'cloud',
  },
  {
    num: '06',
    dot: 'd-terra',
    eyebrow: 'Data',
    title: 'Data / BI',
    keywords: 'PostgreSQL, MySQL, Oracle, SQL, Power BI, Splunk',
    iconName: 'data',
  },
]
