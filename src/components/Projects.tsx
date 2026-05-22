import { PROJECTS } from '@/lib/data/projects'
import { ProjectsFilterShell } from './ProjectsFilterShell'

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

      <ProjectsFilterShell projects={PROJECTS} />
    </section>
  )
}
