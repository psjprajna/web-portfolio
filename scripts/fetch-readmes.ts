import { PROJECTS } from '@/lib/data/projects'
import {
  parseReadme,
  type ProjectReadmeChunk,
} from '@/lib/data/project-readme-chunks'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

interface OwnerRepo {
  owner: string
  repo: string
}

function parseOwnerRepo(githubUrl: string): OwnerRepo | null {
  const match = githubUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/?#]+?)\/?$/)
  if (!match) return null
  const [, owner, repo] = match
  if (!owner || !repo) return null
  return { owner, repo }
}

async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  for (const branch of ['main', 'master']) {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`
    const res = await fetch(url)
    if (res.ok) return res.text()
  }
  return null
}

async function fetchProjectIdsByDisplayName(): Promise<Map<string, string>> {
  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('projects')
    .select('id, display_name')
  if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
  const idByName = new Map<string, string>()
  for (const row of data ?? []) {
    if (row.display_name) idByName.set(row.display_name, row.id)
  }
  return idByName
}

export async function fetchAllProjectReadmeChunks(): Promise<ProjectReadmeChunk[]> {
  const idByName = await fetchProjectIdsByDisplayName()
  const chunks: ProjectReadmeChunk[] = []

  for (const project of PROJECTS) {
    if (!project.githubUrl) {
      process.stderr.write(`[skip] ${project.title}: no githubUrl\n`)
      continue
    }
    const projectId = idByName.get(project.title)
    if (!projectId) {
      process.stderr.write(`[skip] ${project.title}: not in projects table\n`)
      continue
    }
    const ownerRepo = parseOwnerRepo(project.githubUrl)
    if (!ownerRepo) {
      process.stderr.write(`[skip] ${project.title}: cannot parse owner/repo from ${project.githubUrl}\n`)
      continue
    }

    const markdown = await fetchReadme(ownerRepo.owner, ownerRepo.repo)
    if (!markdown) {
      process.stderr.write(`[skip] ${project.title}: README.md not found at main or master branch\n`)
      continue
    }

    const sections = parseReadme(markdown)
    if (sections.length === 0) {
      process.stderr.write(`[skip] ${project.title}: README has no sections meeting min-length threshold\n`)
      continue
    }

    sections.forEach((section, i) => {
      chunks.push({
        project_id: projectId,
        section: section.section,
        content: section.content,
        display_order: i + 1,
      })
    })

    process.stderr.write(`[ok]   ${project.title}: ${sections.length} sections\n`)
  }

  return chunks
}
