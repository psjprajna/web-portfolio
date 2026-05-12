'use client'

import { useState } from 'react'

interface NavbarProps {
  sections: string[]
  activeIdx: number
  onNavigate: (idx: number) => void
}

export function Navbar({ sections, activeIdx, onNavigate }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  function handleNavigate(idx: number) {
    onNavigate(idx)
    setMenuOpen(false)
  }

  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-4 bg-[#0f172a] border-b border-[#334155]">
      {/* Logo */}
      <span className="text-[#14b8a6] font-mono font-bold text-lg tracking-tight select-none">
        PS
      </span>

      {/* Desktop nav */}
      <nav aria-label="desktop" className="hidden md:flex items-center gap-1">
        {sections.map((section, idx) => (
          <button
            key={section}
            onClick={() => handleNavigate(idx)}
            aria-current={activeIdx === idx ? 'page' : undefined}
            className={[
              'px-4 py-2 rounded text-sm font-medium transition-colors',
              activeIdx === idx
                ? 'text-[#14b8a6] border-b-2 border-[#0f766e]'
                : 'text-[#94a3b8] hover:text-[#f8fafc]',
            ].join(' ')}
          >
            {section}
          </button>
        ))}
      </nav>

      {/* Hamburger */}
      <button
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(prev => !prev)}
        className="md:hidden flex flex-col gap-1.5 p-2 text-[#94a3b8] hover:text-[#f8fafc]"
      >
        <span className="block w-5 h-0.5 bg-current" />
        <span className="block w-5 h-0.5 bg-current" />
        <span className="block w-5 h-0.5 bg-current" />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          aria-label="mobile"
          className="absolute top-full left-0 right-0 bg-[#1e293b] border-b border-[#334155] flex flex-col py-2"
        >
          {sections.map((section, idx) => (
            <button
              key={section}
              onClick={() => handleNavigate(idx)}
              aria-current={activeIdx === idx ? 'page' : undefined}
              className={[
                'px-6 py-3 text-left text-sm font-medium transition-colors',
                activeIdx === idx
                  ? 'text-[#14b8a6]'
                  : 'text-[#94a3b8] hover:text-[#f8fafc]',
              ].join(' ')}
            >
              {section}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
