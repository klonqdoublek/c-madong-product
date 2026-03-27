/**
 * Seed Script: Repair Templates
 * Purpose: Generate embeddings for initial template images and populate repair_templates table
 * Usage: bun run scripts/seed-repair-templates.ts
 */

import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_FALLBACK
})

// =====================================================
// Initial Template Data
// =====================================================
const INITIAL_TEMPLATES = [
  // Plumbing (6 templates) - Using placeholder images for quick testing
  {
    category: "plumbing",
    title: "ท่อน้ำรั่วใต้อ่าง",
    description: "น้ำรั่วจากข้อต่อท่อใต้อ่างล้างหน้า มีน้ำขังใต้ตู้",
    image_url: "https://placehold.co/600x400/3498db/ffffff/png?text=Plumbing+Leak"
  },
  {
    category: "plumbing",
    title: "ชักโครกอุดตัน",
    description: "น้ำไหลไม่ลง กดชักโครกแล้วน้ำขึ้น มีกลิ่นเหม็น",
    image_url: "https://placehold.co/600x400/3498db/ffffff/png?text=Toilet+Clog"
  },
  {
    category: "plumbing",
    title: "ก้อนน้ำร้อนเสีย",
    description: "น้ำร้อนไม่ออก ไฟไม่ติด หรือมีกลิ่นไหม้",
    image_url: "https://placehold.co/600x400/3498db/ffffff/png?text=Water+Heater"
  },
  {
    category: "plumbing",
    title: "ฝักบัวหัก",
    description: "ฝักบัวหัก น้ำรั่ว หรือสายฝักบัวชำรุด",
    image_url: "https://placehold.co/600x400/3498db/ffffff/png?text=Shower+Broken"
  },
  {
    category: "plumbing",
    title: "ท่อน้ำทิ้งอุดตัน",
    description: "อ่างล้างหน้าระบายน้ำช้า น้ำขัง",
    image_url: "https://placehold.co/600x400/3498db/ffffff/png?text=Drain+Clog"
  },
  {
    category: "plumbing",
    title: "ก๊อกน้ำเสีย",
    description: "ก๊อกน้ำหมุนไม่ได้ น้ำรั่ว หรือปิดไม่สนิท",
    image_url: "https://placehold.co/600x400/3498db/ffffff/png?text=Faucet+Leak"
  },

  // Electrical (5 templates)
  {
    category: "electrical",
    title: "ปลั๊กไฟหลวม",
    description: "ปลั๊กไฟหลวม เสียบแล้วไม่มีไฟ หรือมีประกายไฟ",
    image_url: "https://placehold.co/600x400/e74c3c/ffffff/png?text=Socket+Loose"
  },
  {
    category: "electrical",
    title: "สวิตช์ไฟเสีย",
    description: "สวิตช์เปิดไฟไม่ติด หรือเปิดไม่ได้",
    image_url: "https://placehold.co/600x400/e74c3c/ffffff/png?text=Switch+Broken"
  },
  {
    category: "electrical",
    title: "หลอดไฟเสีย",
    description: "หลอดไฟไม่ติด กระพริบ หรือสว่างไม่เต็มที่",
    image_url: "https://placehold.co/600x400/e74c3c/ffffff/png?text=Light+Broken"
  },
  {
    category: "electrical",
    title: "เบรกเกอร์ดับ",
    description: "ไฟตัดทั้งห้อง เบรกเกอร์กระโดด",
    image_url: "https://placehold.co/600x400/e74c3c/ffffff/png?text=Breaker+Trip"
  },
  {
    category: "electrical",
    title: "สายไฟชำรุด",
    description: "สายไฟชำรุด หุ้มฉนวนหลุด หรือมีกลิ่นไหม้",
    image_url: "https://placehold.co/600x400/e74c3c/ffffff/png?text=Wire+Damaged"
  },

  // Air Conditioning (4 templates)
  {
    category: "aircon",
    title: "แอร์ไม่เย็น",
    description: "แอร์เปิดแล้วไม่เย็น ลมออกแต่อุณหภูมิไม่ลง",
    image_url: "https://placehold.co/600x400/9b59b6/ffffff/png?text=AC+Not+Cooling"
  },
  {
    category: "aircon",
    title: "แอร์เสียงดัง",
    description: "แอร์มีเสียงดัง เสียงผิดปกติ หรือสั่นสะเทือน",
    image_url: "https://placehold.co/600x400/9b59b6/ffffff/png?text=AC+Noisy"
  },
  {
    category: "aircon",
    title: "แอร์น้ำหยด",
    description: "แอร์น้ำหยด น้ำไหลออกจากตัวเครื่อง",
    image_url: "https://placehold.co/600x400/9b59b6/ffffff/png?text=AC+Leaking"
  },
  {
    category: "aircon",
    title: "รีโมทแอร์เสีย",
    description: "รีโมทแอร์กดไม่ติด แบตหมด หรือสัญญาณไม่รับ",
    image_url: "https://placehold.co/600x400/9b59b6/ffffff/png?text=AC+Remote"
  },

  // Furniture (3 templates)
  {
    category: "furniture",
    title: "เตียงหัก",
    description: "เตียงหัก ขาหัก หรือโครงเตียงชำรุด",
    image_url: "https://placehold.co/600x400/f39c12/ffffff/png?text=Bed+Broken"
  },
  {
    category: "furniture",
    title: "ประตูห้องเสีย",
    description: "ประตูเปิดไม่ได้ ปิดไม่สนิท ลูกบิดหัก หรือบานพับหลุด",
    image_url: "https://placehold.co/600x400/f39c12/ffffff/png?text=Door+Broken"
  },
  {
    category: "furniture",
    title: "ตู้เสื้อผ้าชำรุด",
    description: "ประตูตู้หลุด ลิ้นชักเปิดไม่ได้ หรือชั้นวางหัก",
    image_url: "https://placehold.co/600x400/f39c12/ffffff/png?text=Wardrobe+Broken"
  },

  // Pest Control (2 templates)
  {
    category: "pest",
    title: "มีมด",
    description: "พบมดเป็นจำนวนมากในห้อง มีรังมด",
    image_url: "https://placehold.co/600x400/16a085/ffffff/png?text=Ants"
  },
  {
    category: "pest",
    title: "มีแมลงสาบ",
    description: "พบแมลงสาบในห้อง ห้องน้ำ หรือครัว",
    image_url: "https://placehold.co/600x400/16a085/ffffff/png?text=Cockroach"
  }
]

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate embedding for text description
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float"
  })

  return response.data[0].embedding
}

/**
 * Insert template into database
 */
async function insertTemplate(template: typeof INITIAL_TEMPLATES[0]) {
  // Generate embedding from category + title + description
  const embeddingText = `${template.category}: ${template.title}. ${template.description}`
  console.log(`Generating embedding for: ${template.title}`)

  const embedding = await generateEmbedding(embeddingText)

  // Insert to Supabase
  const { data, error } = await supabase
    .from("repair_templates")
    .insert({
      category: template.category,
      title: template.title,
      description: template.description,
      image_url: template.image_url,
      embedding: embedding
    })
    .select("id, title")
    .single()

  if (error) {
    console.error(`❌ Failed to insert template: ${template.title}`, error)
    throw error
  }

  console.log(`✅ Inserted: ${data.title} (${data.id})`)
  return data
}

// =====================================================
// Main Seeding Function
// =====================================================
async function seedTemplates() {
  console.log("🌱 Starting repair templates seeding...")
  console.log(`📊 Total templates to seed: ${INITIAL_TEMPLATES.length}`)
  console.log("")

  let successCount = 0
  let failCount = 0

  for (const template of INITIAL_TEMPLATES) {
    try {
      await insertTemplate(template)
      successCount++
    } catch (error) {
      failCount++
      console.error(`Failed: ${template.title}`)
    }
  }

  console.log("")
  console.log("=".repeat(50))
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📊 Total: ${INITIAL_TEMPLATES.length}`)
  console.log("=".repeat(50))

  // Verify templates
  const { count } = await supabase
    .from("repair_templates")
    .select("*", { count: "exact", head: true })

  console.log(`\n🔍 Total templates in database: ${count}`)

  // Test vector search
  console.log("\n🧪 Testing vector search...")
  const testEmbedding = await generateEmbedding("ท่อน้ำรั่ว")

  const { data: matches, error } = await supabase.rpc("match_repair_templates", {
    query_embedding: testEmbedding,
    match_threshold: 0.85,
    match_count: 3
  })

  if (error) {
    console.error("❌ Vector search test failed:", error)
  } else {
    console.log(`✅ Vector search working! Found ${matches?.length || 0} matches:`)
    matches?.forEach((match: { title: string; similarity: number }, i: number) => {
      console.log(`  ${i + 1}. ${match.title} (similarity: ${match.similarity.toFixed(3)})`)
    })
  }
}

// =====================================================
// CLI Execution
// =====================================================
async function main() {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
    }
    if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY_FALLBACK) {
      throw new Error("Missing OPENAI_API_KEY environment variable")
    }

    await seedTemplates()
    process.exit(0)
  } catch (error) {
    console.error("\n💥 Seeding failed:", error)
    process.exit(1)
  }
}

main()
