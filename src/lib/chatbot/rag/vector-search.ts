import { createAdminClient } from "@/lib/supabase/admin"
import { generateEmbedding } from "./embeddings"

export interface SearchResult {
  source_type: "document" | "announcement"
  source_id: string
  document_title: string
  content: string
  cover_image: string | null
  similarity: number
  metadata: Record<string, unknown>
}

/**
 * Search for relevant content using pgvector cosine similarity.
 * Queries match_documents RPC which UNIONs knowledge documents + announcements.
 */
export async function searchDocuments(
  query: string,
  matchCount: number = 8,
  matchThreshold: number = 0.2
): Promise<SearchResult[]> {
  const supabase = createAdminClient()
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: JSON.stringify(embedding),
    match_count: matchCount,
    match_threshold: matchThreshold,
  })

  if (error) {
    console.error("[RAG] Vector search error:", error)
    return []
  }

  return (data ?? []) as unknown as SearchResult[]
}
