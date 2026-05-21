'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { CHAT_OPEN_EVENT, closeChatDrawer } from '@/lib/chat-drawer'

const SUGGESTIONS = [
  'How did you build the UAE Government Policy RAG system?',
  'What did you do at Scale AI?',
  'Tell me about your Arabic NLP work',
  'Where are you based and available for work?',
]

interface Source {
  source: 'bio' | 'resume' | 'project'
  title: string
  score: number
}

interface Turn {
  role: 'user' | 'assistant'
  text: string
}

const HISTORY_MAX_TURNS = 6

interface UserMessage {
  id: number
  role: 'user'
  text: string
}

interface AiMessage {
  id: number
  role: 'ai'
  text: string
  sources: Source[]
  refused: boolean
  isStreaming: boolean
  errored: boolean
}

type Message = UserMessage | AiMessage

type SseEvent =
  | { type: 'token'; text: string }
  | { type: 'meta'; sources: Source[]; refused: boolean }
  | { type: 'done' }
  | { type: 'error' }

export function ChatDrawer() {
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const transcriptRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const messageIdRef = useRef(0)

  const handleClose = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    closeChatDrawer()
  }, [])

  useEffect(() => {
    function onOpen() {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && document.body.classList.contains('chat-open')) {
        handleClose()
      }
    }
    document.addEventListener(CHAT_OPEN_EVENT, onOpen)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener(CHAT_OPEN_EVENT, onOpen)
      document.removeEventListener('keydown', onKey)
    }
  }, [handleClose])

  // Auto-scroll transcript to bottom on every new token / message
  useEffect(() => {
    const el = transcriptRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  const sendQuery = useCallback(
    async (queryRaw: string) => {
      const query = queryRaw.trim()
      if (!query || isSending) return

      // Build conversation memory from completed, non-errored prior pairs.
      // Capped at last HISTORY_MAX_TURNS turns to bound prompt size + cost.
      const turnHistory: Turn[] = []
      for (let i = 0; i + 1 < messages.length; i += 2) {
        const u = messages[i]
        const a = messages[i + 1]
        if (!u || !a || u.role !== 'user' || a.role !== 'ai') continue
        if (a.isStreaming || a.errored) continue
        turnHistory.push(
          { role: 'user', text: u.text },
          { role: 'assistant', text: a.text }
        )
      }
      const history = turnHistory.slice(-HISTORY_MAX_TURNS)

      const userId = ++messageIdRef.current
      const aiId = ++messageIdRef.current
      setMessages((prev) => [
        ...prev,
        { id: userId, role: 'user', text: query },
        { id: aiId, role: 'ai', text: '', sources: [], refused: false, isStreaming: true, errored: false },
      ])
      setValue('')
      setIsSending(true)

      const controller = new AbortController()
      abortRef.current = controller

      const updateAi = (mutator: (msg: AiMessage) => AiMessage) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId && m.role === 'ai' ? mutator(m) : m))
        )
      }

      try {
        const res = await fetch('/api/ai/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(history.length > 0 ? { query, history } : { query }),
          signal: controller.signal,
        })
        if (!res.ok || !res.body) {
          updateAi((m) => ({ ...m, text: 'Something went wrong. Try again.', isStreaming: false, errored: true }))
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        outer: while (true) {
          const { done, value: chunk } = await reader.read()
          if (done) break
          buffer += decoder.decode(chunk, { stream: true })
          // SSE events are delimited by blank lines
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''
          for (const part of parts) {
            for (const line of part.split('\n')) {
              if (!line.startsWith('data: ')) continue
              const payload = line.slice('data: '.length).trim()
              if (!payload) continue
              let event: SseEvent
              try {
                event = JSON.parse(payload) as SseEvent
              } catch {
                continue
              }
              if (event.type === 'token') {
                updateAi((m) => ({ ...m, text: m.text + event.text }))
              } else if (event.type === 'meta') {
                updateAi((m) => ({ ...m, sources: event.sources, refused: event.refused }))
              } else if (event.type === 'done') {
                updateAi((m) => ({ ...m, isStreaming: false }))
                break outer
              } else if (event.type === 'error') {
                updateAi((m) => ({ ...m, isStreaming: false, errored: true, text: m.text || 'Something went wrong.' }))
                break outer
              }
            }
          }
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          updateAi((m) => ({ ...m, isStreaming: false, errored: true, text: m.text || 'Something went wrong.' }))
        } else {
          updateAi((m) => ({ ...m, isStreaming: false }))
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null
        setIsSending(false)
      }
    },
    [isSending, messages]
  )

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void sendQuery(value)
  }

  const isEmptyTranscript = messages.length === 0

  return (
    <>
      <div className="chat-backdrop" onClick={handleClose} aria-hidden="true" />
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
              Grounded answers about projects, the timeline, and skills — streamed from Claude.
            </p>
          </div>
          <button type="button" className="chat-close" onClick={handleClose} aria-label="Close chat">
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

        <div className="chat-body" ref={transcriptRef}>
          {isEmptyTranscript ? (
            <>
              <div className="chat-welcome">
                <span className="chat-welcome-eyebrow">Welcome</span>
                <p className="chat-welcome-line">
                  Ask anything about Prajna&rsquo;s AI work — projects, lineage, skills. Answers are streamed token-by-token, citing the source they came from.
                </p>
              </div>
              <span className="chat-suggestions-label">Try one of these</span>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="chat-chip"
                    onClick={() => {
                      void sendQuery(suggestion)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div
              className="chat-transcript"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-busy={isSending}
            >
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="chat-msg chat-msg-user">
                    {m.text}
                  </div>
                ) : (
                  <div key={m.id} className="chat-msg-ai-group">
                    <div
                      className={`chat-msg chat-msg-ai${m.refused ? ' chat-msg-refused' : ''}${m.errored ? ' chat-msg-errored' : ''}`}
                      aria-hidden={m.isStreaming || undefined}
                      {...((m.refused || m.errored) && !m.isStreaming
                        ? { role: 'status' as const }
                        : {})}
                    >
                      {m.text}
                      {m.isStreaming && <span className="chat-cursor" aria-hidden="true">▍</span>}
                    </div>
                    {!m.isStreaming && <span className="sr-only">{m.text}</span>}
                    {!m.isStreaming && !m.refused && m.sources.length > 0 && (() => {
                      const seen = new Set<string>()
                      const dedup: Source[] = []
                      for (const s of m.sources) {
                        const key = `${s.source}::${s.title}`
                        if (seen.has(key)) continue
                        seen.add(key)
                        dedup.push(s)
                        if (dedup.length === 2) break
                      }
                      return (
                        <div className="chat-sources" aria-label="Sources">
                          <span className="chat-sources-label">
                            {dedup.length > 1 ? 'Sources' : 'Source'}:
                          </span>
                          {dedup.map((s, i) => (
                            <span key={`${m.id}-${i}`} className="chat-source-ref">
                              {' '}
                              {s.source} · {s.title}
                              {i < dedup.length - 1 ? ',' : ''}
                            </span>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <form className="chat-input-row" onSubmit={onSubmit} suppressHydrationWarning>
          <input
            ref={inputRef}
            className="chat-input"
            placeholder="Ask anything…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Chat message"
            disabled={isSending}
            suppressHydrationWarning
          />
          <button
            type="submit"
            className="chat-send"
            aria-label="Send"
            disabled={isSending || value.trim().length < 3}
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>
      </aside>
    </>
  )
}
