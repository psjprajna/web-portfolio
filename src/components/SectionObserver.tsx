'use client'

import { useEffect } from 'react'

const NAV_LABELS: Record<string, string> = {
  hero: '',
  about: 'About',
  projects: 'Projects',
}

export function SectionObserver() {
  useEffect(() => {
    const sections = ['hero', 'about', 'projects']
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const navCurrent = document.querySelector<HTMLElement>('.nav-current')
    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-links a')

    function applyActive(id: string) {
      if (id === 'hero') {
        document.body.classList.add('on-hero')
      } else {
        document.body.classList.remove('on-hero')
      }

      if (navCurrent) {
        const label = NAV_LABELS[id] ?? ''
        navCurrent.textContent = label
        navCurrent.classList.toggle('visible', label.length > 0)
      }

      navLinks.forEach((link) => {
        const href = link.getAttribute('href') ?? ''
        link.classList.toggle('active', href === `#${id}`)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible?.target instanceof HTMLElement) {
          applyActive(visible.target.id)
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  return null
}
