# Phase 4.5: AI Vision Analysis Implementation Checklist

> **Status:** Foundation Complete — Ready for Testing & Deployment
> **Date:** 2026-03-18
> **Estimated Time to MVP:** 1-2 weeks

---

## ✅ Completed (Foundation)

### Database & Infrastructure
- [x] Migration `20260318_repair_templates.sql` created
  - `repair_templates` table with pgvector support
  - Vector similarity search function `match_repair_templates()`
  - Vision metadata fields added to `maintenance_requests`
  - RPC functions for template usage tracking

### AI Components
- [x] Gemini client (`src/lib/ai/gemini.ts`)
  - Gemini 2.0 Flash integration
  - Thai repair analysis prompt
  - Multi-image support
  - Response parsing & validation

- [x] VisionAgent (`src/lib/ai/agents/vision-agent.ts`)
  - Multi-provider fallback chain
  - Template matching via embeddings
  - Confidence-based provider selection
  - Keyword fallback

- [x] RepairOrchestrator (`src/lib/ai/orchestrator.ts`)
  - Parallel vision + context lookup
  - Photo and text-only handling

### Integration
- [x] Updated repair handler with orchestrator integration
- [x] Added vision metadata to ticket creation
- [x] Updated postback handler to pass vision metadata
- [x] Updated TypeScript types

### Documentation
- [x] PRD updated (v1.7) with Phase 4.5
- [x] Memory file updated with progress tracking

---

## 🚀 Next Steps (Week 1: Testing & Deployment)

### 1. Environment Setup (30 min)

```bash
# Add to .env.local
GOOGLE_AI_API_KEY=your_gemini_api_key_here
ENABLE_VISION_ANALYSIS=false  # Start with false for testing
```

**Get Gemini API Key:**
1. Go to https://aistudio.google.com/apikey
2. Create new API key
3. Copy to `.env.local`

### 2. Run Migration (5 min)

```bash
# Push migration to Supabase
supabase db push

# Verify tables created
supabase db diff --remote
```

**Expected output:**
- `repair_templates` table created
- New columns in `maintenance_requests`
- Vector search function exists

### 3. Seed Template Images (1 hour)

**Option A: Use Placeholder URLs (Quick Start)**
```bash
# Edit scripts/seed-repair-templates.ts
# Replace image_url with placeholder images from:
# - https://placehold.co/600x400/DD598B/FFFFFF?text=Plumbing
# - https://placehold.co/600x400/E53E3E/FFFFFF?text=Electrical
# etc.

bun run scripts/seed-repair-templates.ts
```

**Option B: Collect Real Template Images (Better Quality)**
1. Collect 20 sample repair photos from:
   - Google Images (search "ท่อน้ำรั่ว", "ปลั๊กไฟเสีย", etc.)
   - Previous maintenance tickets (if available)
   - Stock photo sites (Unsplash, Pexels)

2. Upload to Supabase Storage:
   ```bash
   # Create bucket (if not exists)
   supabase storage create repair-templates --public

   # Upload images
   supabase storage upload repair-templates/plumbing-leak-1.jpg ./path/to/image.jpg
   ```

3. Update seed script with real URLs
4. Run seed script:
   ```bash
   bun run scripts/seed-repair-templates.ts
   ```

**Verify seeding:**
```sql
-- Check templates count
SELECT category, COUNT(*) FROM repair_templates GROUP BY category;

-- Test vector search
SELECT * FROM match_repair_templates(
  (SELECT embedding FROM repair_templates LIMIT 1),
  0.85,
  3
);
```

### 4. Local Testing (2-3 hours)

```bash
# Start dev server
bun run dev
```

**Test scenarios:**

**A. Text-only repair (baseline)**
1. Open LINE chatbot (development mode)
2. Send: "ท่อน้ำรั่วครับ"
3. Verify: Repair confirmation Flex appears
4. Check: Category detected correctly

**B. Vision analysis (disabled)**
1. Set `ENABLE_VISION_ANALYSIS=false`
2. Send photo + text "ท่อน้ำรั่ว"
3. Verify: Falls back to text-only detection
4. Check logs: No vision API calls

**C. Vision analysis (enabled)**
1. Set `ENABLE_VISION_ANALYSIS=true`
2. Send photo + text "แอร์เสียครับ"
3. Verify:
   - Repair confirmation Flex appears
   - Category detected from image
   - Provider logged (template/gemini/openai)
4. Check database:
   ```sql
   SELECT
     ai_provider,
     ai_confidence,
     category,
     damage_details
   FROM maintenance_requests
   ORDER BY created_at DESC
   LIMIT 1;
   ```

**D. Template matching**
1. Send photo similar to template image
2. Check logs for: `[VisionAgent] Template match: {category} (similarity: 0.XX)`
3. Verify: High similarity (>0.85) → no API call to Gemini/GPT

**E. Gemini analysis**
1. Send ambiguous repair photo
2. Check logs for: `[VisionAgent] Using gemini for analysis`
3. Verify: Gemini generates Thai description

**F. GPT-4o fallback**
1. Mock Gemini returning low confidence (<0.7)
2. Check logs for: `[VisionAgent] Low confidence (0.XX), falling back to openai`
3. Verify: GPT-4o provides better categorization

### 5. Monitor Costs (Ongoing)

```bash
# Check API usage logs
grep -E "VisionAgent|provider" logs/development.log

# Calculate cost estimate
# Template matches: FREE
# Gemini: FREE (within 1500/day tier)
# GPT-4o: $0.0085 per image (~฿0.30)
```

**Expected distribution (after 50 tests):**
- 70% template matches → ฿0
- 25% Gemini → ฿0 (free tier)
- 5% GPT-4o → ฿1.50

---

## 📊 Beta Testing (Week 2)

### Enable for 10 Beta Users

```sql
-- Create beta users list
CREATE TABLE IF NOT EXISTS beta_users (
  line_uid text PRIMARY KEY,
  feature text NOT NULL,
  enabled_at timestamptz DEFAULT now()
);

-- Add beta users
INSERT INTO beta_users (line_uid, feature) VALUES
  ('U1234...', 'vision_analysis'),
  ('U5678...', 'vision_analysis');
```

**Update handler:**
```typescript
// Check if user is beta tester
const isBeta = await checkBetaUser(lineUid, 'vision_analysis')
const ENABLE_VISION = process.env.ENABLE_VISION_ANALYSIS === 'true' || isBeta
```

### Collect Feedback

**Metrics to track:**
1. Accuracy: Admin validates categorization (correct/incorrect)
2. Latency: Average response time (<3s target)
3. Cost: API usage per provider
4. User satisfaction: Feedback from beta users

**Admin feedback UI (optional enhancement):**
```
Ticket Detail Page
┌─────────────────────────────────────┐
│ AI Analysis:                        │
│ Provider: Gemini                    │
│ Confidence: 0.87                    │
│ Category: Plumbing ✓                │
│                                     │
│ [✓ Correct] [✗ Wrong - Should be: _]│
└─────────────────────────────────────┘
```

---

## 🚢 Production Rollout (Week 3)

### Pre-deployment Checklist

- [ ] All tests passing (50+ repair requests with photos)
- [ ] 80%+ accuracy on beta testing
- [ ] Average latency <3s
- [ ] Cost <฿5 for 50 tickets
- [ ] No critical errors in logs
- [ ] Template library expanded to 30+ images

### Deployment Steps

```bash
# 1. Push migration to production
supabase db push --remote

# 2. Seed templates on production
NEXT_PUBLIC_SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
OPENAI_API_KEY=... \
bun run scripts/seed-repair-templates.ts

# 3. Set env vars on Vercel
vercel env add GOOGLE_AI_API_KEY production
vercel env add ENABLE_VISION_ANALYSIS production  # value: true

# 4. Deploy to production
mv .git .git-bak
vercel --prod
mv .git-bak .git

# 5. Test on production LINE bot
# Send photo + repair description
# Verify Flex message with correct category
```

### Monitoring

**First 24 hours:**
- Check error rate (should be <1%)
- Monitor API usage (Gemini free tier sufficient?)
- Track categorization accuracy (admin feedback)
- Watch response times (P95 <5s)

**Vercel logs:**
```bash
vercel logs --prod --filter="[VisionAgent]"
```

**Supabase metrics:**
```sql
-- Provider distribution
SELECT
  ai_provider,
  COUNT(*),
  AVG(ai_confidence),
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_latency_sec
FROM maintenance_requests
WHERE created_at > NOW() - INTERVAL '7 days'
  AND ai_provider IS NOT NULL
GROUP BY ai_provider;
```

---

## 🔧 Troubleshooting

### Issue: "Gemini client not initialized"
**Cause:** Missing `GOOGLE_AI_API_KEY`
**Fix:**
```bash
# Add to .env.local
GOOGLE_AI_API_KEY=your_key_here

# Or fallback to GPT-4o only
# Set in orchestrator:
primaryProvider: "openai"
```

### Issue: "No template matches found"
**Cause:** Template library empty or similarity too low
**Fix:**
```bash
# Check templates count
psql -c "SELECT COUNT(*) FROM repair_templates"

# Lower threshold temporarily
templateMatchThreshold: 0.75  # from 0.85
```

### Issue: "Vision analysis timeout"
**Cause:** Image too large or slow network
**Fix:**
- Resize images before upload (max 1MB)
- Increase timeout in VisionAgent
- Use template matching for common cases

### Issue: "Cost too high"
**Cause:** Too many GPT-4o fallbacks
**Fix:**
- Expand template library (reduce API calls)
- Lower confidence threshold for Gemini (0.65 instead of 0.7)
- Improve prompt engineering for Gemini

---

## 📈 Future Enhancements (Phase 4.5+)

### Phase 4.5A: Multi-Photo Analysis (Week 4)
- Analyze all photos, not just first
- Aggregate damage details from multiple angles
- Weight by confidence scores

### Phase 4.5B: Admin Feedback Loop (Week 5)
- Admin can flag incorrect categorization
- Incorrect tickets → new template images
- Template accuracy scoring & auto-archiving

### Phase 4.5C: Content Moderation (Week 6)
- NSFW image filtering (Google Cloud Vision)
- Inappropriate content detection
- Auto-reject non-repair images

### Phase 4.5D: Advanced Features (Post-MVP)
- Damage severity estimation (repair time prediction)
- Technician specialty matching
- Repair progress photos (before/after comparison)
- Multi-language support (English descriptions)

---

## 📞 Support & Questions

**Common Questions:**

Q: **จะเปิดใช้งาน vision analysis ยังไง?**
A: Set `ENABLE_VISION_ANALYSIS=true` in `.env.local` and redeploy

Q: **ต้องการ template image กี่รูป?**
A: เริ่มต้น 20 รูป (3-6 รูปต่อ category), expand to 50+ for better accuracy

Q: **ค่าใช้จ่าย API จะเท่าไหร่?**
A: ~฿1/month for 50 tickets with 70% template matches + Gemini free tier

Q: **ถ้า Gemini ไม่แม่นยำพอจะทำยังไง?**
A: GPT-4o fallback kicks in automatically when confidence < 0.7

Q: **จะตรวจสอบว่า vision analysis ทำงานได้ไหม?**
A: Check logs for `[VisionAgent]` entries, or query `maintenance_requests.ai_provider`

---

**Next Action:** Run migration + seed templates, then test locally with sample photos! 🚀
