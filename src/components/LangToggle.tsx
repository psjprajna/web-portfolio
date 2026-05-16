'use client'

import { useState } from 'react'

type Lang = 'en' | 'ar'

export function LangToggle() {
  const [lang, setLang] = useState<Lang>('en')

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === 'en' ? 'lang-active' : undefined}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        <span>EN</span>
      </button>
      <button
        type="button"
        className={lang === 'ar' ? 'lang-active' : undefined}
        onClick={() => setLang('ar')}
        aria-pressed={lang === 'ar'}
      >
        <span>AR</span>
      </button>
    </div>
  )
}
