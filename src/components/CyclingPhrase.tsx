'use client'

import { useEffect, useState } from 'react'
import { HERO_PHRASES } from '@/lib/data/phrases'

const CYCLE_INTERVAL_MS = 2600
const FADE_DURATION_MS = 280

export function CyclingPhrase() {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true)
      const swap = setTimeout(() => {
        setIndex((prev) => (prev + 1) % HERO_PHRASES.length)
        setFading(false)
      }, FADE_DURATION_MS)
      return () => clearTimeout(swap)
    }, CYCLE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <span id="hero-cycle" className={fading ? 'fading' : undefined}>
      {HERO_PHRASES[index]}
    </span>
  )
}
