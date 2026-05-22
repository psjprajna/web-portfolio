'use client'
import type { Project, ProjectStatus } from '@/lib/data/projects'

// Extracted from Projects.tsx (Slice 4.3). Marked 'use client' so it can be
// composed by the ProjectsFilterShell client component as well as by the
// Server Component shell in Projects.tsx (Next 16 allows RSC → client import).
// The only behavioral addition is the optional `isHidden` prop, which the
// filter shell toggles to animate non-matching cards via .card.filter-hidden.
interface Props {
  project: Project
  isHidden?: boolean
}

export function ProjectCard({ project, isHidden = false }: Props) {
  const cardClass = `card${isHidden ? ' filter-hidden' : ''}`
  return (
    <article className={cardClass} aria-hidden={isHidden || undefined}>
      <div className="card-header">
        <div className="card-status">
          <StatusIndicator status={project.status} />
        </div>
        <span className="card-num">{project.num}</span>
      </div>
      <h2 className="card-title">{project.title}</h2>
      <p className="card-desc">{project.description}</p>
      <div className="card-spacer" />
      <div className="card-thumb">
        <span className="material-symbols-outlined card-thumb-icon">{project.thumbIcon}</span>
      </div>
      <div className="card-meta">
        <div className="card-meta-grid">
          <div>
            <div className="meta-item-label">{project.metaArchitecture.label}</div>
            <div className="meta-item-value">{project.metaArchitecture.value}</div>
          </div>
          <div>
            <div className="meta-item-label">{project.metaImpact.label}</div>
            <div
              className={`meta-item-value${project.metaImpact.accent ? ' accent' : ''}`}
            >
              {project.metaImpact.value}
            </div>
          </div>
        </div>
        <div className="card-actions">
          <ActionButton kind="github" href={project.githubUrl} />
          <ActionButton kind="spec" href={project.specUrl} />
        </div>
      </div>
    </article>
  )
}

function ActionButton({ kind, href }: { kind: 'github' | 'spec'; href: string | undefined }) {
  const cls = `card-btn card-btn-${kind}`
  const icon = kind === 'github' ? 'code' : 'description'
  const label = kind === 'github' ? 'GITHUB' : 'READ SPEC'
  if (href === undefined) {
    return (
      <span className={`${cls} is-disabled`} aria-disabled="true">
        <span className="material-symbols-outlined">{icon}</span>
        <span>{label}</span>
      </span>
    )
  }
  const externalAttrs = kind === 'github' ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a className={cls} href={href} {...externalAttrs}>
      <span className="material-symbols-outlined">{icon}</span>
      <span>{label}</span>
    </a>
  )
}

function StatusIndicator({ status }: { status: ProjectStatus }) {
  if (status.kind === 'plain') {
    return (
      <span className="status-label" style={{ letterSpacing: '0.06em' }}>
        {status.label}
      </span>
    )
  }
  const dotClass =
    status.kind === 'live'
      ? 'status-dot'
      : status.kind === 'internal'
        ? 'status-dot internal'
        : 'status-dot closed'
  return (
    <>
      <span className={dotClass}>
        {status.kind === 'live' && <span className="status-dot-ping" />}
        <span className="status-dot-inner" />
      </span>
      <span className="status-label">{status.label}</span>
    </>
  )
}
