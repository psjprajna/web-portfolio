'use client'

import { useTranslations } from 'next-intl'
import { openChatDrawer } from '@/lib/chat-drawer'

export function ChatFAB() {
  const t = useTranslations('ChatFAB')

  return (
    <button
      type="button"
      className="chat-fab"
      onClick={openChatDrawer}
      aria-label={t('openChatAria')}
    >
      <span className="chat-fab-pulse" aria-hidden="true" />
      <span className="chat-fab-glyph" aria-hidden="true">
        ✦
      </span>
    </button>
  )
}
