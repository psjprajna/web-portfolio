import { PROJECTS, type Project } from './projects'

export type ProjectSeedStatus = 'published' | 'featured'

export interface ProjectSeed {
  display_name: string
  description: string
  tech_stack: readonly string[]
  github_repo: string
  status: ProjectSeedStatus
  source: 'manual'
  featured_order: number
  body_md: string
}

const TECH_STACK_BY_NUM: Record<string, readonly string[]> = {
  '01': ['Azure AI Search', 'BGE Reranker', 'RAGAS', 'LangFuse', 'Azure App Service'],
  '02': ['AraBERT', 'LoRA', 'FastAPI', 'Azure Container Apps', 'PSI Drift Monitoring'],
  '03': ['Claude API', 'Multi-Agent', 'Supabase', 'Stripe', 'Clerk'],
  '04': ['Gradient Boosting', 'SHAP', 'FastAPI', 'StratifiedKFold'],
}

function composeBodyMd(project: Project, techStack: readonly string[]): string {
  return [
    project.title,
    '',
    project.description,
    '',
    `Tech stack: ${techStack.join(', ')}.`,
    `Architecture: ${project.metaArchitecture.value}.`,
    `Impact: ${project.metaImpact.value}.`,
  ].join('\n')
}

function toSeed(project: Project): ProjectSeed {
  const techStack = TECH_STACK_BY_NUM[project.num]
  if (!techStack) {
    throw new Error(`Missing tech_stack for project ${project.num} (${project.title})`)
  }
  if (!project.githubUrl) {
    throw new Error(`Missing githubUrl for project ${project.num} (${project.title})`)
  }
  return {
    display_name: project.title,
    description: project.description,
    tech_stack: techStack,
    github_repo: project.githubUrl,
    status: 'published',
    source: 'manual',
    featured_order: Number(project.num),
    body_md: composeBodyMd(project, techStack),
  }
}

export const PROJECT_SEEDS: readonly ProjectSeed[] = PROJECTS.map(toSeed)
