import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted lets us reference `messagesCreate` inside the vi.mock factory
// below. Without it, Vitest's hoisting of vi.mock to the top of the file
// would put the factory above the variable declaration → ReferenceError.
const { messagesCreate } = vi.hoisted(() => ({
  messagesCreate: vi.fn(),
}))

vi.mock('@/lib/env', () => ({
  env: { ANTHROPIC_API_KEY: 'sk-ant-test' },
}))

// Class form (not arrow factory): Anthropic SDK is instantiated as `new Anthropic(...)`,
// and vi.fn() arrow mocks lack the [[Construct]] slot. A class with an instance field
// satisfies the `new` call while letting us drive responses via messagesCreate.
vi.mock('@anthropic-ai/sdk', () => {
  class MockAnthropic {
    messages = { create: messagesCreate }
  }
  return { default: MockAnthropic }
})

import { expandQuery } from '@/lib/ai/synthesize'

function mockHaikuResponse(text: string) {
  messagesCreate.mockResolvedValueOnce({
    content: [{ type: 'text', text }],
  })
}

describe('expandQuery — sentinel detection (Slice 4.2f.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns [trimmed] alone when Haiku outputs the NO_REWRITE sentinel', async () => {
    mockHaikuResponse('NO_REWRITE')
    const result = await expandQuery('weather in tokyo tomorrow')
    expect(result).toEqual(['weather in tokyo tomorrow'])
    expect(result).toHaveLength(1)
  })

  it('returns [trimmed, r1, r2, r3] when Haiku produces 3 valid rewrites', async () => {
    mockHaikuResponse(
      'Prajna Shetty AI ML engineer Dubai experience\n' +
        'Prajna machine learning projects portfolio\n' +
        'Prajna current role technical skills'
    )
    const result = await expandQuery('tell me about your work')
    expect(result).toHaveLength(4)
    expect(result[0]).toBe('tell me about your work')
    expect(result[1]).toBe('Prajna Shetty AI ML engineer Dubai experience')
    expect(result[2]).toBe('Prajna machine learning projects portfolio')
    expect(result[3]).toBe('Prajna current role technical skills')
  })

  it('returns [] for whitespace-only input without calling Anthropic', async () => {
    const result = await expandQuery('   ')
    expect(result).toEqual([])
    expect(messagesCreate).not.toHaveBeenCalled()
  })

  it('returns [trimmed] when Anthropic SDK rejects (F10 fallback path)', async () => {
    messagesCreate.mockRejectedValueOnce(new Error('overloaded_error'))
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await expandQuery('what did you do at scale ai')
    expect(result).toEqual(['what did you do at scale ai'])
    expect(consoleWarnSpy).toHaveBeenCalled()
    consoleWarnSpy.mockRestore()
  })

  it('treats first-line NO_REWRITE as refusal even if prose follows on later lines', async () => {
    mockHaikuResponse('NO_REWRITE\nactually wait let me reconsider this query')
    const result = await expandQuery('how to bake sourdough starter')
    expect(result).toEqual(['how to bake sourdough starter'])
    expect(result).toHaveLength(1)
  })
})
