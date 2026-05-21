import { VoyageAIClient } from 'voyageai'
import { env } from '@/lib/env'

const VOYAGE_MODEL = 'voyage-3'
const EXPECTED_DIMS = 1024

export async function createEmbedding(text: string): Promise<number[] | null> {
  if (!env.VOYAGE_API_KEY) {
    console.error('createEmbedding: VOYAGE_API_KEY is not configured')
    return null
  }

  try {
    const client = new VoyageAIClient({ apiKey: env.VOYAGE_API_KEY })
    const result = await client.embed({ input: text, model: VOYAGE_MODEL })
    const embedding = result.data?.[0]?.embedding
    if (!embedding || embedding.length !== EXPECTED_DIMS) return null
    return embedding
  } catch (err) {
    console.error('createEmbedding error:', err)
    return null
  }
}
