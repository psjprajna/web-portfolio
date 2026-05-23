'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

const TABLET_MIN_PX = 768

export function MobileNavMenu() {
  const tMenu = useTranslations('MobileMenu')
  const tNav = useTranslations('Navbar')
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
        aria-label={open ? tMenu('closeAria') : tMenu('openAria')}
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
              {tMenu('home')}
            </a>
          </li>
          <li>
            <a href="#about" onClick={close}>
              {tNav('about')}
            </a>
          </li>
          <li>
            <a href="#projects" onClick={close}>
              {tNav('projects')}
            </a>
          </li>
        </ul>
      </div>
    </>
  )
}
