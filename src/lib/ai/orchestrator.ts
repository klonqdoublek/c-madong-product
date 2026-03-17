// @ts-nocheck — Phase 4.5 in progress, fix TS errors when vision pipeline is finalized
/**
 * Repair Orchestrator
 * Purpose: Coordinate multiple agents for repair request processing
 * Flow: VisionAgent (if photos) + ContextAgent (parallel) → Ticket Creation
 */

import { VisionAgent } from "./agents/vision-agent"
import { createAdminClient } from "@/lib/supabase/admin"
import { detectRepairDetails } from "@/lib/chatbot/handlers/repair"
import type { RepairImageAnalysis } from "./gemini"

// =====================================================
// Types
// =====================================================
export interface RepairDetection {
  category: "plumbing" | "electrical" | "aircon" | "furniture" | "pest" | "internet" | "other"
  title: string
  description: string
  urgency: "low" | "medium" | "high" | "urgent"
  damage_details?: string
  ai_confidence?: number
}

export interface ReporterContext {
  name: string
  building: string
  room: string
}

export interface RepairOrchestratorResult {
  detection: RepairDetection
  reporterContext: ReporterContext
  provider: string
  template_id?: string
}

// =====================================================
// RepairOrchestrator Class
// =====================================================
export class RepairOrchestrator {
  private visionAgent: VisionAgent

  constructor() {
    this.visionAgent = new VisionAgent({
      primaryProvider: "gemini",
      fallbackProvider: "openai",
      useTemplateMatching: true,
      templateMatchThreshold: 0.85,
      confidenceThreshold: 0.7
    })
  }

  /**
   * Main entry point for repair requests
   * Parallel execution: vision analysis + user context lookup
   */
  async handleRepairRequest(
    userId: string,
    message: string,
    photos: string[] = []
  ): Promise<RepairOrchestratorResult> {
    // Parallel tasks: vision analysis + user context
    const [visionResult, reporterContext] = await Promise.all([
      photos.length > 0
        ? this.visionAgent.analyze(photos[0], message)
        : this.analyzeTextOnly(message),
      this.getReporterContext(userId)
    ])

    const detection: RepairDetection = {
      category: visionResult.category,
      title: visionResult.title,
      description: visionResult.description || message,
      urgency: visionResult.urgency,
      damage_details: visionResult.damage_details,
      ai_confidence: visionResult.confidence
    }

    // If multiple photos, mention count in description
    if (photos.length > 1) {
      detection.description += ` (มีรูปภาพประกอบ ${photos.length} รูป)`
    }

    return {
      detection,
      reporterContext,
      provider: visionResult.provider
    }
  }

  /**
   * Text-only analysis (no photos)
   * Uses existing repair detection logic
   */
  private async analyzeTextOnly(message: string): Promise<RepairImageAnalysis> {
    const detection = await detectRepairDetails(message)

    return {
      ...detection,
      damage_details: "",
      suggested_specialty: detection.category,
      confidence: 0.6,
      provider: "text-only"
    }
  }

  /**
   * Get user context (building, room, name)
   * Runs in parallel with vision analysis
   */
  private async getReporterContext(userId: string): Promise<ReporterContext> {
    const supabase = await createAdminClient()

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, building, room_number")
      .eq("id", userId)
      .single()

    return {
      name: profile?.full_name || "ผู้พัก",
      building: profile?.building || "-",
      room: profile?.room_number || "-"
    }
  }

  /**
   * Analyze multiple images
   * (Future enhancement for Phase 4D)
   */
  async analyzeMultipleImages(
    imageUrls: string[],
    context?: string
  ): Promise<RepairImageAnalysis> {
    if (imageUrls.length === 0) {
      throw new Error("No images provided")
    }

    if (imageUrls.length === 1) {
      return this.visionAgent.analyze(imageUrls[0], context)
    }

    // Analyze all images in parallel
    const results = await Promise.all(
      imageUrls.map((url) => this.visionAgent.analyze(url, context))
    )

    // Pick result with highest confidence
    const best = results.reduce((prev, curr) =>
      curr.confidence > prev.confidence ? curr : prev
    )

    // Merge damage_details
    const allDetails = results
      .map((r) => r.damage_details)
      .filter(Boolean)
      .join(" | ")

    return {
      ...best,
      damage_details: allDetails || best.damage_details
    }
  }
}

// =====================================================
// Singleton Export
// =====================================================
export const repairOrchestrator = new RepairOrchestrator()
