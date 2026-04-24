import { getOpenAIClient } from "@/lib/ai/openai";
import { getAISettings } from "@/lib/ai/settings";

export interface ExistingFolder {
  id: string;
  name: string;
  description: string | null;
}

export interface ExistingTag {
  id: string;
  name: string;
}

export interface AIAnalyzeInput {
  filename: string;
  content: string;
  existingFolders: ExistingFolder[];
  existingTags: ExistingTag[];
}

export interface AIAnalyzeResult {
  suggestedFilename: string;
  suggestedFolderId: string | null;
  suggestedNewFolder: { name: string } | null;
  suggestedTagIds: string[];
  suggestedNewTags: string[];
  summary: string;
  confidence: number;
}

const SYSTEM_PROMPT = `คุณคือ CMD-AI ผู้ช่วยจัดการเอกสารสำหรับหอพักนิสิตจุฬา

หน้าที่: วิเคราะห์เอกสารที่ admin อัปโหลด แล้วแนะนำ:
1. ชื่อไฟล์ (suggestedFilename) — ภาษาไทยที่สั้น กระชับ สื่อความหมาย (≤ 60 ตัวอักษร) ไม่มีนามสกุลไฟล์
2. โฟลเดอร์ที่เหมาะสม — เลือกจาก existingFolders (ใช้ id) หรือเสนอโฟลเดอร์ใหม่ (เฉพาะเมื่อไม่มีที่เหมาะ)
3. แท็กที่เหมาะสม — เลือกจาก existingTags (ใช้ id) หรือเสนอแท็กใหม่ (ชื่อสั้น ≤ 15 ตัวอักษร)
4. สรุปเอกสาร (summary) — 1-2 ประโยค
5. ความมั่นใจ (confidence) — 0-1 ตามความชัดเจนของเนื้อหา

กฎ:
- ถ้า existingFolders มีที่เหมาะ → suggestedFolderId (suggestedNewFolder=null)
- ถ้าไม่มีที่เหมาะ → suggestedNewFolder={name} (suggestedFolderId=null)
- suggestedTagIds และ suggestedNewTags รวมกันไม่เกิน 3
- ห้ามแต่งข้อมูลที่ไม่อยู่ในเอกสาร

ตอบกลับเป็น JSON เท่านั้น`;

/**
 * Analyze document content and return AI suggestions for filename, folder, tags, summary.
 * Uses OpenAI gpt-4o-mini with structured JSON response.
 */
export async function analyzeDocument(
  input: AIAnalyzeInput
): Promise<AIAnalyzeResult> {
  const settings = await getAISettings();
  const openai = getOpenAIClient();

  const contentPreview = input.content.slice(0, 4000);
  const foldersList = input.existingFolders
    .map((f) => `- ${f.id} | ${f.name}${f.description ? ` — ${f.description}` : ""}`)
    .join("\n");
  const tagsList = input.existingTags
    .map((t) => `- ${t.id} | ${t.name}`)
    .join("\n");

  const userPrompt = `ชื่อไฟล์ปัจจุบัน: ${input.filename}

เนื้อหา (ตัดมา ${contentPreview.length} ตัวอักษร):
${contentPreview}

โฟลเดอร์ที่มีในระบบ:
${foldersList || "(ยังไม่มี)"}

แท็กที่มีในระบบ:
${tagsList || "(ยังไม่มี)"}

ตอบกลับ JSON ตาม schema:
{
  "suggestedFilename": string,
  "suggestedFolderId": string | null,
  "suggestedNewFolder": { "name": string } | null,
  "suggestedTagIds": string[],
  "suggestedNewTags": string[],
  "summary": string,
  "confidence": number
}`;

  const response = await openai.chat.completions.create({
    model: settings["ai.primary_model"] ?? "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<AIAnalyzeResult>;

  // Validate folder ID exists in list; reject hallucinated IDs
  const folderIds = new Set(input.existingFolders.map((f) => f.id));
  const tagIds = new Set(input.existingTags.map((t) => t.id));

  const validFolderId =
    parsed.suggestedFolderId && folderIds.has(parsed.suggestedFolderId)
      ? parsed.suggestedFolderId
      : null;

  const validTagIds = (parsed.suggestedTagIds ?? []).filter((id) =>
    tagIds.has(id)
  );

  return {
    suggestedFilename: (parsed.suggestedFilename ?? input.filename).slice(0, 60),
    suggestedFolderId: validFolderId,
    suggestedNewFolder:
      !validFolderId && parsed.suggestedNewFolder?.name
        ? { name: parsed.suggestedNewFolder.name.slice(0, 40) }
        : null,
    suggestedTagIds: validTagIds.slice(0, 3),
    suggestedNewTags: (parsed.suggestedNewTags ?? [])
      .filter((t) => typeof t === "string" && t.length > 0)
      .map((t) => t.slice(0, 15))
      .slice(0, 3 - validTagIds.length),
    summary: parsed.summary ?? "",
    confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
  };
}
