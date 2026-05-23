'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

function getCurrentSectionHash(): string {
  if (typeof document === 'undefined') return ''
  const activeLink = document.querySelector<HTMLAnchorElement>('.nav-links a.active')
  const href = activeLink?.getAttribute('href') ?? ''
  return href.startsWith('#') ? href : ''
}

export function LangToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchTo = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return
    const hash = getCurrentSectionHash()
    const target = hash ? `${pathname}${hash}` : pathname
    router.replace(target, { locale: next, scroll: false })
  }

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button
        type="button"
        className={locale === 'en' ? 'lang-active' : undefined}
        onClick={() => switchTo('en')}
        aria-pressed={locale === 'en'}
      >
        <span>EN</span>
      </button>
      <button
        type="button"
        className={locale === 'ar' ? 'lang-active' : undefined}
        onClick={() => switchTo('ar')}
        aria-pressed={locale === 'ar'}
      >
        <span>AR</span>
      </button>
    </div>
  )
}
