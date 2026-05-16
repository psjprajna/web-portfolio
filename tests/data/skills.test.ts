import { describe, it, expect } from 'vitest'
import { SKILLS, type SkillIconName } from '@/lib/data/skills'

const VALID_ICON_NAMES: ReadonlyArray<SkillIconName> = [
  'genai',
  'ml',
  'languages',
  'frameworks',
  'cloud',
  'data',
]
const VALID_DOTS = ['d-gold', 'd-ink', 'd-terra'] as const

describe('SKILLS', () => {
  it('has exactly 6 entries', () => {
    expect(SKILLS.length).toBe(6)
  })

  it('every entry has all required fields populated', () => {
    for (const skill of SKILLS) {
      expect(skill.num, 'num missing').toBeTruthy()
      expect(skill.title, `title missing on ${skill.num}`).toBeTruthy()
      expect(skill.eyebrow, `eyebrow missing on ${skill.num}`).toBeTruthy()
      expect(skill.keywords, `keywords missing on ${skill.num}`).toBeTruthy()
      expect(skill.dot, `dot missing on ${skill.num}`).toBeTruthy()
      expect(skill.iconName, `iconName missing on ${skill.num}`).toBeTruthy()
    }
  })

  it('every iconName is in the known SkillIconName union', () => {
    for (const skill of SKILLS) {
      expect(VALID_ICON_NAMES).toContain(skill.iconName)
    }
  })

  it('every dot is in the known SkillDot union', () => {
    for (const skill of SKILLS) {
      expect(VALID_DOTS).toContain(skill.dot)
    }
  })

  it('has no placeholder text in keywords or title', () => {
    const placeholderPatterns = [/placeholder/i, /TODO/i, /lorem ipsum/i]
    for (const skill of SKILLS) {
      for (const pattern of placeholderPatterns) {
        expect(pattern.test(skill.title)).toBe(false)
        expect(pattern.test(skill.keywords)).toBe(false)
      }
    }
  })

  it('nums are unique and in 01-06 format', () => {
    const nums = SKILLS.map((s) => s.num)
    expect(new Set(nums).size).toBe(nums.length)
    for (const num of nums) {
      expect(/^0[1-9]|[1-9]\d$/.test(num), `num "${num}" not in 01-99 format`).toBe(true)
    }
  })
})
