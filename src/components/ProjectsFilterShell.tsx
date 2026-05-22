'use client'
import { useEffect, useRef, useState } from 'react'
import type { Project } from '@/lib/data/projects'
import { ProjectCard } from './ProjectCard'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

const MIN_FILTER_LENGTH = 2
const DEBOUNCE_MS = 200

interface FilterResponse {
  matching: string[]
  degraded?: boolean
}

interface Props {
  projects: readonly Project[]
}

// Owns: filter input state, debounced fetch, match state, badge, sr-only announce.
//
// Why state shape is `fetchResult` (post-fetch only) instead of separate
// `matchingNums`/`didNoMatch`:
// React 19's `react-hooks/set-state-in-effect` rule flags synchronous setState
// inside useEffect (it pushes you toward derived state). The "filter inactive"
// signal IS derivable from `debounced.trim().length < MIN_FILTER_LENGTH` — pure
// sync — so we don't store it. We only persist the fetch result and derive
// matchingNums + didNoMatch downstream. The only setState calls in the effect
// happen AFTER `await fetch(...)` so the rule is satisfied.
export function ProjectsFilterShell({ projects }: Props) {
  const [filterText, setFilterText] = useState('')
  const debounced = useDebouncedValue(filterText, DEBOUNCE_MS)
  const trimmedDebounced = debounced.trim()
  const isActiveSync = trimmedDebounced.length >= MIN_FILTER_LENGTH
  // fetchResult is the last server response we successfully applied. We pair
  // it with `lastFilter` so a stale response from a previous filter doesn't
  // corrupt the active filter's display.
  const [fetchResult, setFetchResult] = useState<{ filter: string; matching: string[] } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Cancel any in-flight fetch when the component unmounts.
  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    if (!isActiveSync) {
      // No fetch needed; derived state is already "filter inactive" because
      // isActiveSync is false. Just cancel any stale in-flight request.
      abortRef.current?.abort()
      return
    }

    // Cancel any in-flight request from a prior debounce that's now stale.
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    void (async () => {
      try {
        const res = await fetch('/api/ai/filter', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ filter: trimmedDebounced }),
          signal: controller.signal,
        })
        if (!res.ok) {
          // 4xx/5xx → degrade to all visible.
          setFetchResult({ filter: trimmedDebounced, matching: projects.map((p) => p.num) })
          return
        }
        const data = (await res.json()) as FilterResponse
        setFetchResult({ filter: trimmedDebounced, matching: data.matching })
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return
        setFetchResult({ filter: trimmedDebounced, matching: projects.map((p) => p.num) })
      }
    })()
  }, [trimmedDebounced, isActiveSync, projects])

  // Derived render state — pure sync transforms over (input, fetchResult).
  // If isActiveSync is false, ignore the fetchResult entirely (it's from a
  // prior active filter that has since been cleared).
  const matchingNums =
    isActiveSync && fetchResult && fetchResult.filter === trimmedDebounced
      ? fetchResult.matching
      : null
  const didNoMatch = matchingNums !== null && matchingNums.length === 0
  const isActive = isActiveSync && matchingNums !== null
  const visibleCount = isActive ? matchingNums!.length : projects.length

  // SR announcement only when we have a definitive answer (matchingNums !== null).
  // While the fetch is in-flight we leave the live region quiet — better than
  // racing the announce with the spinner-like fade animation.
  const ariaMessage = isActive
    ? matchingNums!.length === 0
      ? 'No projects match the filter.'
      : `${matchingNums!.length} of ${projects.length} projects match the filter.`
    : ''

  return (
    <>
      <div className="projects-filter-bar">
        <input
          type="text"
          className="projects-filter-input"
          placeholder="Filter projects with natural language…"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          aria-label="Filter projects with natural language"
        />
        {isActive && (
          <span className="projects-filter-badge" aria-hidden="true">
            SHOWING {visibleCount}/{projects.length}
          </span>
        )}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {ariaMessage}
        </div>
      </div>
      {didNoMatch && (
        <p className="projects-filter-hint">
          No projects match. Try a broader term, or clear the filter to see all.
        </p>
      )}
      <section className="projects-grid" aria-label="Project list">
        {projects.map((p) => (
          <ProjectCard
            key={p.num}
            project={p}
            isHidden={isActive && !matchingNums!.includes(p.num)}
          />
        ))}
      </section>
    </>
  )
}
