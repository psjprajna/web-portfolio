import { env } from '@/lib/env'

const VOYAGE_URL = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-3'
const EXPECTED_DIMS = 1024

interface VoyageEmbeddingResponse {
  data?: Array<{ embedding?: number[] }>
}

export async function createEmbedding(text: string): Promise<number[] | null> {
  if (!env.VOYAGE_API_KEY) {
    console.error('createEmbedding: VOYAGE_API_KEY is not configured')
    return null
  }

  try {
    const response = await fetch(VOYAGE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text, model: VOYAGE_MODEL }),
    })

    if (!response.ok) {
      console.error(`createEmbedding: HTTP ${response.status}`)
      return null
    }

    const body = (await response.json()) as VoyageEmbeddingResponse
    const embedding = body.data?.[0]?.embedding
    if (!embedding || embedding.length !== EXPECTED_DIMS) return null
    return embedding
  } catch (err) {
    console.error('createEmbedding error:', err)
    return null
  }
}
