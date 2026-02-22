import { GoogleGenAI } from "@google/genai"

let instance: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
  if (instance) return instance

  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    throw new Error(
      "GOOGLE_AI_API_KEY is not set. Add it to .env.local for chatbot AI features."
    )
  }

  instance = new GoogleGenAI({ apiKey })
  return instance
}

export const GEMINI_FLASH_MODEL = "gemini-2.0-flash"
