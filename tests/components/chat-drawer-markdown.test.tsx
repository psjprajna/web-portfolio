import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import ReactMarkdown from 'react-markdown'

const ALLOWED_MD_ELEMENTS = ['p', 'strong', 'em'] as const

function ChatMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      allowedElements={[...ALLOWED_MD_ELEMENTS]}
      unwrapDisallowed
      skipHtml
    >
      {text}
    </ReactMarkdown>
  )
}

describe('ChatDrawer markdown rendering contract', () => {
  test('renders **text** as <strong>', () => {
    render(<ChatMarkdown text="See **Arabic Sentiment Analysis** for context." />)
    const strong = screen.getByText('Arabic Sentiment Analysis')
    expect(strong.tagName).toBe('STRONG')
  })

  test('renders *text* as <em>', () => {
    render(<ChatMarkdown text="She fine-tuned *AraBERT* on the *HARD benchmark*." />)
    expect(screen.getByText('AraBERT').tagName).toBe('EM')
    expect(screen.getByText('HARD benchmark').tagName).toBe('EM')
  })

  test('mixed bold + italic + plain in one sentence', () => {
    render(
      <ChatMarkdown text="Used *LoRA* — keeping params to ~1% — for **18% F1** vs CatBoost." />
    )
    expect(screen.getByText('LoRA').tagName).toBe('EM')
    expect(screen.getByText('18% F1').tagName).toBe('STRONG')
    // CatBoost stays plain prose (no emphasis wrapper).
    expect(screen.getByText(/CatBoost/).tagName).not.toBe('STRONG')
    expect(screen.getByText(/CatBoost/).tagName).not.toBe('EM')
  })

  test('strips disallowed markdown elements but preserves their text content', () => {
    render(
      <ChatMarkdown text="# A heading\n\n[a link](https://evil.example) and plain prose." />
    )
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText(/a link/)).toBeInTheDocument()
    expect(screen.getByText(/plain prose/)).toBeInTheDocument()
  })

  test('renders Arabic content with emphasis identically to English', () => {
    render(<ChatMarkdown text="استخدمت *AraBERT* للحصول على **18٪ تحسن**." />)
    expect(screen.getByText('AraBERT').tagName).toBe('EM')
    expect(screen.getByText('18٪ تحسن').tagName).toBe('STRONG')
  })
})
