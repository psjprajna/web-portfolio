'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export function LangToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchTo = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return
    router.replace(pathname, { locale: next })
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
