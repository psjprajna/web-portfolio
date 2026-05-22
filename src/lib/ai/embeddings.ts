import { env } from '@/lib/env'

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-3'
const EXPECTED_DIMS = 1024

interface VoyageEmbeddingResponse {
  data?: Array<{ embedding?: number[]; index?: number }>
}

// Voyage returns embeddings in input order. Batching collapses N HTTP calls
// into 1 — critical for the free tier (3 RPM), where parallel Promise.all
// against per-chunk calls 429s most requests.
export async function createEmbeddings(
  texts: string[]
): Promise<Array<number[] | null>> {
  if (!env.VOYAGE_API_KEY) {
    console.error('createEmbeddings: VOYAGE_API_KEY is not configured')
    return texts.map(() => null)
  }

  if (texts.length === 0) return []

  try {
    const response = await fetch(VOYAGE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: texts, model: VOYAGE_MODEL }),
    })

    if (!response.ok) {
      console.error(`createEmbeddings: HTTP ${response.status}`)
      return texts.map(() => null)
    }

    const body = (await response.json()) as VoyageEmbeddingResponse
    const items = body.data ?? []
    return texts.map((_, i) => {
      const emb = items[i]?.embedding
      if (!emb || emb.length !== EXPECTED_DIMS) return null
      return emb
    })
  } catch (err) {
    console.error('createEmbeddings error:', err)
    return texts.map(() => null)
  }
}

export async function createEmbedding(text: string): Promise<number[] | null> {
  const [result] = await createEmbeddings([text])
  return result ?? null
}
