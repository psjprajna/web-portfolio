'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const TABLET_MIN_PX = 768

export function MobileNavMenu() {
  const [open, setOpen] = useState(false)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= TABLET_MIN_PX) setOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!open) return
    function handleDocumentClick(e: MouseEvent) {
      const target = e.target as Node | null
      if (!target) return
      if (drawerRef.current?.contains(target)) return
      if (hamburgerRef.current?.contains(target)) return
      setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <>
      <button
        ref={hamburgerRef}
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
      <div
        ref={drawerRef}
        className={`nav-drawer${open ? ' open' : ''}`}
        aria-hidden={!open}
      >
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
