'use client'

import { useTranslations } from 'next-intl'
import { openChatDrawer } from '@/lib/chat-drawer'

export function AskAnythingButton() {
  const t = useTranslations('Hero')

  return (
    <button type="button" className="btn-secondary" onClick={openChatDrawer}>
      {t('ctaSecondary')}
    </button>
  )
}
