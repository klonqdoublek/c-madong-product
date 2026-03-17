// @ts-nocheck — Phase 4.5 in progress, fix TS errors when vision pipeline is finalized
/**
 * Vision Agent
 * Purpose: Multi-provider AI vision analysis for repair images
 * Strategy: Template matching → Gemini Flash → GPT-4o → Keyword fallback
 */

import { analyzeRepairImageGemini, type RepairImageAnalysis } from "../gemini"
import { getOpenAIClient } from "../openai"
import { createAdminClient } from "@/lib/supabase/admin"
import { REPAIR_CATEGORIES, detectRepairCategory } from "@/lib/chatbot/constants"
import { REPAIR_IMAGE_ANALYSIS_PROMPT } from "../gemini"

// =====================================================
// Configuration
// =====================================================
export interface VisionAgentConfig {
  primaryProvider: "gemini" | "openai"
  fallbackProvider?: "gemini" | "openai"
  useTemplateMatching: boolean
  templateMatchThreshold: number
  confidenceThreshold: number
}

const DEFAULT_CONFIG: VisionAgentConfig = {
  primaryProvider: "gemini",
  fallbackProvider: "openai",
  useTemplateMatching: true,
  templateMatchThreshold: 0.85,
  confidenceThreshold: 0.7
}

// =====================================================
// VisionAgent Class
// =====================================================
export class VisionAgent {
  private config: VisionAgentConfig

  constructor(config: Partial<VisionAgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Main analysis entry point
   * Executes fallback chain: Template → Gemini → GPT-4o → Keywords
   */
  async analyze(
    imageUrl: string,
    context?: string
  ): Promise<RepairImageAnalysis> {
    try {
      // Step 1: Try template matching first (cheapest, fastest)
      if (this.config.useTemplateMatching) {
        const templateMatch = await this.matchTemplate(imageUrl, context)
        if (templateMatch && templateMatch.similarity > this.config.templateMatchThreshold) {
          console.log(
            `[VisionAgent] Template match: ${templateMatch.category} (similarity: ${templateMatch.similarity.toFixed(3)})`
          )

          // Increase usage count for analytics
          await this.incrementTemplateUsage(templateMatch.id)

          return {
            category: templateMatch.category,
            title: templateMatch.title,
            description: templateMatch.description || context || "",
            urgency: this.inferUrgencyFromCategory(templateMatch.category),
            damage_details: `Matched template: ${templateMatch.title}`,
            suggested_specialty: templateMatch.category,
            confidence: templateMatch.similarity,
            provider: "template"
          }
        }
      }

      // Step 2: Try primary provider (Gemini)
      console.log(`[VisionAgent] Using ${this.config.primaryProvider} for analysis`)
      const primaryResult = await this.analyzeWithProvider(
        this.config.primaryProvider,
        imageUrl,
        context
      )

      // If confidence high enough, return
      if (primaryResult.confidence >= this.config.confidenceThreshold) {
        console.log(
          `[VisionAgent] ${this.config.primaryProvider} success (confidence: ${primaryResult.confidence})`
        )
        return primaryResult
      }

      // Step 3: Fallback to secondary provider (GPT-4o)
      if (this.config.fallbackProvider) {
        console.log(
          `[VisionAgent] Low confidence (${primaryResult.confidence}), falling back to ${this.config.fallbackProvider}`
        )
        const fallbackResult = await this.analyzeWithProvider(
          this.config.fallbackProvider,
          imageUrl,
          context,
          primaryResult.category // hint from primary
        )
        return fallbackResult
      }

      return primaryResult
    } catch (error) {
      console.error("[VisionAgent] All providers failed:", error)
      // Last resort: keyword fallback
      return this.fallbackToKeywords(context || "")
    }
  }

  /**
   * Template matching using embeddings
   */
  private async matchTemplate(
    imageUrl: string,
    context?: string
  ): Promise<{
    id: string
    category: string
    title: string
    description: string
    similarity: number
  } | null> {
    const supabase = await createAdminClient()

    try {
      // Generate embedding for query (use description or URL)
      const queryText = context || "repair damage image"
      const embedding = await getOpenAIClient().embeddings.create({
        model: "text-embedding-3-small",
        input: queryText
      })

      // Vector search
      const { data: matches, error } = await supabase.rpc("match_repair_templates", {
        query_embedding: embedding.data[0].embedding,
        match_threshold: this.config.templateMatchThreshold,
        match_count: 1
      })

      if (error) {
        console.error("[VisionAgent] Template matching failed:", error)
        return null
      }

      if (!matches || matches.length === 0) {
        console.log("[VisionAgent] No template matches found")
        return null
      }

      return matches[0]
    } catch (error) {
      console.error("[VisionAgent] Template matching error:", error)
      return null
    }
  }

  /**
   * Call specific provider (Gemini or OpenAI GPT-4o)
   */
  private async analyzeWithProvider(
    provider: "gemini" | "openai",
    imageUrl: string,
    context?: string,
    categoryHint?: string
  ): Promise<RepairImageAnalysis> {
    if (provider === "gemini") {
      return await analyzeRepairImageGemini(imageUrl, context)
    }

    // OpenAI GPT-4o (fallback)
    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            REPAIR_IMAGE_ANALYSIS_PROMPT +
            (categoryHint ? `\n\nHint: might be "${categoryHint}"` : "")
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: context || "วิเคราะห์ความเสียหายในรูปนี้"
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.3
    })

    const analysis = JSON.parse(response.choices[0].message.content || "{}")

    return {
      category: analysis.category || "other",
      title: analysis.title || "แจ้งซ่อม",
      description: analysis.description || context || "",
      urgency: analysis.urgency || "medium",
      damage_details: analysis.damage_details || "",
      suggested_specialty: analysis.suggested_specialty || analysis.category || "general",
      confidence: analysis.confidence || 0.7,
      provider: "openai"
    }
  }

  /**
   * Keyword-based fallback (no AI API call)
   */
  private fallbackToKeywords(message: string): RepairImageAnalysis {
    const category = detectRepairCategory(message)

    return {
      category: category || "other",
      title: message.slice(0, 50) || "แจ้งซ่อม",
      description: message || "ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาระบุรายละเอียดเพิ่มเติม",
      urgency: "medium",
      damage_details: "",
      suggested_specialty: category || "general",
      confidence: 0.3,
      provider: "keyword"
    }
  }

  /**
   * Infer urgency from category (heuristic)
   */
  private inferUrgencyFromCategory(category: string): "low" | "medium" | "high" | "urgent" {
    const urgentCategories = ["electrical", "plumbing"]
    return urgentCategories.includes(category) ? "high" : "medium"
  }

  /**
   * Increment template usage count
   */
  private async incrementTemplateUsage(templateId: string): Promise<void> {
    try {
      const supabase = await createAdminClient()
      await supabase.rpc("increase_template_usage", { template_id: templateId })
    } catch (error) {
      console.error("[VisionAgent] Failed to increment template usage:", error)
    }
  }
}

// =====================================================
// Singleton Export
// =====================================================
export const visionAgent = new VisionAgent()
