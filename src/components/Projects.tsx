import { useTranslations, useLocale } from 'next-intl'
import { PROJECTS, localizeProject } from '@/lib/data/projects'
import { ProjectCard } from './ProjectCard'

export function Projects() {
  const t = useTranslations('Projects')
  const locale = useLocale()
  const projects = PROJECTS.map((p) => localizeProject(p, locale))
  return (
    <section id="projects" className="deck-section">
      <section className="page-header">
        <div className="works-heading">
          <p className="works-label">{t('label')}</p>
          <div className="works-heading-row">
            <h2 className="works-title">{t('title')}</h2>
            <span className="works-sub">{t('subtitle')}</span>
          </div>
          <div className="works-rule" />
        </div>
      </section>

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.num} project={project} />
        ))}
      </div>
    </section>
  )
}
