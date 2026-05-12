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
    <header
      style={{
        position: 'relative',
        zIndex: 50,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        height: '56px',
        background: 'var(--cream)',
        borderBottom: '1px solid rgba(17,17,17,0.08)',
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '17px',
          fontWeight: 700,
          color: 'var(--ink)',
          letterSpacing: '0.03em',
          userSelect: 'none',
        }}
      >
        PS
      </span>

      {/* Desktop nav */}
      <nav aria-label="sections" className="hidden md:flex items-center">
        {sections.map((section, idx) => (
          <button
            key={section}
            onClick={() => handleNavigate(idx)}
            aria-current={activeIdx === idx ? 'page' : undefined}
            style={{
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase' as const,
              color: activeIdx === idx ? 'var(--ink)' : 'var(--ink2)',
              background: 'none',
              border: 'none',
              borderBottom: activeIdx === idx
                ? '1.5px solid var(--gold)'
                : '1.5px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              lineHeight: 1,
            }}
            onMouseEnter={e => {
              if (activeIdx !== idx) {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)'
              }
            }}
            onMouseLeave={e => {
              if (activeIdx !== idx) {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink2)'
              }
            }}
          >
            {section}
          </button>
        ))}
      </nav>

      {/* Right side placeholder (theme + lang toggle in Slice 2.1) */}
      <div style={{ width: '40px' }} />

      {/* Mobile hamburger */}
      <button
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(prev => !prev)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        style={{ color: 'var(--ink2)' }}
      >
        <span className="block w-5 h-0.5 bg-current" />
        <span className="block w-5 h-0.5 bg-current" />
        <span className="block w-5 h-0.5 bg-current" />
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          aria-label="mobile"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--cream)',
            borderBottom: '1px solid rgba(17,17,17,0.08)',
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 0',
          }}
        >
          {sections.map((section, idx) => (
            <button
              key={section}
              onClick={() => handleNavigate(idx)}
              aria-current={activeIdx === idx ? 'page' : undefined}
              style={{
                padding: '12px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
                color: activeIdx === idx ? 'var(--ink)' : 'var(--ink2)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {section}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}
