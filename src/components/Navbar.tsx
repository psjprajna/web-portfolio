import { useTranslations } from 'next-intl'
import { ThemeToggle } from './ThemeToggle'
import { LangToggle } from './LangToggle'
import { MobileNavMenu } from './MobileNavMenu'

export function Navbar() {
  const t = useTranslations('Navbar')

  return (
    <nav>
      <a className="nav-logo" href="#hero">
        P<em>S</em>
      </a>

      <span className="nav-current" aria-hidden="true" />

      <ul className="nav-links">
        <li>
          <a href="#about">{t('about')}</a>
        </li>
        <li>
          <a href="#projects">{t('projects')}</a>
        </li>
      </ul>

      <div className="nav-right">
        <LangToggle />
        <span className="nav-divider" aria-hidden="true" />
        <ThemeToggle />
        <MobileNavMenu />
      </div>
    </nav>
  )
}
