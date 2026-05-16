'use client'

import { useCallback, useEffect, useState } from 'react'

const TABLET_MIN_PX = 768

export function MobileNavMenu() {
  const [open, setOpen] = useState(false)

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= TABLET_MIN_PX) setOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <button
        type="button"
        className={`nav-hamburger${open ? ' open' : ''}`}
        onClick={toggle}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>
      <div className={`nav-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <ul>
          <li>
            <a href="#hero" onClick={close}>
              Home
            </a>
          </li>
          <li>
            <a href="#about" onClick={close}>
              About
            </a>
          </li>
          <li>
            <a href="#projects" onClick={close}>
              Projects
            </a>
          </li>
        </ul>
      </div>
    </>
  )
}
