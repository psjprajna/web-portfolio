'use client'

import { useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { ProjectsSection } from '@/components/sections/ProjectsSection'

const SECTIONS: string[] = ['Hero', 'About', 'Skills', 'Projects', 'Contact']

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeInOut' as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeInOut' as const },
  }),
}

function PlaceholderSection({ name }: { name: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: '32px',
      }}
    >
      <div
        style={{
          border: '1px solid rgba(17,17,17,0.15)',
          borderRadius: '12px',
          padding: '40px 48px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--ink3)',
            marginBottom: '8px',
          }}
        >
          section
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '3rem',
            fontWeight: 900,
            color: 'var(--ink)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          {name}
        </h2>
        <p style={{ color: 'var(--ink3)', fontSize: '13px', marginTop: '12px' }}>
          Coming in Phase 2
        </p>
      </div>
    </div>
  )
}

function renderSection(idx: number): React.ReactNode {
  if (idx === 3) return <ProjectsSection />
  const label = SECTIONS[idx] ?? 'Section'
  return <PlaceholderSection name={label} />
}

export default function Home() {
  const [activeIdx, setActiveIdx] = useState(3)
  const [direction, setDirection] = useState(1)

  function navigate(idx: number) {
    setDirection(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
  }

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--cream)',
      }}
    >
      <Navbar sections={SECTIONS} activeIdx={activeIdx} onNavigate={navigate} />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ position: 'absolute', inset: 0 }}
          >
            {renderSection(activeIdx)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
