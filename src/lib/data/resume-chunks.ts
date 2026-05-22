import { JOURNEY_ENTRIES, type JourneyEntry } from './journey'

export type ResumeChunkType = 'experience' | 'education'

export interface ResumeChunk {
  chunk_type: ResumeChunkType
  title: string
  organization: string
  date_range: string
  tech_stack: readonly string[]
  display_order: number
  content: string
}

function buildContent(entry: JourneyEntry, organization: string): string {
  const header = `${entry.role} at ${organization} (${entry.date}, ${entry.location})`
  const bullets = entry.bullets
    .filter((b): b is string => typeof b === 'string' && b.length > 0)
    .map((b) => `- ${b}`)
    .join('\n')
  return bullets ? `${header}\n${bullets}` : header
}

function toChunk(
  entry: JourneyEntry,
  chunk_type: ResumeChunkType,
  display_order: number,
): ResumeChunk {
  const organization = entry.placeLong.replace(/\n/g, ' ')
  return {
    chunk_type,
    title: entry.role,
    organization,
    date_range: entry.date,
    tech_stack: [] as readonly string[],
    display_order,
    content: buildContent(entry, organization),
  }
}

const experienceChunks: readonly ResumeChunk[] = JOURNEY_ENTRIES
  .filter((e) => e.type === 'work')
  .map((entry, i) => toChunk(entry, 'experience', i + 1))

const educationChunks: readonly ResumeChunk[] = JOURNEY_ENTRIES
  .filter((e) => e.type === 'edu')
  .map((entry, i) => toChunk(entry, 'education', i + 1))

export const RESUME_CHUNKS: readonly ResumeChunk[] = [
  ...experienceChunks,
  ...educationChunks,
]
