'use client'
import { useEffect, useState } from 'react'

// Returns the input value after it has been stable for `delayMs`. Every keystroke
// resets the timer; only the final settle commits the value downstream. Used by
// ProjectsFilterShell to defer the /api/ai/filter POST until the visitor stops
// typing, so we issue one Haiku call per typing-settle (~200ms) rather than per
// keystroke.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
