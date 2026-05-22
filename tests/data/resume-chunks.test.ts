import { describe, it, expect } from 'vitest'
import { RESUME_CHUNKS } from '@/lib/data/resume-chunks'

describe('RESUME_CHUNKS', () => {
  it('contains 6 chunks — 4 experience + 2 education', () => {
    expect(RESUME_CHUNKS).toHaveLength(6)
    const counts = RESUME_CHUNKS.reduce<Record<string, number>>((acc, c) => {
      acc[c.chunk_type] = (acc[c.chunk_type] ?? 0) + 1
      return acc
    }, {})
    expect(counts).toEqual({ experience: 4, education: 2 })
  })

  it('chunk_type values are confined to experience|education', () => {
    for (const chunk of RESUME_CHUNKS) {
      expect(['experience', 'education']).toContain(chunk.chunk_type)
    }
  })

  it('(chunk_type, display_order) pairs are unique', () => {
    const pairs = RESUME_CHUNKS.map((c) => `${c.chunk_type}::${c.display_order}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })

  it('every chunk has populated title, organization, date_range, and content > 30 chars', () => {
    for (const chunk of RESUME_CHUNKS) {
      expect(chunk.title.length).toBeGreaterThan(0)
      expect(chunk.organization.length).toBeGreaterThan(0)
      expect(chunk.date_range.length).toBeGreaterThan(0)
      expect(chunk.content.length).toBeGreaterThan(30)
    }
  })

  it('organization is single-line (NMIT \\n stripped for DB storage)', () => {
    for (const chunk of RESUME_CHUNKS) {
      expect(chunk.organization).not.toContain('\n')
    }
  })
})
