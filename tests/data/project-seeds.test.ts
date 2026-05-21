import { describe, it, expect } from 'vitest'
import { PROJECT_SEEDS } from '@/lib/data/project-chunks'

describe('PROJECT_SEEDS', () => {
  it('contains exactly 4 entries with expected display_names in featured_order', () => {
    expect(PROJECT_SEEDS).toHaveLength(4)
    const names = PROJECT_SEEDS.map((s) => s.display_name)
    expect(names).toEqual([
      'UAE Government Policy RAG',
      'Arabic Sentiment Analysis',
      'AI Job Application Agent',
      'Telecom Churn Prediction',
    ])
  })

  it('every seed has body_md of at least 150 characters', () => {
    for (const seed of PROJECT_SEEDS) {
      expect(seed.body_md.length).toBeGreaterThanOrEqual(150)
    }
  })

  it('display_name, description, tech_stack, github_repo all populated per seed', () => {
    for (const seed of PROJECT_SEEDS) {
      expect(seed.display_name.length).toBeGreaterThan(0)
      expect(seed.description.length).toBeGreaterThan(0)
      expect(seed.tech_stack.length).toBeGreaterThan(0)
      expect(seed.github_repo).toMatch(/^https:\/\/github\.com\//)
    }
  })

  it('status is published or featured (never pending)', () => {
    for (const seed of PROJECT_SEEDS) {
      expect(['published', 'featured']).toContain(seed.status)
    }
  })

  it('display_names and featured_orders are unique', () => {
    const names = PROJECT_SEEDS.map((s) => s.display_name)
    const orders = PROJECT_SEEDS.map((s) => s.featured_order)
    expect(new Set(names).size).toBe(names.length)
    expect(new Set(orders).size).toBe(orders.length)
  })
})
