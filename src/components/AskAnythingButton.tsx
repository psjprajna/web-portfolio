'use client'

import { openChatDrawer } from '@/lib/chat-drawer'

export function AskAnythingButton() {
  return (
    <button type="button" className="btn-secondary" onClick={openChatDrawer}>
      Ask me anything ✦
    </button>
  )
}
