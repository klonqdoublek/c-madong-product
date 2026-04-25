import { getOpenAIClient } from "../openai";
import { getAISetting } from "../settings";
import type { MaterialItem } from "@/lib/supabase/types";

export interface MaterialAnalysisResult {
  items: MaterialItem[];
  notes: string;
  provider: "openai-vision" | "openai-text" | "template";
}

const MATERIAL_SYSTEM_PROMPT = `คุณคือผู้เชี่ยวชาญด้านวัสดุซ่อมบำรุงหอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย

วิเคราะห์รูปภาพหรือคำอธิบายความเสียหาย แล้วแนะนำวัสดุอุปกรณ์ที่จำเป็นสำหรับการซ่อม

กฎการแนะนำ:
- ใช้ชื่อภาษาไทย เช่น "บานพับประตู" ไม่ใช่ "door hinge"
- ระบุจำนวนที่พอดี ไม่มากเกินไป
- หน่วยมาตรฐาน: ชิ้น, ตัว, เมตร, ม้วน, กระป๋อง, แท่ง, ขวด, ชุด
- ไม่แนะนำวัสดุที่ไม่แน่ใจจากรูป
- สูงสุด 8 รายการ
- ห้ามแนะนำของหรูหรา เลือกของมาตรฐานราคาถูก

ตอบเป็น JSON:
{
  "items": [
    {"name": "ชื่อวัสดุ", "quantity": 2, "unit": "ชิ้น", "category": "hardware"}
  ],
  "notes": "หมายเหตุสั้นๆ ถ้ามี"
}

category ของวัสดุ: hardware, electrical, plumbing, paint, adhesive, cleaning, other`;

export async function analyzeMaterials({
  photo,
  description,
  category,
  specificItem,
  templateDefaultMaterials = [],
}: {
  photo?: string;
  description: string;
  category: string;
  specificItem?: string | null;
  templateDefaultMaterials?: MaterialItem[];
}): Promise<MaterialAnalysisResult> {
  const openai = getOpenAIClient();

  const contextText = [
    `ประเภทปัญหา: ${category}`,
    specificItem ? `สิ่งของที่เสียหาย: ${specificItem}` : null,
    `คำอธิบาย: ${description}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    // Vision path — use photo
    if (photo) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: MATERIAL_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: contextText },
              { type: "image_url", image_url: { url: photo } },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
        temperature: 0.2,
      });

      const parsed = JSON.parse(
        response.choices[0].message.content ?? "{}"
      );
      return {
        items: normalizeItems(parsed.items ?? []),
        notes: parsed.notes ?? "",
        provider: "openai-vision",
      };
    }

    // Text path — use description only
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: MATERIAL_SYSTEM_PROMPT },
        { role: "user", content: contextText },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.2,
    });

    const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
    return {
      items: normalizeItems(parsed.items ?? []),
      notes: parsed.notes ?? "",
      provider: "openai-text",
    };
  } catch {
    // Fall back to template defaults if AI fails
    if (templateDefaultMaterials.length > 0) {
      return {
        items: templateDefaultMaterials.map((m) => ({
          ...m,
          source: "ai" as const,
          ai_confidence: 0.5,
        })),
        notes: "แนะนำจากฐานข้อมูลเทมเพลต",
        provider: "template",
      };
    }
    return { items: [], notes: "", provider: "template" };
  }
}

function normalizeItems(raw: unknown[]): MaterialItem[] {
  return raw
    .filter((r): r is Record<string, unknown> => typeof r === "object" && r !== null)
    .slice(0, 8)
    .map((r) => ({
      id: crypto.randomUUID(),
      name: String(r.name ?? ""),
      quantity: Number(r.quantity ?? 1),
      unit: String(r.unit ?? "ชิ้น"),
      category: r.category ? String(r.category) : undefined,
      source: "ai" as const,
      ai_confidence: 0.8,
      added_at: new Date().toISOString(),
    }))
    .filter((item) => item.name.length > 0);
}
