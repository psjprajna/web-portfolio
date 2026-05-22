import { useTranslations } from 'next-intl'
import { SocialIcons } from './SocialIcons'

export function Footer() {
  const t = useTranslations('Footer')

  return (
    <footer>
      <div className="footer-name">Prajna Shetty</div>
      <div className="footer-icons">
        <SocialIcons variant="footer" />
      </div>
      <div className="footer-right">{t('location')}</div>
    </footer>
  )
}
