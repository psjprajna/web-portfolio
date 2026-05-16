import { describe, it, expect } from 'vitest'
import { JOURNEY_ENTRIES, type JourneyEntry } from '@/lib/data/journey'

describe('JOURNEY_ENTRIES', () => {
  it('has at least 6 entries', () => {
    expect(JOURNEY_ENTRIES.length).toBeGreaterThanOrEqual(6)
  })

  it('has no demo/placeholder keys leftover from Phase 2', () => {
    const obsoleteKeys = new Set(['presight', 'g42', 'oxford', 'noon', 'acme', 'manipal'])
    for (const entry of JOURNEY_ENTRIES) {
      expect(obsoleteKeys.has(entry.key), `entry "${entry.key}" is a Phase 2 placeholder`).toBe(false)
    }
  })

  it('has no placeholder text in bullets', () => {
    const placeholderPatterns = [/placeholder/i, /TODO/i, /lorem ipsum/i]
    for (const entry of JOURNEY_ENTRIES) {
      for (const bullet of entry.bullets) {
        for (const pattern of placeholderPatterns) {
          expect(pattern.test(bullet), `entry "${entry.key}" has placeholder text in bullet: ${bullet}`).toBe(false)
        }
      }
    }
  })

  it('every entry has all required fields populated', () => {
    for (const entry of JOURNEY_ENTRIES) {
      expect(entry.key, 'key missing').toBeTruthy()
      expect(entry.place, `place missing on ${entry.key}`).toBeTruthy()
      expect(entry.shortRole, `shortRole missing on ${entry.key}`).toBeTruthy()
      expect(entry.role, `role missing on ${entry.key}`).toBeTruthy()
      expect(entry.date, `date missing on ${entry.key}`).toBeTruthy()
      expect(entry.logoText, `logoText missing on ${entry.key}`).toBeTruthy()
      expect(entry.logoStyle, `logoStyle missing on ${entry.key}`).toBeTruthy()
    }
  })

  it('every entry has exactly 3 bullets', () => {
    for (const entry of JOURNEY_ENTRIES) {
      expect(entry.bullets.length, `entry "${entry.key}" has ${entry.bullets.length} bullets, expected 3`).toBe(3)
      for (const bullet of entry.bullets) {
        expect(bullet.length, `empty bullet in ${entry.key}`).toBeGreaterThan(0)
      }
    }
  })

  it('every entry has a valid type and side', () => {
    const validTypes: ReadonlyArray<JourneyEntry['type']> = ['work', 'edu']
    const validSides: ReadonlyArray<JourneyEntry['side']> = ['left', 'right']
    for (const entry of JOURNEY_ENTRIES) {
      expect(validTypes).toContain(entry.type)
      expect(validSides).toContain(entry.side)
    }
  })

  it('entries with logoSrc point to /logos/ assets', () => {
    for (const entry of JOURNEY_ENTRIES) {
      if (entry.logoSrc !== undefined) {
        expect(entry.logoSrc.startsWith('/logos/'), `${entry.key} logoSrc must start with /logos/`).toBe(true)
        expect(/\.(svg|png|jpg|jpeg|webp)$/i.test(entry.logoSrc), `${entry.key} logoSrc must reference an image file`).toBe(true)
      }
    }
  })

  it('alternating-spine sides alternate left/right', () => {
    const sides = JOURNEY_ENTRIES.map((e) => e.side)
    for (let i = 1; i < sides.length; i++) {
      expect(sides[i]).not.toBe(sides[i - 1])
    }
  })

  it('keys are unique', () => {
    const keys = JOURNEY_ENTRIES.map((e) => e.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})
