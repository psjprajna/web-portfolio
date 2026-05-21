import { describe, it, expect } from 'vitest'
import { BIO_CHUNKS } from '@/lib/data/bio'

describe('BIO_CHUNKS', () => {
  it('contains 3 about + 6 arsenal = 9 chunks', () => {
    expect(BIO_CHUNKS).toHaveLength(9)
    const sections = BIO_CHUNKS.reduce<Record<string, number>>((acc, c) => {
      acc[c.section] = (acc[c.section] ?? 0) + 1
      return acc
    }, {})
    expect(sections).toEqual({ about: 3, arsenal: 6 })
  })

  it('each chunk has non-empty content of meaningful length', () => {
    for (const chunk of BIO_CHUNKS) {
      expect(chunk.content.length).toBeGreaterThan(30)
    }
  })

  it('about chunks have heading null; arsenal chunks have non-null heading', () => {
    for (const chunk of BIO_CHUNKS) {
      if (chunk.section === 'about') {
        expect(chunk.heading).toBeNull()
      } else {
        expect(chunk.heading).not.toBeNull()
        expect(chunk.heading?.length).toBeGreaterThan(0)
      }
    }
  })

  it('(section, display_order) pairs are unique', () => {
    const pairs = BIO_CHUNKS.map((c) => `${c.section}::${c.display_order}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })

  it('display_order is positive within each section', () => {
    for (const chunk of BIO_CHUNKS) {
      expect(chunk.display_order).toBeGreaterThan(0)
      expect(Number.isInteger(chunk.display_order)).toBe(true)
    }
  })
})
