import { CyclingPhrase } from './CyclingPhrase'
import { AskAnythingButton } from './AskAnythingButton'
import { SocialIcons } from './SocialIcons'

export function Hero() {
  return (
    <section id="hero" className="deck-section">
      <div className="hero-top">
        <div className="hero-eyebrow">Dubai, UAE</div>
        <div className="hero-availability">
          <span className="dot-green" aria-hidden="true" />
          <span>Available for work</span>
        </div>
      </div>

      <h1 className="hero-name">
        Prajna <em>Shetty.</em>
      </h1>

      <p className="hero-tagline">
        AI/ML Engineer building <CyclingPhrase /> for production — 3+ years across U.S.
        federal AI (NHTSA) and OpenAI frontier-model training at Scale AI.
      </p>

      <div className="hero-actions">
        <a className="btn-primary" href="#projects">
          See my work →
        </a>
        <AskAnythingButton />
      </div>

      <div className="hero-soc-block">
        <div className="hero-soc-tagline">Looking for my next AI engineering role.</div>
        <div className="hero-soc-row">
          <SocialIcons variant="hero" />
        </div>
      </div>

      <a className="scroll-hint" href="#about" aria-label="Scroll to About">
        <span>Scroll</span>
        <span className="scroll-line" aria-hidden="true" />
      </a>
    </section>
  )
}
