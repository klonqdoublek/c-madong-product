import OpenAI from "openai"

let instance: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (instance) return instance

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to .env.local for RAG features."
    )
  }

  instance = new OpenAI({ apiKey })
  return instance
}

export const EMBEDDING_MODEL = "text-embedding-3-small"
export const RAG_CHAT_MODEL = "gpt-4o-mini"
