# AI Architecture — C-Madong Product

> **Version**: 1.0  
> **Updated**: 2026-05-11  
> **Scope**: AI Chatbot (น้องซีมะโด่ง), Vision Repair Analysis, RAG Knowledge Base, Material Agent, Admin AI Features

---

## Overview

ระบบ AI ของ C-Madong แบ่งออกเป็น 3 layer หลัก:

1. **LINE Chatbot (น้องซีมะโด่ง)** — entry point หลักสำหรับนักศึกษา ทำงานผ่าน LINE Webhook
2. **AI Orchestration Layer** — ประสาน multiple AI providers (OpenAI, Gemini)
3. **Admin AI Features** — Knowledge Base analysis, Material suggestions

---

## 1. Big Picture — AI System Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENTRY POINTS                             │
│                                                                 │
│  LINE App ──────────► /api/line/webhook                         │
│  Web Chat Modal ────► /api/chat                                 │
│  Admin Upload ──────► /api/admin/knowledge/analyze              │
│  Admin Ticket ──────► /api/admin/maintenance/[id]/suggest-mat.  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     WEBHOOK HANDLER                             │
│              src/lib/chatbot/webhook-handler.ts                 │
│                                                                 │
│  ① Rate Limiting (20 msg/min)                                   │
│  ② Registration Check (profiles table)                          │
│  ③ Keyword Shortcuts (repair status, menu, guide triggers)      │
│  ④ Session State Check (repair_confirming, collecting_photos)   │
│  ⑤ classifyIntent() → AI Intent Classification                  │
│  ⑥ Route to Handler                                             │
└──────────┬───────────────────────────────────────┬─────────────┘
           │                                       │
     Message Events                          Postback Events
           │                                       │
           ▼                                       ▼
┌──────────────────────┐               ┌───────────────────────┐
│   INTENT HANDLERS    │               │   POSTBACK HANDLER    │
│                      │               │  handlers/postback.ts │
│ • handleRepair()     │               │                       │
│ • handleKnowledge()  │               │ • repair_confirm      │
│ • handleChitchat()   │               │ • repair_track        │
│ • handleScore()      │               │ • repair_cancel       │
│ • handleParcel()     │               │ • confirm_parcel_recv │
│ • handleEvents()     │               │ • remind_bill         │
└──────────────────────┘               └───────────────────────┘
```

---

## 2. น้องซีมะโด่ง — Chatbot Core

### 2.1 Intent Classification

ทุก message ที่เข้ามาจะถูก classify ด้วย OpenAI ก่อน:

```
User Message
      │
      ▼
┌─────────────────────────────────────────┐
│         classifyIntent()                │
│    src/lib/chatbot/intent-router.ts     │
│                                         │
│  Model: gpt-4o-mini                     │
│  Prompt: Thai + examples                │
│  Output: { intent, confidence }         │
│                                         │
│  Fallback: keyword matching (<1ms)      │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │   Intent Types       │
        │                      │
        │  • repair            │
        │  • knowledge         │
        │  • score             │
        │  • events            │
        │  • parcel            │
        │  • chitchat          │
        └──────────────────────┘
```

**Edge Cases ที่ต้องระวัง:**
- `"ค่าไฟ"` (billing) vs `"ไฟเสีย"` (electrical repair) → prompt มี examples แยกไว้
- `"คาเฟ่ชื่ออะไร"` → ต้อง route เป็น `knowledge` ไม่ใช่ `chitchat` (ถ้า route ผิดจะ hallucinate)

---

### 2.2 Session State Machine

Chatbot ใช้ stateful sessions เพื่อรองรับ multi-step repair flow:

```
                    ┌──────────────────────────────┐
                    │          Session States        │
                    └──────────────────────────────┘

           ┌─────────────────────────────────────┐
           │                idle                 │ ◄── default state
           └──────────────────┬──────────────────┘
                              │ user sends repair message
                              ▼
           ┌─────────────────────────────────────┐
           │      repair_collecting_photos        │
           │  (user sends up to 5 photos)         │
           └──────────────────┬──────────────────┘
                              │ user says "ส่งแล้ว" / no more photos
                              ▼
           ┌─────────────────────────────────────┐
           │         repair_confirming            │
           │  (show confirm Flex card to user)    │
           └──────────┬──────────────┬───────────┘
                      │              │
               ยืนยัน (confirm)   แก้ไข (edit)
                      │              │
                      ▼              ▼
           ┌──────────────────┐  ┌──────────────────────┐
           │   Ticket Created │  │   repair_editing     │
           │   → idle         │  │   → repair_confirming│
           └──────────────────┘  └──────────────────────┘

Session timeout: 30 minutes → auto reset to idle
State stored in: chatbot_sessions.state_data (JSONB)
```

---

### 2.3 System Prompts & Tone

น้องซีมะโด่ง มี persona ที่ configure ได้จาก Admin Settings:

```
src/lib/chatbot/system-prompts.ts
src/lib/ai/settings.ts (cached from app_settings table, TTL 5 min)

┌───────────────────────────────────────────────────────┐
│               Tone Presets                            │
├──────────────┬────────────────────────────────────────┤
│ professional │ ภาษาทางการ, ครับ/ค่ะ                   │
│ friendly     │ Gen-Z, นะ/จ้า (DEFAULT)                 │
│ casual       │ emoji-heavy, slang                      │
└──────────────┴────────────────────────────────────────┘

System prompts ที่ใช้:
• INTENT_CLASSIFICATION_PROMPT — classify intent (JSON output)
• CHITCHAT_SYSTEM_PROMPT       — น้องซีมะโด่ง persona
• REPAIR_DETECTION_PROMPT      — วิเคราะห์ความเสียหาย
• RAG_ANSWER_PROMPT            — ตอบคำถามจาก knowledge base
• CONTEXT_SUMMARY_PROMPT       — สรุปบทสนทนา (ทุก 10 messages)
```

**Admin สามารถ customize ได้:**
- Model: gpt-4o-mini / gpt-4o
- Temperature: 0.0–1.0 (presets: Focused 0.3 / Balanced 0.7 / Creative 1.0)
- Response length: brief / standard / detailed
- Custom instructions (free-text)
- Auto-escalate threshold

---

### 2.4 Quick Reply & Suggestions

ทุก response จะมี contextual quick reply buttons เพื่อไม่ให้ user ตันในการสนทนา:

```
src/lib/chatbot/quick-reply.ts
src/lib/chatbot/suggestions.ts

Intent         → Quick Reply Menu
─────────────────────────────────────────────
repair         → [📸 ส่งรูป] [📋 ดูประวัติ] [🏠 เมนูหลัก]
score          → [🎉 กิจกรรม] [📋 กฎหอพัก] [🏠 เมนูหลัก]
events         → [📊 คะแนนหอ] [📦 พัสดุ] [🏠 เมนูหลัก]
parcel         → [🔧 แจ้งซ่อม] [📊 คะแนนหอ] [🏠 เมนูหลัก]
knowledge      → (context from topic detection)
after confirm  → [🔍 ติดตามสถานะ] [📋 ดูประวัติ] [🏠 เมนูหลัก]
```

**Fallback escalation**: หลัง 7 consecutive fallbacks → suggest live chat

---

## 3. Repair Flow — Vision AI Pipeline

Repair เป็น feature ที่ซับซ้อนที่สุด มี Vision AI pipeline หลายชั้น:

### 3.1 Full Repair Flow

```
Student sends message/photos via LINE
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│                    handleRepair()                        │
│           src/lib/chatbot/handlers/repair.ts             │
│                                                         │
│  If ENABLE_VISION_ANALYSIS=true AND photos exist:       │
│  → RepairOrchestrator.handleRepairRequest()             │
│                                                         │
│  Else:                                                  │
│  → Text-only detection (gpt-4o-mini)                    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               RepairOrchestrator                        │
│              src/lib/ai/orchestrator.ts                 │
│                                                         │
│  Run in PARALLEL:                                       │
│  ┌───────────────────────┐  ┌───────────────────────┐   │
│  │    VisionAgent        │  │  getReporterContext()  │   │
│  │    (analyze photo)    │  │  (profile + building)  │   │
│  └───────────┬───────────┘  └───────────────────────┘   │
│              │                                          │
│  Merge: { detection, reporterContext, provider }        │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              VisionAgent Fallback Chain                 │
│           src/lib/ai/agents/vision-agent.ts             │
│                                                         │
│  Step 1: Template Matching                              │
│  ─────────────────────────                             │
│  • Generate embedding (text-embedding-3-small)          │
│  • pgvector cosine search on repair_templates           │
│  • Threshold: 0.85 similarity                           │
│  → HIT: Use template, fast response, no API call        │
│                                                         │
│  Step 2: Gemini 2.0 Flash (Primary Vision)              │
│  ─────────────────────────────────────────             │
│  • Download image → base64 encode                       │
│  • Thai-language damage prompt                          │
│  • Returns: category, urgency, specific_item, details   │
│                                                         │
│  Step 3: GPT-4o (Fallback Vision)                       │
│  ────────────────────────────────                       │
│  • Same as Gemini, different provider                   │
│  • JSON response format                                 │
│                                                         │
│  Step 4: Keyword Fallback                               │
│  ─────────────────────────                             │
│  • detectRepairCategory() — basic Thai keyword match    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
         buildRepairConfirmFlex() → Show to user
                        │
                  User clicks ยืนยัน
                        │
                        ▼
         createRepairTicket() → maintenance_requests table
                        │
              Priority = high/urgent?
                  ┌─────┴──────┐
                 YES           NO
                  │             │
                  ▼             ▼
         Push LINE Flex      Skip push
         to technician       (daily 08:00 digest)
         group LINE
```

### 3.2 Vision Analysis Output

```typescript
interface RepairDetection {
  category: "plumbing" | "electrical" | "aircon" | "furniture" | "pest" | "internet" | "other"
  urgency: "low" | "medium" | "high" | "urgent"
  description: string        // Thai language description
  specific_item?: string     // slug → Lucide icon mapping
  damage_details?: string[]  // detailed findings
  ai_confidence?: number     // 0.0–1.0
  ai_provider?: "template" | "gemini" | "openai" | "text-only" | "keyword"
  template_id?: string       // if matched template
}
```

---

## 4. RAG — Knowledge Base Pipeline

### 4.1 Knowledge Query Flow

```
User Question (knowledge intent)
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│              handleKnowledge()                          │
│          handlers/knowledge.ts                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Vector Search                              │
│         rag/vector-search.ts                            │
│                                                         │
│  1. generateEmbedding(question)                         │
│     → OpenAI text-embedding-3-small                     │
│                                                         │
│  2. Supabase RPC: match_documents                       │
│     → UNION: knowledge documents + announcements        │
│     → Cosine similarity (pgvector)                      │
│     → Match count: 8 results                            │
│     → Threshold: 0.2 (low = more results)               │
│                                                         │
│  3. Returns: [{ document_title, content, similarity,    │
│               source_type, cover_image }]               │
└───────────────────────┬─────────────────────────────────┘
                        │
              Results found?
               ┌────────┴────────┐
              YES               NO
               │                 │
               ▼                 ▼
┌──────────────────────┐  ┌───────────────────────────────┐
│  generateRAGAnswer() │  │     Fallback System           │
│  rag/answer-gen.ts   │  │  fallback/topic-detector.ts   │
│                      │  │  fallback/smart-suggestions.ts│
│  Model: gpt-4o-mini  │  │                               │
│  Context: docs +     │  │  1. Detect topic (keyword)    │
│  announcements       │  │  2. Rotate fallback message   │
│  Source attribution  │  │  3. Context-aware quick reply │
│  in Thai             │  │  4. After 7 fails → escalate  │
└──────────┬───────────┘  └───────────────────────────────┘
           │
           ▼
   similarity ≥ 0.5?
    ┌───────┴───────┐
   YES             NO
    │               │
    ▼               ▼
Append           Text reply
Announcement     only
Carousel
```

### 4.2 RAG Data Sources

```
Supabase: match_documents RPC
  ├── knowledge_documents (PDF, DOCX uploads by admin)
  │   └── document_sections (chunks with embeddings)
  │       status = 'ready' only (filters unprocessed)
  │
  └── announcements (ประกาศจากทางหอพัก)
      └── content + metadata

Embedding model: text-embedding-3-small (1536 dims)
Similarity metric: Cosine (via pgvector <=> operator)
```

---

## 5. Material Agent (Admin Feature)

เมื่อ admin ดู repair ticket → กด "AI แนะนำวัสดุ":

```
Admin: View ticket → Click "AI แนะนำวัสดุ"
              │
              ▼
POST /api/admin/maintenance/[id]/suggest-materials
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│              MaterialAgent                              │
│         src/lib/ai/agents/material-agent.ts             │
│                                                         │
│  Input:                                                 │
│  • photo (base64, optional)                             │
│  • description (Thai)                                   │
│  • category (repair type)                               │
│  • specificItem (slug)                                  │
│  • templateDefaultMaterials (fallback)                  │
│                                                         │
│  If photo → gpt-4o (vision)                             │
│  If no photo → gpt-4o-mini (text only)                  │
│                                                         │
│  Output:                                                │
│  [{                                                     │
│    name: string (Thai)                                  │
│    quantity: number                                     │
│    unit: string (hardware-store units)                  │
│    category: "hardware"|"electrical"|"plumbing"...      │
│  }]                                                     │
│  Max 8 items                                            │
│                                                         │
│  Fallback: use template default materials               │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Admin Knowledge Base AI

เมื่อ admin upload เอกสารใหม่:

```
Admin uploads document
              │
              ▼
POST /api/admin/knowledge/analyze
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│              Document Analyzer                          │
│          src/lib/knowledge/ai-analyze.ts                │
│                                                         │
│  Input:                                                 │
│  • filename                                             │
│  • content (first 4000 chars)                           │
│  • existingFolders []                                   │
│  • existingTags []                                      │
│                                                         │
│  Model: gpt-4o-mini (JSON response_format)              │
│                                                         │
│  Output:                                                │
│  {                                                      │
│    suggestedFilename: string                            │
│    suggestedFolderId: string | null                     │
│    suggestedNewFolder: string | null                    │
│    suggestedTagIds: string[]   (max 3)                  │
│    summary: string                                      │
│    confidence: number                                   │
│  }                                                      │
│                                                         │
│  Validation: rejects hallucinated folder/tag IDs        │
└─────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│          Version Detection                              │
│        src/lib/knowledge/detect-version.ts              │
│                                                         │
│  Check if document already exists:                      │
│  1. Exact filename match                                │
│  2. Embedding cosine similarity ≥ 0.85                 │
│     → uses match_documents RPC                          │
│                                                         │
│  If version detected:                                   │
│  • Old doc → is_current = false                         │
│  • New doc → version_number + 1                         │
└─────────────────────────────────────────────────────────┘
              │
              ▼
    Show AI Suggestion Dialog to admin
    (4 states: loading → main → feedback → detail)
    Admin can: Accept / Reject / Edit any field
```

---

## 7. Live Chat Escalation

เมื่อ user ต้องการคุยกับเจ้าหน้าที่:

```
User says "ขอคุยกับคน" / "ช่วยเหลือ"
OR: AI confidence < escalation threshold
OR: 7 consecutive fallbacks
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│           chat_escalations table                        │
│  Status: waiting → active → closed                      │
│                                                         │
│  Supabase Realtime subscription:                        │
│  • chat_escalations (all events)                        │
│  • ai_chat_messages (INSERT)                            │
│  → invalidateQueries (no polling)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
     Notify all admins → LINE Flex push
     Student sees waiting screen (no input)
     Admin claims → /admin/live-chat
     Admin types → message saved, Realtime pushes to student
     Admin closes → "ปิดและส่งกลับ AI" → status = closed
```

---

## 8. AI Provider Summary

| Provider | Models | Used For |
|----------|--------|----------|
| **OpenAI** | gpt-4o | Vision repair (fallback), Material agent (with photo) |
| **OpenAI** | gpt-4o-mini | Intent classification, RAG answers, Chitchat, Repair text detection, Material agent (text), Knowledge analysis |
| **OpenAI** | text-embedding-3-small | RAG embeddings, Template vector search |
| **Google Gemini** | gemini-2.0-flash | Vision repair (primary), Fallback to GPT-4o if fails |

### Provider Fallback Priority (Vision Repair)
```
Template Match (0.85 threshold)
       ↓ miss
Gemini 2.0 Flash
       ↓ fail/low confidence
GPT-4o
       ↓ fail
Keyword detection
       ↓ fail
Generic fallback message
```

---

## 9. Configuration & Feature Flags

```
Environment Variables (Vercel):
  OPENAI_API_KEY              — required for most AI features
  GEMINI_API_KEY              — required for vision primary
  ENABLE_VISION_ANALYSIS      — "true" to enable vision agent
  SMART_FALLBACK_ROLLOUT_PERCENTAGE — 0–100 canary rollout
  CRON_SECRET                 — for daily digest cron

Admin UI (app_settings table, TTL 5 min):
  ai.primary_model            — gpt-4o-mini | gpt-4o
  ai.temperature              — 0.0–1.0
  ai.tone_preset              — professional | friendly | casual
  ai.custom_instructions      — free-text
  ai.vision_enabled           — bool
  ai.auto_escalate            — bool
  ai.escalate_threshold       — 0.0–1.0
```

---

## 10. Data Flow — End to End

### Repair with Vision (Full Path)

```
[Student]          [LINE]         [Next.js API]        [AI Layer]           [Database]

tap camera ──────► send image ──► /api/line/webhook ──► VisionAgent ──────► repair_templates
                                        │                   │                 (template match)
                                        │              Gemini Flash ────────► ×
                                        │              GPT-4o ──────────────► ×
                                        │                   │
                                  handleRepair() ◄──── detection result
                                        │
                                  buildRepairConfirmFlex()
                                        │
[Student] ◄── ยืนยัน Flex ◄─────────────┘

tap ยืนยัน ──────► postback ─────► handlePostback() ──────────────────────► maintenance_requests
                                        │                                    (INSERT ticket)
                                  pushToGroup() ──────────────────────────► LINE technician group
                                        │
[Student] ◄── ticket created Flex ◄─────┘
```

### Knowledge Query (Full Path)

```
[Student]          [LINE]         [Next.js API]         [AI + DB]

"กฎหอพักคืออะไร" ► send text ───► /api/line/webhook
                                        │
                                  classifyIntent() ───► OpenAI gpt-4o-mini
                                        │               → "knowledge"
                                  handleKnowledge()
                                        │
                                  generateEmbedding() ► OpenAI embeddings
                                        │
                                  match_documents() ──► Supabase pgvector
                                        │               → [relevant chunks]
                                  generateRAGAnswer() ► OpenAI gpt-4o-mini
                                        │               + context injection
[Student] ◄── text answer + Flex ◄──────┘
```

---

## 11. Key Files Reference

```
src/lib/chatbot/
├── webhook-handler.ts        Entry point, event routing
├── intent-router.ts          AI intent classification
├── session-manager.ts        Stateful conversation state
├── system-prompts.ts         All AI prompts
├── chat-history.ts           Message persistence
├── context-manager.ts        Conversation summarization
├── quick-reply.ts            Quick reply menu definitions
├── suggestions.ts            Intent-based quick reply mapping
├── constants.ts              Keywords, timeouts, rate limits
├── handlers/
│   ├── repair.ts             Repair flow handler
│   ├── knowledge.ts          RAG knowledge handler
│   ├── chitchat.ts           Conversational handler
│   ├── score.ts              Dorm score handler
│   ├── parcel.ts             Parcel status handler
│   ├── postback.ts           Button callback handler
│   └── technician.ts         Technician bot commands
├── rag/
│   ├── answer-generator.ts   RAG answer generation
│   ├── vector-search.ts      pgvector similarity search
│   └── embeddings.ts         Embedding generation
└── fallback/
    ├── messages.ts            Fallback message rotation
    ├── topic-detector.ts      Keyword topic classification
    └── smart-suggestions.ts   Context-aware quick replies

src/lib/ai/
├── orchestrator.ts           Multi-agent coordination
├── openai.ts                 OpenAI client singleton
├── gemini.ts                 Gemini client + vision
├── settings.ts               AI settings schema + cache
└── agents/
    ├── vision-agent.ts       Repair photo analysis
    └── material-agent.ts     Material recommendations

src/lib/knowledge/
├── ai-analyze.ts             Document AI suggestions
└── detect-version.ts         Document version detection

src/app/api/
├── line/webhook/route.ts     LINE Bot webhook endpoint
├── chat/route.ts             Web chat endpoint
├── admin/maintenance/[id]/suggest-materials/route.ts
└── admin/knowledge/analyze/route.ts
```

---

## 12. Security & Limits

| Constraint | Value | Where Enforced |
|------------|-------|----------------|
| Rate limit | 20 msg/min per user | webhook-handler.ts |
| Session timeout | 30 min → auto reset | session-manager.ts |
| AI timeout | 8 sec → keyword fallback | constants.ts |
| Vision confidence threshold | 0.7 | orchestrator.ts |
| Template match threshold | 0.85 | vision-agent.ts |
| RAG similarity threshold | 0.2 (global) / 0.15 (per-doc) | vector-search.ts |
| Max photos per repair | 5 | webhook-handler.ts |
| Max material items | 8 | material-agent.ts |
| Max knowledge suggestion tags | 3 | ai-analyze.ts |
| Technician group push | urgent/high only | postback.ts |
| Escalation | 7 fallbacks OR low confidence | answer-generator.ts |
