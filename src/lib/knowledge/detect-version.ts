import type { SupabaseClient } from "@supabase/supabase-js";
import { generateEmbedding } from "@/lib/chatbot/rag/embeddings";

export interface VersionMatch {
  parentId: string;
  parentTitle: string;
  parentVersion: number;
  matchType: "filename" | "content";
  confidence: number;
}

export interface DetectVersionInput {
  filename: string;
  content: string;
  currentDocumentId: string;
  supabase: SupabaseClient;
}

/** Strip extension, lowercase, trim */
function normalizeFilename(name: string): string {
  const noExt = name.includes(".") ? name.replace(/\.[^.]+$/, "") : name;
  return noExt.toLowerCase().trim();
}

/**
 * Detect if the uploaded document is a version of an existing one.
 *
 * 1. Exact filename match (case-insensitive, extension stripped)
 * 2. Content similarity ≥ 0.85 (embedding cosine) via match_documents RPC
 *
 * Returns the strongest match or null if no match.
 */
export async function detectVersion(
  input: DetectVersionInput
): Promise<VersionMatch | null> {
  const { filename, content, currentDocumentId, supabase } = input;

  // ── 1. Filename match ────────────────────────────────────────
  const normalized = normalizeFilename(filename);
  if (normalized) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: filenameMatches } = await (supabase as any)
      .from("documents")
      .select("id, title, filename, version_number")
      .eq("is_current", true)
      .neq("id", currentDocumentId)
      .limit(20);

    if (filenameMatches) {
      const hit = (
        filenameMatches as Array<{
          id: string;
          title: string | null;
          filename: string | null;
          version_number: number;
        }>
      ).find((d) => {
        const title = normalizeFilename(d.title ?? "");
        const fname = normalizeFilename(d.filename ?? "");
        return title === normalized || fname === normalized;
      });

      if (hit) {
        return {
          parentId: hit.id,
          parentTitle: hit.title ?? hit.filename ?? "(ไม่มีชื่อ)",
          parentVersion: hit.version_number,
          matchType: "filename",
          confidence: 1,
        };
      }
    }
  }

  // ── 2. Content similarity match ──────────────────────────────
  if (!content || content.length < 100) return null;

  try {
    const summary = content.slice(0, 2000);
    const embedding = await generateEmbedding(summary);

    const { data: sections } = await supabase.rpc("match_documents", {
      query_embedding: JSON.stringify(embedding),
      match_count: 20,
      match_threshold: 0.75,
    });

    if (!sections || sections.length === 0) return null;

    // Group by document_id, compute avg similarity
    const grouped = new Map<
      string,
      { title: string; total: number; count: number }
    >();
    for (const row of sections as Array<{
      document_id: string;
      document_title: string;
      similarity: number;
    }>) {
      if (row.document_id === currentDocumentId) continue;
      const existing = grouped.get(row.document_id);
      if (existing) {
        existing.total += row.similarity;
        existing.count += 1;
      } else {
        grouped.set(row.document_id, {
          title: row.document_title ?? "(ไม่มีชื่อ)",
          total: row.similarity,
          count: 1,
        });
      }
    }

    let bestId: string | null = null;
    let bestAvg = 0;
    let bestTitle = "";
    for (const [docId, info] of grouped.entries()) {
      const avg = info.total / info.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestId = docId;
        bestTitle = info.title;
      }
    }

    if (!bestId || bestAvg < 0.85) return null;

    // Fetch version_number for the matched doc
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: matchedDoc } = await (supabase as any)
      .from("documents")
      .select("id, title, version_number, is_current")
      .eq("id", bestId)
      .single();

    if (!matchedDoc || !matchedDoc.is_current) return null;

    return {
      parentId: bestId,
      parentTitle: bestTitle || matchedDoc.title || "(ไม่มีชื่อ)",
      parentVersion: matchedDoc.version_number ?? 1,
      matchType: "content",
      confidence: bestAvg,
    };
  } catch (err) {
    console.error("[detect-version] Content match failed:", err);
    return null;
  }
}
