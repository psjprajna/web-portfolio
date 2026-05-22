export const SECTION_MIN_LENGTH = 80

export interface ParsedReadmeSection {
  section: string
  content: string
}

export interface ProjectReadmeChunk {
  project_id: string
  section: string
  content: string
  display_order: number
}

const H2_REGEX = /^##\s+(.+?)\s*$/

export function parseReadme(markdown: string): ParsedReadmeSection[] {
  if (!markdown.trim()) return []

  const lines = markdown.split('\n')
  const sections: ParsedReadmeSection[] = []
  let currentHeading: string | null = null
  let currentBody: string[] = []

  const flush = (): void => {
    if (currentHeading === null) return
    const content = currentBody.join('\n').trim()
    if (content.length >= SECTION_MIN_LENGTH) {
      sections.push({ section: currentHeading, content })
    }
    currentHeading = null
    currentBody = []
  }

  for (const line of lines) {
    const match = H2_REGEX.exec(line)
    if (match && match[1]) {
      flush()
      currentHeading = match[1]
      continue
    }
    if (currentHeading !== null) {
      currentBody.push(line)
    }
  }
  flush()

  if (sections.length === 0) {
    const wholeBody = markdown.trim()
    if (wholeBody.length >= SECTION_MIN_LENGTH) {
      return [{ section: 'README', content: wholeBody }]
    }
  }

  return sections
}
