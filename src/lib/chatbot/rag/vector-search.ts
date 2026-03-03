import { createAdminClient } from "@/lib/supabase/admin"
import { generateEmbedding } from "./embeddings"

interface SearchResult {
  content: string
  similarity: number
  document_title: string
}

/**
 * Search for relevant document sections using pgvector cosine similarity.
 * Calls the match_documents RPC function.
 */
export async function searchDocuments(
  query: string,
  matchCount: number = 5,
  matchThreshold: number = 0.3
): Promise<SearchResult[]> {
  const supabase = createAdminClient()
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: matchCount,
    match_threshold: matchThreshold,
  })

  if (error) {
    console.error("[RAG] Vector search error:", error)
    return []
  }

  return (data ?? []) as unknown as SearchResult[]
}
