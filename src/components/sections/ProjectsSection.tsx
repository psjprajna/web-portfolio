'use client'

import { PROJECTS, type ProjectData } from '@/lib/constants/projects'

export function ProjectsSection() {
  return (
    <section
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '20px 40px 14px',
        background: 'var(--cream)',
      }}
    >
      {/* Header */}
      <header style={{ flexShrink: 0, marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--ink3)',
            }}
          >
            Selected Work
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(17,17,17,0.08)' }} />
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(28px, 3.5vw, 48px)',
            fontWeight: 900,
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            color: 'var(--ink)',
          }}
        >
          Projects
        </h2>
      </header>

      {/* 3×2 grid — fills remaining height */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        {PROJECTS.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>

      {/* More on GitHub */}
      <div style={{ flexShrink: 0, textAlign: 'center', paddingTop: '10px' }}>
        <a
          href="https://github.com/psjprajna"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--ink2)',
            textDecoration: 'none',
            borderBottom: '1px solid currentColor',
            paddingBottom: 2,
            letterSpacing: '-0.01em',
          }}
        >
          More on GitHub →
        </a>
      </div>
    </section>
  )
}

function ProjectCard({ project, index }: { project: ProjectData; index: number }) {
  const isOdd = index % 2 === 0

  return (
    <div
      className="group"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid rgba(17,17,17,0.1)',
        borderTopWidth: '2.5px',
        borderTopColor: isOdd ? 'var(--gold)' : 'var(--charcoal)',
        background: 'var(--cream)',
        cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 16px 48px rgba(17,17,17,0.13)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = ''
        el.style.boxShadow = ''
      }}
    >
      {/* Thumbnail */}
      <div style={{ flex: '0 0 42%', position: 'relative', overflow: 'hidden' }}>
        {/* Background gradient */}
        <div
          style={{
            width: '100%',
            height: '100%',
            background: project.gradient,
            transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
          }}
          className="group-hover:[transform:scale(1.04)]"
        />

        {/* VIDEO / IMAGE badge */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            fontSize: '9px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            borderRadius: '4px',
            background: project.mediaType === 'VIDEO' ? 'var(--gold)' : 'var(--charcoal)',
            color: project.mediaType === 'VIDEO' ? '#1c1a14' : 'rgba(235,229,216,0.85)',
          }}
        >
          {project.mediaType}
        </div>

        {/* Category chip */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            background: 'rgba(17,17,17,0.7)',
            color: 'rgba(235,229,216,0.9)',
            fontSize: '9.5px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '3px 9px',
            borderRadius: '4px',
          }}
        >
          {project.category}
        </div>

        {/* Hover overlay with play button */}
        <div
          className="group-hover:opacity-100"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(17,17,17,0.5)',
            opacity: 0,
            transition: 'opacity 0.25s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(235,229,216,0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {project.mediaType === 'VIDEO' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c1a14" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c1a14" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </div>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'rgba(235,229,216,0.85)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {project.mediaType === 'VIDEO' ? 'Click to play' : 'View project'}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '10px 12px 12px',
          minHeight: 0,
        }}
      >
        <div style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 600, marginBottom: 2 }}>
          {project.num}
        </div>

        <div
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--ink)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 6,
          }}
        >
          {project.title}
        </div>

        <div
          style={{
            fontSize: '11px',
            color: 'var(--ink2)',
            lineHeight: 1.5,
            marginBottom: 8,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {project.description}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 'auto' }}>
          {project.tech.map(tag => (
            <span
              key={tag}
              style={{
                fontSize: '9px',
                padding: '2px 8px',
                borderRadius: '20px',
                border: '1px solid rgba(17,17,17,0.18)',
                color: 'var(--ink2)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div
          style={{
            display: 'flex',
            gap: 14,
            paddingTop: 8,
            marginTop: 8,
            borderTop: '1px solid rgba(17,17,17,0.08)',
          }}
        >
          {project.liveUrl !== null && (
            <a
              href={project.liveUrl}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--gold)',
                textDecoration: 'none',
                borderBottom: '1px solid currentColor',
                paddingBottom: 1,
              }}
            >
              Live demo →
            </a>
          )}
          {project.codeUrl !== null && (
            <a
              href={project.codeUrl}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--ink2)',
                textDecoration: 'none',
                borderBottom: '1px solid currentColor',
                paddingBottom: 1,
              }}
            >
              Code →
            </a>
          )}
          {project.paperUrl !== null && (
            <a
              href={project.paperUrl}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--ink2)',
                textDecoration: 'none',
                borderBottom: '1px solid currentColor',
                paddingBottom: 1,
              }}
            >
              Paper →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
