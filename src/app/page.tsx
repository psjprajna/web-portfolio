'use client'

import { useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { Navbar } from '@/components/Navbar'

const SECTIONS = ['Hero', 'About', 'Skills', 'Projects', 'Contact'] as const

const slideVariants: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut' as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeInOut' as const },
  }),
}

function PlaceholderSection({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full w-full px-8">
      <div className="border border-[#0f766e] rounded-lg px-10 py-8 text-center">
        <p className="text-[#94a3b8] text-sm font-mono uppercase tracking-widest mb-2">
          section
        </p>
        <h2 className="text-5xl font-bold text-[#f8fafc]">{name}</h2>
        <p className="text-[#94a3b8] text-sm mt-3">
          Content coming in Phase 2
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  function navigate(idx: number) {
    setDirection(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0f172a] flex flex-col">
      <Navbar
        sections={[...SECTIONS]}
        activeIdx={activeIdx}
        onNavigate={navigate}
      />
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center"
          >
            <PlaceholderSection name={SECTIONS[activeIdx] ?? 'Hero'} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
