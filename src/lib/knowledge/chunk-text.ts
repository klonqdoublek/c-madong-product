/**
 * Sentence-aware text chunking for Thai + English documents.
 * Splits at sentence boundaries instead of arbitrary character positions.
 */

/** Thai and general sentence boundary patterns */
const SENTENCE_BOUNDARIES = /(?<=[.!?\n\r])\s+|(?<=\n)\s*/g

/**
 * Split text into sentences respecting Thai/English boundaries.
 * Falls back to newline splitting, then naive chunking.
 */
function splitSentences(text: string): string[] {
  // First try splitting on newlines and sentence-ending punctuation
  const parts = text.split(SENTENCE_BOUNDARIES).filter((s) => s.trim().length > 0)
  if (parts.length > 1) return parts

  // Fallback: split on newlines only
  const lines = text.split(/\n+/).filter((s) => s.trim().length > 0)
  if (lines.length > 1) return lines

  // No boundaries found — return as single block
  return [text]
}

/**
 * Sentence-boundary-aware chunking.
 * - Aggregates sentences until maxChunkSize is reached
 * - Keeps overlap as trailing sentences from previous chunk
 * - Falls back to naive chunking if sentence splitting fails
 */
export function chunkText(
  text: string,
  maxChunkSize = 800,
  overlapSize = 100
): string[] {
  if (!text || text.trim().length === 0) return []

  const sentences = splitSentences(text)

  // If only 1 sentence and it's longer than maxChunkSize, use naive chunking
  if (sentences.length === 1 && sentences[0].length > maxChunkSize) {
    return naiveChunkText(text, maxChunkSize, overlapSize)
  }

  const chunks: string[] = []
  let currentChunk = ""
  let overlapBuffer = "" // trailing text from previous chunk

  for (const sentence of sentences) {
    const candidate = currentChunk ? `${currentChunk} ${sentence}` : sentence

    if (candidate.length > maxChunkSize && currentChunk.length > 0) {
      // Current chunk is full — save it
      chunks.push(currentChunk.trim())

      // Build overlap from end of current chunk
      overlapBuffer =
        currentChunk.length > overlapSize
          ? currentChunk.slice(-overlapSize)
          : currentChunk

      // Start new chunk with overlap + current sentence
      currentChunk = overlapBuffer ? `${overlapBuffer} ${sentence}` : sentence
    } else {
      currentChunk = candidate
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

/** Naive fixed-size chunking (fallback) */
export function naiveChunkText(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
  }
  return chunks
}
