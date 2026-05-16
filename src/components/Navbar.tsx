import { ThemeToggle } from './ThemeToggle'
import { LangToggle } from './LangToggle'
import { MobileNavMenu } from './MobileNavMenu'

export function Navbar() {
  return (
    <nav>
      <a className="nav-logo" href="#hero">
        PS
      </a>

      <span className="nav-current" aria-hidden="true" />

      <ul className="nav-links">
        <li>
          <a href="#about">About</a>
        </li>
        <li>
          <a href="#projects">Projects</a>
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
