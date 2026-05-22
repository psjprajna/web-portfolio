import { useTranslations } from 'next-intl'
import { CyclingPhrase } from './CyclingPhrase'
import { AskAnythingButton } from './AskAnythingButton'
import { SocialIcons } from './SocialIcons'

export function Hero() {
  const t = useTranslations('Hero')

  return (
    <section id="hero" className="deck-section">
      <div className="hero-top">
        <div className="hero-eyebrow">{t('locationPill')}</div>
        <div className="hero-availability">
          <span className="dot-green" aria-hidden="true" />
          <span>{t('availability')}</span>
        </div>
      </div>

      <h1 className="hero-name" dir="ltr">
        Prajna <em>Shetty.</em>
      </h1>

      <p className="hero-tagline">
        {t.rich('tagline', { phrase: () => <CyclingPhrase /> })}
      </p>

      <div className="hero-actions">
        <a className="btn-primary" href="#projects">
          {t('ctaPrimary')}
        </a>
        <AskAnythingButton />
      </div>

      <div className="hero-soc-block">
        <div className="hero-soc-tagline">{t('lookingFor')}</div>
        <div className="hero-soc-row">
          <SocialIcons variant="hero" />
        </div>
      </div>

      <a className="scroll-hint" href="#about" aria-label={t('scrollAria')}>
        <span>{t('scrollHint')}</span>
        <span className="scroll-line" aria-hidden="true" />
      </a>
    </section>
  )
}
