/**
 * One-time backfill: generate embeddings for all published announcements
 * that have no embedding yet (is_bot_searchable + status='sent').
 *
 * Run: npx tsx scripts/embed-existing-announcements.ts
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually (tsx doesn't auto-load it)
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* .env.local not found, rely on existing env */ }

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

async function run() {
  console.log("Fetching announcements without embeddings...");

  const { data: announcements, error } = await (supabase as any)
    .from("announcements")
    .select("id, title_th, title_en, content_th, content_en, ocr_text")
    .eq("status", "sent")
    .is("embedding", null);

  if (error) {
    console.error("Error fetching:", error);
    process.exit(1);
  }

  console.log(`Found ${announcements?.length ?? 0} announcements to embed.`);

  let success = 0;
  let failed = 0;

  for (const ann of announcements ?? []) {
    const text = [ann.title_th, ann.title_en, ann.content_th, ann.content_en, ann.ocr_text]
      .filter(Boolean)
      .join(" ")
      .slice(0, 8000);

    if (!text.trim()) {
      console.log(`  [skip] ${ann.id} — no text`);
      continue;
    }

    try {
      const embedding = await embed(text);
      await (supabase as any)
        .from("announcements")
        .update({ embedding: JSON.stringify(embedding), is_bot_searchable: true })
        .eq("id", ann.id);
      console.log(`  [ok] ${ann.id} — ${(ann.title_th ?? ann.title_en ?? "").slice(0, 40)}`);
      success++;
    } catch (err) {
      console.error(`  [fail] ${ann.id}:`, err);
      failed++;
    }

    // Rate limit: ~3000 RPM for text-embedding-3-small
    await new Promise((r) => setTimeout(r, 30));
  }

  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
}

run().catch(console.error);
