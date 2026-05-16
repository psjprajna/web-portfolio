'use client'

import { openChatDrawer } from '@/lib/chat-drawer'

export function ChatFAB() {
  return (
    <button
      type="button"
      className="chat-fab"
      onClick={openChatDrawer}
      aria-label="Open chat"
    >
      <span className="chat-fab-pulse" aria-hidden="true" />
      <span className="chat-fab-glyph" aria-hidden="true">
        ✦
      </span>
    </button>
  )
}
