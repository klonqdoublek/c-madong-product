import { getOpenAIClient } from "../openai";

export interface AnnouncementSuggestion {
  title_th: string;
  title_en: string;
  content_th: string;
  content_en: string;
  category: "announcement" | "alert" | "activity" | "news" | "pr";
  event_date: string | null;
  location: string | null;
  has_dorm_score: boolean;
  score_points: number | null;
  folder_id: string | null;
  suggested_new_folder: { name: string; icon: string } | null;
  tag_ids: string[];
  suggested_new_tags: string[];
  summary: string;
  confidence: number;
}

interface StructureInput {
  ocrMarkdown: string;
  existingFolders: { id: string; name: string }[];
  existingTags: { id: string; name: string }[];
}

const SYSTEM_PROMPT = `คุณคือ CMD-AI ผู้ช่วยสร้างประกาศหอพักนิสิต จุฬาลงกรณ์มหาวิทยาลัย

หน้าที่: วิเคราะห์ข้อความที่ OCR สกัดจากโปสเตอร์ประกาศ แล้วแยกข้อมูลเป็นโครงสร้าง JSON

กฎสำคัญ:
- title_th: หัวข้อสั้นกระชับ ≤ 80 ตัวอักษร ภาษาไทย
- title_en: หัวข้อภาษาอังกฤษ (แปลหรือทับศัพท์) ถ้าไม่มีในโปสเตอร์ให้แปลเอง
- content_th: ใจความสำคัญภาษาไทย 2-5 ประโยค ไม่ซ้ำกับหัวข้อ
- content_en: แปลจาก content_th
- category: เลือก announcement / alert / activity / news / pr ตามประเภทจริง
  - activity: กิจกรรม งาน อีเวนท์ พิธี
  - alert: ประกาศด่วน เตือน
  - announcement: ทั่วไป
  - news: ข่าว อัปเดตทั่วไป
  - pr: ประชาสัมพันธ์
- event_date: วันที่จัดงาน/กิจกรรม รูปแบบ yyyy-mm-dd (แปลงจากวันที่ไทย เช่น "5 พ.ค. 2569" = "2026-05-05") ถ้าไม่มีให้เป็น null
- location: สถานที่ ถ้าไม่มีให้เป็น null
- has_dorm_score: true ถ้าประกาศเกี่ยวกับคะแนนหอพัก
- score_points: จำนวนคะแนนที่ได้ (ถ้ามี) มิฉะนั้น null
- folder_id: เลือก id จาก existingFolders ที่เหมาะสมที่สุด ถ้าไม่มีให้ null + ใส่ suggested_new_folder
- tag_ids: เลือก id ≤ 3 รายการจาก existingTags
- suggested_new_tags: ชื่อแท็กใหม่ ≤ 15 ตัวอักษร (เฉพาะถ้าไม่มีแท็กที่เหมาะใน existingTags)
- summary: สรุป 1 ประโยค
- confidence: 0-1 ตามความชัดเจนของโปสเตอร์ที่ OCR แล้ว
- ห้ามแต่งข้อมูลที่ไม่มีในโปสเตอร์ เช่น ห้ามสร้างวันที่ถ้าไม่ปรากฏในภาพ

ตอบกลับ JSON เท่านั้น`;

export async function structureAnnouncementFromOCR(
  input: StructureInput
): Promise<AnnouncementSuggestion> {
  const openai = getOpenAIClient();

  const foldersList = input.existingFolders
    .map((f) => `- ${f.id} | ${f.name}`)
    .join("\n");

  const tagsList = input.existingTags
    .map((t) => `- ${t.id} | ${t.name}`)
    .join("\n");

  const userPrompt = `ข้อความจากโปสเตอร์ (OCR):
${input.ocrMarkdown.slice(0, 4000)}

โฟลเดอร์ที่มีในระบบ:
${foldersList || "(ยังไม่มี)"}

แท็กที่มีในระบบ:
${tagsList || "(ยังไม่มี)"}

วันปัจจุบัน: ${new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })} (ปี ${new Date().getFullYear() + 543} พ.ศ.)

ตอบ JSON schema:
{
  "title_th": string,
  "title_en": string,
  "content_th": string,
  "content_en": string,
  "category": "announcement" | "alert" | "activity" | "news" | "pr",
  "event_date": string | null,
  "location": string | null,
  "has_dorm_score": boolean,
  "score_points": number | null,
  "folder_id": string | null,
  "suggested_new_folder": { "name": string, "icon": string } | null,
  "tag_ids": string[],
  "suggested_new_tags": string[],
  "summary": string,
  "confidence": number
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 600,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<AnnouncementSuggestion>;

  // Validate IDs against existing sets — drop hallucinations
  const folderIds = new Set(input.existingFolders.map((f) => f.id));
  const tagIds = new Set(input.existingTags.map((t) => t.id));

  const validFolderId =
    parsed.folder_id && folderIds.has(parsed.folder_id) ? parsed.folder_id : null;

  const validTagIds = (parsed.tag_ids ?? []).filter((id) => tagIds.has(id)).slice(0, 3);

  // Validate event_date format
  let validEventDate: string | null = null;
  if (parsed.event_date && /^\d{4}-\d{2}-\d{2}$/.test(parsed.event_date)) {
    validEventDate = parsed.event_date;
  }

  const validCategories = ["announcement", "alert", "activity", "news", "pr"] as const;
  const category = validCategories.includes(parsed.category as typeof validCategories[number])
    ? (parsed.category as AnnouncementSuggestion["category"])
    : "announcement";

  return {
    title_th: (parsed.title_th ?? "").slice(0, 80),
    title_en: (parsed.title_en ?? "").slice(0, 80),
    content_th: parsed.content_th ?? "",
    content_en: parsed.content_en ?? "",
    category,
    event_date: validEventDate,
    location: parsed.location ?? null,
    has_dorm_score: parsed.has_dorm_score ?? false,
    score_points: typeof parsed.score_points === "number" ? parsed.score_points : null,
    folder_id: validFolderId,
    suggested_new_folder:
      !validFolderId && parsed.suggested_new_folder?.name
        ? {
            name: parsed.suggested_new_folder.name.slice(0, 40),
            icon: parsed.suggested_new_folder.icon ?? "Folder",
          }
        : null,
    tag_ids: validTagIds,
    suggested_new_tags: (parsed.suggested_new_tags ?? [])
      .filter((t) => typeof t === "string" && t.length > 0)
      .map((t) => t.slice(0, 15))
      .slice(0, 3 - validTagIds.length),
    summary: parsed.summary ?? "",
    confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
  };
}
