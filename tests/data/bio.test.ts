import { describe, it, expect } from 'vitest'
import { BIO_CHUNKS } from '@/lib/data/bio'

describe('BIO_CHUNKS', () => {
  it('contains 4 about + 6 arsenal = 10 chunks', () => {
    expect(BIO_CHUNKS).toHaveLength(10)
    const sections = BIO_CHUNKS.reduce<Record<string, number>>((acc, c) => {
      acc[c.section] = (acc[c.section] ?? 0) + 1
      return acc
    }, {})
    expect(sections).toEqual({ about: 4, arsenal: 6 })
  })

  it('each chunk has non-empty content of meaningful length', () => {
    for (const chunk of BIO_CHUNKS) {
      expect(chunk.content.length).toBeGreaterThan(30)
    }
  })

  it('arsenal chunks have non-null heading; about chunks are either null or a distinct title', () => {
    // The Profile-facts chunk (Slice 4.2g) carries heading 'Profile facts'
    // — deliberately distinct from the in-code ANCHOR_CHUNK title
    // "Profile snapshot" so dedupeChunks (synthesize.ts) keeps them separate.
    // Other about chunks remain headless.
    for (const chunk of BIO_CHUNKS) {
      if (chunk.section === 'arsenal') {
        expect(chunk.heading).not.toBeNull()
        expect(chunk.heading?.length).toBeGreaterThan(0)
      } else if (chunk.heading !== null) {
        expect(chunk.heading).not.toBe('Profile snapshot')
        expect(chunk.heading.length).toBeGreaterThan(0)
      }
    }
  })

  it('(section, display_order) pairs are unique', () => {
    const pairs = BIO_CHUNKS.map((c) => `${c.section}::${c.display_order}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })

  it('display_order is non-negative within each section', () => {
    for (const chunk of BIO_CHUNKS) {
      expect(chunk.display_order).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(chunk.display_order)).toBe(true)
    }
  })
})
