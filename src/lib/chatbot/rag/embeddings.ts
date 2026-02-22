import { getOpenAIClient, EMBEDDING_MODEL } from "@/lib/ai/openai"

/** Generate embedding vector for a text using OpenAI text-embedding-3-small */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAIClient()

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })

  return response.data[0].embedding
}
