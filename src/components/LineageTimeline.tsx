'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { JOURNEY_ENTRIES, type JourneyEntry } from '@/lib/data/journey'

const MOUSE_LEAVE_GRACE_MS = 200

const LINEAGE_HEIGHT_MIN_PX = 260
const LINEAGE_HEIGHT_MAX_PX = 640

export function LineageTimeline() {
  const [pinnedKey, setPinnedKey] = useState<string | null>(null)
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listRef = useRef<HTMLOListElement | null>(null)

  const activeKey = hoverKey ?? pinnedKey
  const activeEntry = useMemo(
    () => JOURNEY_ENTRIES.find((e) => e.key === activeKey) ?? JOURNEY_ENTRIES[0]!,
    [activeKey],
  )
  const mode: 'detail' | 'timeline' = activeKey ? 'detail' : 'timeline'

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const journeyArea = list.closest('.journey-area') as HTMLElement | null
    const journeyViews = journeyArea?.querySelector<HTMLElement>('.journey-views') ?? null
    const about = journeyArea?.closest<HTMLElement>('#about') ?? null
    const arsenal = about?.querySelector<HTMLElement>('.arsenal-section') ?? null

    // Lineage height = the vertical distance from journey-views top to arsenal top,
    // minus #about's row-gap. Measuring journey-views.height directly is circular:
    // its height grows to fit the (set-height) .tl-list child, so an oversized
    // --lineage-height re-validates itself instead of being corrected. The arsenal
    // section is on grid row 2 (auto), its top reflects the true bio-section row
    // allocation regardless of overflow — that's the ceiling we must respect.
    function updateLineageHeight() {
      if (!journeyArea || !journeyViews || !about || !arsenal) return
      const jvTop = journeyViews.getBoundingClientRect().top
      const arsenalTop = arsenal.getBoundingClientRect().top
      const rowGapPx = parseFloat(getComputedStyle(about).rowGap) || 0
      const available = arsenalTop - jvTop - rowGapPx
      if (available <= 0) return
      const computed = Math.min(
        LINEAGE_HEIGHT_MAX_PX,
        Math.max(LINEAGE_HEIGHT_MIN_PX, available),
      )
      journeyArea.style.setProperty('--lineage-height', `${computed}px`)
    }

    function updateSpine() {
      if (!list) return
      const dots = list.querySelectorAll<HTMLElement>('.tl-dot')
      if (dots.length < 2) return
      const first = dots[0]!.getBoundingClientRect()
      const last = dots[dots.length - 1]!.getBoundingClientRect()
      const listRect = list.getBoundingClientRect()
      const top = first.top + first.height / 2 - listRect.top
      const bottom = listRect.bottom - (last.top + last.height / 2)
      const target = journeyArea ?? list
      target.style.setProperty('--spine-top', `${top}px`)
      target.style.setProperty('--spine-bottom', `${bottom}px`)
    }

    updateLineageHeight()
    updateSpine()
    const observer = new ResizeObserver(() => {
      updateLineageHeight()
      updateSpine()
    })
    observer.observe(list)
    if (journeyViews) observer.observe(journeyViews)
    if (arsenal) observer.observe(arsenal)
    for (const entry of list.querySelectorAll('.tl-entry')) {
      observer.observe(entry)
    }
    function onResize() {
      updateLineageHeight()
      updateSpine()
    }
    window.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const clearTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleClear = useCallback(() => {
    clearTimer()
    hideTimerRef.current = setTimeout(() => {
      setHoverKey(null)
      hideTimerRef.current = null
    }, MOUSE_LEAVE_GRACE_MS)
  }, [clearTimer])

  useEffect(() => () => clearTimer(), [clearTimer])

  useEffect(() => {
    if (pinnedKey === null) return
    function handleDocumentClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('.tl-entry, .detail-card')) return
      setPinnedKey(null)
      setHoverKey(null)
    }
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [pinnedKey])

  const onEntryEnter = useCallback(
    (key: string) => {
      clearTimer()
      setHoverKey(key)
    },
    [clearTimer],
  )

  const onEntryLeave = useCallback(() => {
    scheduleClear()
  }, [scheduleClear])

  const onEntryClick = useCallback((key: string) => {
    setPinnedKey((current) => (current === key ? null : key))
    setHoverKey(key)
  }, [])

  const onCardEnter = clearTimer
  const onCardLeave = scheduleClear

  return (
    <div className="journey-area" data-mode={mode}>
      <div className="lineage-heading">
        <p className="lineage-label">Lineage</p>
        <div className="lineage-heading-row">
          <h2 className="lineage-title">Professional Lineage</h2>
          <span className="lineage-sub">Work, study & the path that got me here</span>
        </div>
        <div className="lineage-rule" />
        <p className="lineage-hint" aria-hidden="true">
          <span className="lineage-hint-icon">
            <svg viewBox="0 0 24 24">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </span>
          <span>Select an entry to read more</span>
        </p>
      </div>

      <div className="journey-views">
        <div className="timeline-view">
          <ol className="tl-list" ref={listRef}>
            {JOURNEY_ENTRIES.map((entry) => (
              <TimelineEntry
                key={entry.key}
                entry={entry}
                active={activeKey === entry.key}
                onEnter={onEntryEnter}
                onLeave={onEntryLeave}
                onClick={onEntryClick}
              />
            ))}
          </ol>
        </div>

        <aside
          className="detail-card"
          onMouseEnter={onCardEnter}
          onMouseLeave={onCardLeave}
        >
          <div className="detail-header">
            <div className="detail-headline">
              <div className="detail-place">{activeEntry.place}</div>
              <div className="detail-role">{activeEntry.role}</div>
            </div>
            <span className="detail-date">{activeEntry.date}</span>
          </div>
          <div className="detail-rule" />
          <ul className="detail-bullets">
            {activeEntry.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

interface TimelineEntryProps {
  entry: JourneyEntry
  active: boolean
  onEnter: (key: string) => void
  onLeave: () => void
  onClick: (key: string) => void
}

function TimelineEntry({ entry, active, onEnter, onLeave, onClick }: TimelineEntryProps) {
  return (
    <li
      className={`tl-entry side-${entry.side}${active ? ' is-active' : ''}`}
      onMouseEnter={() => onEnter(entry.key)}
      onMouseLeave={onLeave}
      onClick={(e) => {
        e.stopPropagation()
        onClick(entry.key)
      }}
    >
      <span className={`tl-dot t-${entry.type}`} aria-hidden="true" />
      <div className="tl-entry-content">
        <div className="tl-card">
          <div
            className="tl-logo"
            style={entry.logoSrc ? undefined : parseInlineStyle(entry.logoStyle)}
          >
            {entry.logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.logoSrc} alt={entry.place} className="tl-logo-img" />
            ) : (
              entry.logoText
            )}
          </div>
          <div className="tl-text">
            <span className="tl-place">{entry.place}</span>
            <span className="tl-role">{entry.shortRole}</span>
          </div>
        </div>
        <div className="tl-details">
          <span className="tl-details-date">{entry.date}</span>
          <ul className="tl-details-bullets">
            {entry.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  )
}

function parseInlineStyle(css: string): React.CSSProperties {
  const result: Record<string, string> = {}
  for (const decl of css.split(';')) {
    const [rawProp, ...rest] = decl.split(':')
    if (!rawProp || rest.length === 0) continue
    const prop = rawProp.trim()
    const value = rest.join(':').trim()
    if (!prop || !value) continue
    const camel = prop.replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase())
    result[camel] = value
  }
  return result as React.CSSProperties
}
