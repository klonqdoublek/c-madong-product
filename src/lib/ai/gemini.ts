// @ts-nocheck — Phase 4.5 in progress, fix TS errors when vision pipeline is finalized
/**
 * Gemini AI Client
 * Purpose: Google Gemini 2.0 Flash integration for vision analysis and chatbot
 * Provider: Google AI (cheaper alternative to OpenAI GPT-4o for vision)
 */

import { GoogleGenAI } from "@google/genai"

// =====================================================
// Singleton Client
// =====================================================
let instance: GoogleGenAI | null = null

export function getGeminiClient(): GoogleGenAI {
  if (instance) return instance

  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      "GOOGLE_AI_API_KEY is not set. Add it to .env.local for chatbot AI features."
    )
  }

  instance = new GoogleGenAI({ apiKey })
  return instance
}

export const GEMINI_FLASH_MODEL = "gemini-2.0-flash"

// =====================================================
// Repair Analysis Prompt
// =====================================================
export const REPAIR_IMAGE_ANALYSIS_PROMPT = `
คุณคือ AI ผู้เชี่ยวชาญด้านการประเมินความเสียหายและซ่อมบำรุง สำหรับหอพักนักศึกษาจุฬาลงกรณ์มหาวิทยาลัย

วิเคราะห์รูปภาพและจำแนกประเภทความเสียหายเป็น:
- plumbing: ท่อน้ำ ก๊อกน้ำ ชักโครก อ่างล้างหน้า ฝักบัว น้ำรั่ว ท่อตัน ท่อแตก น้ำไหลไม่ลง ระบบประปา ก้อกน้ำร้อน
- electrical: ปลั๊ก สวิตช์ ไฟฟ้า หลอดไฟ สายไฟ เบรกเกอร์ ช็อตไฟฟ้า ไฟไม่ติด ไฟกระพริบ ระบบไฟฟ้า
- aircon: แอร์ เครื่องปรับอากาศ ไม่เย็น เสียงดัง น้ำหยด รีโมทแอร์ ฟิลเตอร์แอร์
- furniture: เฟอร์นิเจอร์ เตียง ตู้ ประตู หน้าต่าง โต๊ะ เก้าอี้ ชั้นวาง บานพับ ลูกบิด หัก ชำรุด
- pest: แมลง หนู มด แมลงสาบ ยุง มอด ปลวก แมลงภายในห้อง สัตว์รบกวน
- internet: เน็ต WiFi อินเทอร์เน็ต สัญญาณ เน็ตช้า เน็ตไม่เข้า เน็ตขาดบ่อย เราเตอร์
- other: อื่นๆ ที่ไม่อยู่ในหมวดข้างต้น

กำหนดระดับความเร่งด่วน:
- urgent: อันตรายต่อชีวิต/ทรัพย์สิน หรือไม่สามารถอยู่อาศัยได้ (ไฟฟ้าช็อต ท่อแตก น้ำท่วม ก๊าซรั่ว ไฟไหม้)
- high: ส่งผลกระทบใช้งานทันที จำเป็นต้องแก้ไขภายในวันเดียว (แอร์เสีย ห้องน้ำใช้ไม่ได้ ไม่มีน้ำ ไม่มีไฟ)
- medium: ส่งผลกระทบบางส่วน แก้ไขภายใน 2-3 วัน (ปลั๊กหลวม เฟอร์นิเจอร์เสียหาย แอร์เสียงดัง)
- low: ไม่ส่งผลกระทบการใช้งาน แก้ไขภายใน 1 สัปดาห์ (รอยขีดข่วน สีหลุด รอยเปื้อน ความสะอาด)

ตอบกลับเป็น JSON format เท่านั้น:
{
  "category": "plumbing",
  "title": "สรุปปัญหาสั้นๆ (ไม่เกิน 50 ตัวอักษร)",
  "description": "รายละเอียดความเสียหายที่เห็นในรูป แบบ Gen-Z เป็นกันเอง (100-200 ตัวอักษร)",
  "urgency": "high",
  "damage_details": "อธิบายเฉพาะสิ่งที่เห็นในรูป เช่น รอยแตก ตำแหน่ง ขนาด สภาพ",
  "suggested_specialty": "plumbing",
  "confidence": 0.85
}

**สำคัญ:**
- ใช้ภาษาไทยแบบ Gen-Z ที่เป็นกันเอง (เหมือนพี่รุ่นพี่ช่วยน้อง) เช่น "ท่อน้ำรั่วใต้อ่างล้างหน้า มีน้ำขังเยอะเลย"
- ถ้าไม่เห็นความเสียหายชัดเจนในรูป → ให้ confidence < 0.5 และ category = "other"
- ถ้าเป็นรูปที่ไม่เกี่ยวกับการซ่อมบำรุง (เช่น รูปอาหาร ตัวคน) → confidence = 0.1, category = "other"
- ห้ามเดาหรือสรุปข้อมูลที่ไม่มีในรูป
- ตอบเป็น JSON format เท่านั้น ห้ามมีข้อความอื่นนอกจาก JSON
`.trim()

// =====================================================
// Types
// =====================================================
export interface RepairImageAnalysis {
  category: "plumbing" | "electrical" | "aircon" | "furniture" | "pest" | "internet" | "other"
  title: string
  description: string
  urgency: "low" | "medium" | "high" | "urgent"
  damage_details: string
  suggested_specialty: string
  confidence: number
  provider: "gemini" | "openai" | "template" | "text-only" | "keyword" | "fallback"
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Download image from URL and convert to base64
 */
async function downloadImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    const buffer = await response.arrayBuffer()
    return Buffer.from(buffer).toString("base64")
  } catch (error) {
    console.error("[Gemini] Failed to download image:", error)
    throw error
  }
}

/**
 * Parse Gemini response and validate structure
 */
function parseGeminiResponse(text: string): Partial<RepairImageAnalysis> {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?|\n?```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    // Validate required fields
    if (!parsed.category || !parsed.title || !parsed.description || !parsed.urgency) {
      throw new Error("Missing required fields in Gemini response")
    }

    return parsed
  } catch (error) {
    console.error("[Gemini] Failed to parse response:", text)
    throw new Error(`Invalid JSON response from Gemini: ${error}`)
  }
}

// =====================================================
// Vision Analysis Functions
// =====================================================

/**
 * Analyze repair image using Gemini 2.0 Flash
 *
 * @param imageUrl - Public URL of the image to analyze
 * @param userMessage - Optional context from user message
 * @param referenceImageUrl - Optional reference template image
 * @returns Repair analysis with category, urgency, and details
 */
export async function analyzeRepairImageGemini(
  imageUrl: string,
  userMessage?: string,
  referenceImageUrl?: string
): Promise<RepairImageAnalysis> {
  const client = getGeminiClient()

  try {
    // Build prompt parts
    const parts: any[] = [
      { text: REPAIR_IMAGE_ANALYSIS_PROMPT },
      { text: "\n\nข้อความจากผู้ใช้: " + (userMessage || "วิเคราะห์ความเสียหายในรูปนี้") }
    ]

    // Add reference image if provided (for better accuracy)
    if (referenceImageUrl) {
      const referenceBase64 = await downloadImageAsBase64(referenceImageUrl)
      parts.push({
        text: "\n\nนี่คือตัวอย่างรูปภาพประเภทเดียวกัน:"
      })
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: referenceBase64
        }
      })
    }

    // Add user's image (main analysis target)
    const userImageBase64 = await downloadImageAsBase64(imageUrl)
    parts.push({
      text: "\n\nวิเคราะห์รูปนี้:"
    })
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: userImageBase64
      }
    })

    // Generate content
    console.log("[Gemini] Analyzing image:", imageUrl)
    const response = await client.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: parts,
      config: {
        temperature: 0.3,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 500,
        responseMimeType: "application/json"
      }
    })

    const text = response.text

    // Parse and validate response
    const analysis = parseGeminiResponse(text)

    return {
      category: analysis.category!,
      title: analysis.title!,
      description: analysis.description!,
      urgency: analysis.urgency!,
      damage_details: analysis.damage_details || "",
      suggested_specialty: analysis.suggested_specialty || analysis.category!,
      confidence: analysis.confidence || 0.7,
      provider: "gemini"
    }
  } catch (error) {
    console.error("[Gemini] Analysis failed:", error)
    throw error
  }
}

/**
 * Analyze multiple images and aggregate results
 * (Picks result with highest confidence)
 */
export async function analyzeMultipleImagesGemini(
  imageUrls: string[],
  userMessage?: string
): Promise<RepairImageAnalysis> {
  if (imageUrls.length === 0) {
    throw new Error("No images provided for analysis")
  }

  if (imageUrls.length === 1) {
    return analyzeRepairImageGemini(imageUrls[0], userMessage)
  }

  // Analyze all images in parallel
  const results = await Promise.all(
    imageUrls.map((url) => analyzeRepairImageGemini(url, userMessage))
  )

  // Pick result with highest confidence
  const best = results.reduce((prev, curr) =>
    curr.confidence > prev.confidence ? curr : prev
  )

  // Merge damage_details from all analyses
  const allDetails = results
    .map((r) => r.damage_details)
    .filter(Boolean)
    .join(" | ")

  return {
    ...best,
    damage_details: allDetails || best.damage_details,
    description: `${best.description} (วิเคราะห์จาก ${imageUrls.length} รูป)`
  }
}

/**
 * Check if Gemini API is available and working
 */
export async function checkGeminiHealth(): Promise<boolean> {
  try {
    const client = getGeminiClient()
    const result = await client.generateContent({
      model: GEMINI_FLASH_MODEL,
      contents: [{ text: "test" }]
    })
    return !!result.text
  } catch (error) {
    console.error("[Gemini] Health check failed:", error)
    return false
  }
}
