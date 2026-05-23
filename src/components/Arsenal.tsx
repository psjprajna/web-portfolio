import { useTranslations, useLocale } from 'next-intl'
import { SKILLS, localizeSkill, type Skill, type SkillIconName } from '@/lib/data/skills'

export function Arsenal() {
  const t = useTranslations('Arsenal')
  const locale = useLocale()
  const skills = SKILLS.map((s) => localizeSkill(s, locale))
  return (
    <div className="arsenal-section">
      <div>
        <p className="arsenal-label">{t('label')}</p>
        <div className="arsenal-heading-row">
          <h2 className="arsenal-title">{t('title')}</h2>
          <span className="arsenal-sub">{t('subtitle')}</span>
        </div>
        <div className="arsenal-rule" />
      </div>

      <div className="skill-grid">
        {skills.map((skill) => (
          <SkillCard key={skill.num} skill={skill} />
        ))}
      </div>
    </div>
  )
}

interface SkillCardProps {
  skill: Skill
}

function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="skill-card">
      <div className="card-top-row">
        <div className="card-dot-wrap">
          <span className={`card-dot ${skill.dot}`} aria-hidden="true" />
          <span className="card-dot-label">{skill.eyebrow}</span>
        </div>
        <span className="card-num">{skill.num}</span>
      </div>
      {ICONS[skill.iconName]}
      <p className="card-cat">{skill.title}</p>
      <p className="card-kw">{skill.keywords}</p>
    </div>
  )
}

const ICONS: Record<SkillIconName, React.ReactNode> = {
  genai: (
    <svg className="card-icon" viewBox="0 0 24 24">
      <circle cx="4" cy="12" r="2" />
      <circle cx="20" cy="7" r="2" />
      <circle cx="20" cy="17" r="2" />
      <circle cx="12" cy="12" r="2.5" />
      <line x1="6" y1="12" x2="9.5" y2="12" />
      <line x1="14.5" y1="11.5" x2="18.1" y2="8" />
      <line x1="14.5" y1="12.5" x2="18.1" y2="16" />
    </svg>
  ),
  ml: (
    <svg className="card-icon" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  rag: (
    <svg className="card-icon" viewBox="0 0 24 24">
      <circle cx="10" cy="10" r="5" />
      <line x1="13.5" y1="13.5" x2="19" y2="19" />
      <line x1="7.5" y1="10" x2="12.5" y2="10" />
      <line x1="10" y1="7.5" x2="10" y2="12.5" />
    </svg>
  ),
  frameworks: (
    <svg className="card-icon" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  cloud: (
    <svg className="card-icon" viewBox="0 0 24 24">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  data: (
    <svg className="card-icon" viewBox="0 0 24 24">
      <ellipse cx="12" cy="5" rx="8" ry="2.5" />
      <path d="M4 5v4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5V5" />
      <path d="M4 13c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5V9" />
      <path d="M4 17c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-4" />
    </svg>
  ),
}
