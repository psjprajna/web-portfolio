import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'

const SRC_ROOT = resolve(__dirname, '../../src')

function getAllTsFiles(dir: string): string[] {
  const files: string[] = []
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory() && !entry.startsWith('.')) {
      files.push(...getAllTsFiles(fullPath))
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(fullPath)
    }
  }
  return files
}

function getImports(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8')
  const importRegex = /^import\s+.*?from\s+['"]([^'"]+)['"]/gm
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g
  const imports: string[] = []
  let match
  while ((match = importRegex.exec(content)) !== null) imports.push(match[1]!)
  while ((match = requireRegex.exec(content)) !== null) imports.push(match[1]!)
  return imports
}

describe('Architecture Boundaries', () => {
  it('UI layer (src/app/ and src/components/) never imports from src/lib/db/', () => {
    const uiDirs = [join(SRC_ROOT, 'app'), join(SRC_ROOT, 'components')]
    const violations: string[] = []

    for (const dir of uiDirs) {
      try {
        const files = getAllTsFiles(dir)
        for (const file of files) {
          const imports = getImports(file)
          for (const imp of imports) {
            if (imp.includes('lib/db') || imp.includes('@/lib/db')) {
              violations.push(`${file.replace(SRC_ROOT, 'src')} imports ${imp}`)
            }
          }
        }
      } catch {
        // Directory does not exist yet — passes by default during bootstrap
      }
    }

    expect(violations, `UI layer must not import from lib/db:\n${violations.join('\n')}`).toHaveLength(0)
  })

  it('src/lib/db/ never imports from src/components/', () => {
    const dbDir = join(SRC_ROOT, 'lib', 'db')
    const violations: string[] = []

    try {
      const files = getAllTsFiles(dbDir)
      for (const file of files) {
        const imports = getImports(file)
        for (const imp of imports) {
          if (imp.includes('/components/') || imp.startsWith('@/components')) {
            violations.push(`${file.replace(SRC_ROOT, 'src')} imports ${imp}`)
          }
        }
      }
    } catch {
      // Directory does not exist yet — passes by default
    }

    expect(violations, `lib/db must not import from components:\n${violations.join('\n')}`).toHaveLength(0)
  })

  it('src/lib/ai/ never imports from src/lib/db/', () => {
    const aiDir = join(SRC_ROOT, 'lib', 'ai')
    const violations: string[] = []

    try {
      const files = getAllTsFiles(aiDir)
      for (const file of files) {
        const imports = getImports(file)
        for (const imp of imports) {
          if (imp.includes('lib/db') || imp.includes('@/lib/db')) {
            violations.push(`${file.replace(SRC_ROOT, 'src')} imports ${imp}`)
          }
        }
      }
    } catch {
      // Directory does not exist yet — passes by default
    }

    expect(violations, `lib/ai must not import from lib/db:\n${violations.join('\n')}`).toHaveLength(0)
  })
})
