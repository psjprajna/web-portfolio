import { useTranslations } from 'next-intl'
import { LineageTimeline } from './LineageTimeline'
import { Arsenal } from './Arsenal'

export function About() {
  const t = useTranslations('About')
  return (
    <section id="about" className="deck-section">
      <div className="bio-section">
        <div className="bio-left">
          <h1 className="bio-heading">
            {t.rich('heading', {
              br: () => <br />,
              em: (chunks) => <em>{chunks}</em>,
            })}
          </h1>
          <blockquote className="bio-quote">{t('quote')}</blockquote>
          <p className="bio-para">{t('para1')}</p>
          <p className="bio-para">{t('para2')}</p>
        </div>

        <LineageTimeline />
      </div>

      <Arsenal />
    </section>
  )
}
