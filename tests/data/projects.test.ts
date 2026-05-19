import { describe, it, expect } from 'vitest'
import { PROJECTS, type Project } from '@/lib/data/projects'

const VALID_STATUS_KINDS: ReadonlyArray<Project['status']['kind']> = [
  'live',
  'internal',
  'closed',
  'plain',
]

describe('PROJECTS', () => {
  it('has at least 4 entries', () => {
    expect(PROJECTS.length).toBeGreaterThanOrEqual(4)
  })

  it('has no demo/placeholder titles leftover from Phase 2', () => {
    const obsoleteTitles = new Set([
      'Artemis Financial Copilot',
      'MedParse Intelligence',
      'Lexicon Base Model',
      'Omni-Router Framework',
    ])
    for (const project of PROJECTS) {
      expect(obsoleteTitles.has(project.title), `"${project.title}" is a Phase 2 placeholder`).toBe(false)
    }
  })

  it('no project URL is a placeholder hash', () => {
    for (const project of PROJECTS) {
      if (project.githubUrl !== undefined) {
        expect(project.githubUrl, `${project.title} githubUrl is hash placeholder`).not.toBe('#')
        expect(project.githubUrl.startsWith('http'), `${project.title} githubUrl not absolute`).toBe(true)
      }
      if (project.specUrl !== undefined) {
        expect(project.specUrl).not.toBe('#')
      }
    }
  })

  it('every entry has all required fields populated', () => {
    for (const project of PROJECTS) {
      expect(project.num, 'num missing').toBeTruthy()
      expect(project.title, `title missing on ${project.num}`).toBeTruthy()
      expect(project.description, `description missing on ${project.num}`).toBeTruthy()
      expect(project.thumbIcon, `thumbIcon missing on ${project.num}`).toBeTruthy()
      expect(project.metaArchitecture.label).toBeTruthy()
      expect(project.metaArchitecture.value).toBeTruthy()
      expect(project.metaImpact.label).toBeTruthy()
      expect(project.metaImpact.value).toBeTruthy()
    }
  })

  it('every status uses a known kind', () => {
    for (const project of PROJECTS) {
      expect(VALID_STATUS_KINDS).toContain(project.status.kind)
      expect(project.status.label).toBeTruthy()
    }
  })

  it('description fits the card (≤ 320 chars)', () => {
    for (const project of PROJECTS) {
      expect(project.description.length, `${project.title} description too long (${project.description.length} chars)`)
        .toBeLessThanOrEqual(320)
    }
  })

  it('nums are unique and in 01-NN format', () => {
    const nums = PROJECTS.map((p) => p.num)
    expect(new Set(nums).size).toBe(nums.length)
    for (const num of nums) {
      expect(/^0[1-9]|[1-9]\d$/.test(num), `num "${num}" not in 01-99 format`).toBe(true)
    }
  })
})
