import { PROJECTS, type Project, type ProjectStatus } from '@/lib/data/projects'

export function Projects() {
  return (
    <section id="projects" className="deck-section">
      <section className="page-header">
        <div className="works-heading">
          <p className="works-label">Catalog</p>
          <div className="works-heading-row">
            <h2 className="works-title">Selected Works</h2>
            <span className="works-sub">LLM agents &amp; ML systems shipped to production</span>
          </div>
          <div className="works-rule" />
        </div>
      </section>

      <section className="projects-grid" aria-label="Project list">
        {PROJECTS.map((project) => (
          <ProjectCard key={project.num} project={project} />
        ))}
      </section>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card">
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
