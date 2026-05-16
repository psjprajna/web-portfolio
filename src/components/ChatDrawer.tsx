'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CHAT_OPEN_EVENT, closeChatDrawer } from '@/lib/chat-drawer'

const SUGGESTIONS = [
  'What did you build at Presight AI?',
  'Walk me through your RAG architecture',
  'Which projects scaled past 10k daily users?',
  'Are you open to relocation in the GCC?',
]

export function ChatDrawer() {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleClose = useCallback(() => {
    closeChatDrawer()
  }, [])

  useEffect(() => {
    function onOpen() {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && document.body.classList.contains('chat-open')) {
        closeChatDrawer()
      }
    }
    document.addEventListener(CHAT_OPEN_EVENT, onOpen)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener(CHAT_OPEN_EVENT, onOpen)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <>
      <div
        className="chat-backdrop"
        onClick={handleClose}
        aria-hidden="true"
      />
      <aside className="chat-drawer" aria-label="Chat with Prajna">
        <header className="chat-header">
          <div className="chat-header-text">
            <div className="chat-title-row">
              <span className="chat-glyph" aria-hidden="true">
                ✦
              </span>
              <h3 className="chat-title">Ask Prajna</h3>
            </div>
            <p className="chat-subtitle">
              Ask about projects, the timeline, hiring availability — or just say hi.
            </p>
          </div>
          <button
            type="button"
            className="chat-close"
            onClick={handleClose}
            aria-label="Close chat"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="chat-body">
          <div className="chat-welcome">
            <span className="chat-welcome-eyebrow">Welcome</span>
            <p className="chat-welcome-line">
              I’m a portfolio chat — wired to Claude in Phase 4. For now, try a suggestion
              below to see the flow.
            </p>
          </div>

          <span className="chat-suggestions-label">Try</span>
          <div className="chat-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="chat-chip"
                onClick={() => {
                  setValue(suggestion)
                  inputRef.current?.focus()
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form
          className="chat-input-row"
          onSubmit={(e) => {
            e.preventDefault()
            // No backend yet — Phase 4 wires this to /api/ai/rag.
          }}
          suppressHydrationWarning
        >
          <input
            ref={inputRef}
            className="chat-input"
            placeholder="Ask anything…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Chat message"
            suppressHydrationWarning
          />
          <button type="submit" className="chat-send" aria-label="Send">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>
      </aside>
    </>
  )
}
