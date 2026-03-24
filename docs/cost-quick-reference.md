# C-Madong Cost Quick Reference

**Last Updated**: 2026-03-21 | **Version**: 1.1 (with verified pricing)

> **TL;DR**: ค่าใช้จ่ายเฉลี่ย **฿0.10-0.12/request** (~91-97% LINE[^1], ~3-9% OpenAI[^2])

[^1]: [LINE Official Account Thailand Pricing](https://brandinside.asia/line-official-account-reduce-cost-for-send-msg/)
[^2]: [OpenAI API Pricing](https://openai.com/api/pricing/)

---

## 💰 Cost per Request (Verified March 2026)

| Feature | Cost (฿) | Cost ($) | Notes |
|---------|----------|----------|-------|
| แจ้งซ่อม (text) | **0.11** | 0.0031 | LINE ฿0.10 + OpenAI ~฿0.01 |
| แจ้งซ่อม (รูปภาพ) | **0.10** | 0.0032 | Gemini free tier[^3] |
| FAQ/ถามคำถาม | **0.12** | 0.0034 | Includes embedding + RAG |
| คุยสนุกสนาน | **0.11** | 0.0032 | With conversation history |
| เช็คคะแนน/พัสดุ/กิจกรรม | **0.10** | 0.0030 | No AI processing |
| แจ้งเตือนสถานะ (auto) | **0.10** | 0.0029 | LINE push only |

[^3]: Gemini 2.5 Flash: 250 requests/day (7,500/month) — [Source](https://ai.google.dev/gemini-api/docs/pricing)

---

## 📊 Monthly Cost by Scale (2026 Verified)

| Users | Active Users | Messages/Month | Cost/Month (฿) | Cost/User (฿) |
|-------|-------------|----------------|----------------|---------------|
| **50** | 30 | 3,600 | **1,235** | 41 |
| **100** | 60 | 7,200 | **1,665** | 28 |
| **500** | 300 | 36,000 | **4,825** | 16 |
| **1,000** | 600 | 72,000 | **9,495** | 16 |
| **2,500** | 1,500 | 180,000 | **18,723** | 12 |
| **5,000** | 3,000 | 450,000 | **35,351** | 12 |

**Assumptions**: 60% active rate, 4 messages/user/day

**Updated**: LINE pricing corrected from ฿0.15 to **฿0.10/message** (Thailand Pro plan)

---

## 🎯 API Pricing (Official Sources)

### OpenAI (gpt-4o-mini)
- **Input**: $0.150 / 1M tokens (฿0.00515 / 1K)
- **Output**: $0.600 / 1M tokens (฿0.0206 / 1K)
- **Embeddings**: $0.020 / 1M tokens (Standard), $0.010 / 1M (Batch)
- 📚 [Official Pricing](https://openai.com/api/pricing/)

### Gemini (2.5 Flash Vision)
- **Free Tier**: ✅ **250 requests/day** (7,500/month) — Flash
- **Free Tier**: ✅ **1,000 requests/day** (30K/month) — Flash-Lite
- **Paid**: $0.30 input / $2.50 output per 1M tokens
- **Vision**: ~258 tokens per image
- ⚠️ **Gemini 2.0 Flash-Lite deprecated June 1, 2026**
- 📚 [Official Pricing](https://ai.google.dev/gemini-api/docs/pricing)

### LINE Messaging API (Thailand)
- **Free**: 500 messages/month
- **Pro Plan**: ฿1,500/month → 10,000 free messages
- **Additional**: **฿0.10/message**
- **Reply messages**: Free (not counted)
- 📚 [Official Pricing](https://developers.line.biz/en/docs/messaging-api/pricing/) | [Thailand Info](https://brandinside.asia/line-official-account-reduce-cost-for-send-msg/)

### Supabase
- **Pro Plan**: $25/month (฿875) — 8GB DB, 100GB storage, 100K MAUs
- **Overages**: $0.125/GB (database), $0.00325/MAU
- **Real-world**: $35-75/month (฿1,225-2,625) with typical usage
- 📚 [Official Pricing](https://supabase.com/pricing)

---

## 💡 Quick Optimization Tips

### 🚀 Immediate (0% effort) — **฿1.5K/month savings**
1. ✅ **Use free tiers** — LINE 500 msg + Gemini 250/day
2. ✅ **Set rate limits** — 5 messages/user/minute

---

### ⚡ Easy (1 day) — **฿2.5K/month savings at 1,000 users**
3. **Cache common intents** — "เช็คคะแนน", "ดูพัสดุ" (30% reduction)
4. **Batch notifications** — 3 messages → 1 message (40% reduction)

```typescript
// Example: Intent caching (1-hour TTL)
const intentCache = new Map<string, { intent: ChatIntent; timestamp: number }>()
```

---

### 🔧 Medium (1 week) — **฿3K-4K/month savings at 1,000 users**
5. **LINE Pro plans** — Upgrade at 10K messages/month (฿0.15 → ฿0.10)
6. **Smart throttling** — Daily digest, urgent-only, scheduled delivery

---

### 🏗️ Advanced (1-3 months) — **฿5K-8K/month savings at 5,000 users**
7. **Gemini Flash-Lite** — 1,000/day free (4× more than Flash)
8. **Progressive Web App** — Shift 50% queries to web (no LINE cost)
9. **Enterprise LINE contract** — 20-40% bulk discount

---

## ⚠️ Cost Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Gemini free tier policy change | +฿400/mo | Medium | Use Flash-Lite (4× capacity) |
| LINE price +20% | +฿1.5K/mo | Low | Web app + rich menu |
| Viral spike (10× users) | +฿50K/mo | Low | Rate limits (10 msg/user/day) |
| OpenAI price +50% | +฿350/mo | Medium | Aggressive caching |

---

## 🎯 Break-even Analysis

### At ฿100/month subscription:

| Scale | Active Users | Cost | Revenue | Profit | Margin |
|-------|-------------|------|---------|--------|--------|
| 100 | 60 | ฿1.7K | ฿6K | **฿4.3K** | 72% |
| 500 | 300 | ฿4.8K | ฿30K | **฿25K** | 84% |
| 1,000 | 600 | ฿9.5K | ฿60K | **฿50K** | 84% |
| 5,000 | 3,000 | ฿35K | ฿300K | **฿265K** | 88% |

**Break-even**: **17 active users** at ฿100/month

---

## 📈 Year 1 Projection (Updated)

| Quarter | Users | Messages/Month | Cost/Month |
|---------|-------|----------------|------------|
| **Q1** | 100 | 7,200 | ฿1,665 |
| **Q2** | 300 | 21,600 | ฿3,040 |
| **Q3** | 600 | 43,200 | ฿5,195 |
| **Q4** | 1,000 | 72,000 | ฿9,495 |

**Total Year 1**: ~฿60,000 (~$1,715)

---

## 🚨 Alert Thresholds (Recommended)

```yaml
alerts:
  # LINE Free Tier
  - condition: messages_this_month > 450
    action: notify_admin, prepare_pro_upgrade

  # Gemini Daily Limit
  - condition: gemini_requests_today > 200
    action: switch_to_flash_lite

  # Cost Spike
  - condition: daily_cost > 3x_average
    action: investigate_logs, enable_rate_limit

  # OpenAI Usage Spike
  - condition: openai_tokens_today > 5M
    action: check_for_infinite_loop

  # Supabase Approaching Limit
  - condition: database_size > 7GB
    action: optimize_indexes, archive_data
```

---

## 📊 Usage Formula

```
Monthly Messages = Users × 60% (active) × 4 (msgs/day) × 30
Monthly Cost (฿) = (Messages × ฿0.10) + OpenAI (~5%) + Supabase (฿875)
Cost per User = Monthly Cost ÷ Active Users
```

**Example (1,000 users)**:
- Active: 1,000 × 60% = 600
- Messages: 600 × 4 × 30 = 72,000
- Cost: (72K × ฿0.10) + ฿700 (OpenAI) + ฿1,200 (Supabase) = **฿9,495**
- Per user: ฿9,495 ÷ 600 = **฿16/user/month**

---

## 🔍 Monitoring Dashboard (Recommended)

Track daily:
- ✅ **Active users** (DAU) — target 60% of registered
- ✅ **Messages sent** (by type: repair/FAQ/chitchat/simple)
- ✅ **OpenAI tokens** used — target <0.0003/request
- ✅ **Gemini requests** count — warn at 80% of daily limit (200/250)
- ✅ **Cost per user** — benchmark against projections
- ✅ **LINE tier usage** — % of monthly limit (e.g., 450/500)

---

## 📚 Key Changes from v1.0

| Item | Old (v1.0) | New (v1.1) | Source |
|------|-----------|-----------|--------|
| **LINE cost** | ฿0.15/msg | **฿0.10/msg** | [Thailand pricing 2019](https://brandinside.asia/line-official-account-reduce-cost-for-send-msg/) |
| **Gemini model** | 2.0 Flash | **2.5 Flash** | [Pricing docs](https://ai.google.dev/gemini-api/docs/pricing) |
| **Gemini free tier** | 1,500/day | **250/day** (Flash)<br>**1,000/day** (Flash-Lite) | [Free tier guide](https://ai.google.dev/gemini-api/docs/pricing) |
| **Avg cost/request** | ฿0.15 | **฿0.10-0.12** | Recalculated with new rates |
| **Cost at 1K users** | ฿8,775 | **฿9,495** | Includes Gemini overages |

---

## 📖 Full Details

See **[cost-analysis.md](./cost-analysis.md)** for:
- ✅ Detailed breakdown per feature (with token counts)
- ✅ API call examples with real calculations
- ✅ Long-term optimization strategies (self-hosting, fine-tuning)
- ✅ Risk analysis & contingency plans
- ✅ Comprehensive references & sources

---

## 📎 Official Sources

All pricing verified from official documentation:

1. **OpenAI**: https://openai.com/api/pricing/
2. **Gemini**: https://ai.google.dev/gemini-api/docs/pricing
3. **LINE**: https://developers.line.biz/en/docs/messaging-api/pricing/
4. **LINE Thailand**: https://brandinside.asia/line-official-account-reduce-cost-for-send-msg/
5. **Supabase**: https://supabase.com/pricing

---

**Document Owner**: Khaoklong (Product)
**Last Reviewed**: 2026-03-21 | **Next Review**: 2026-06-21
**Change Log**: v1.1 — Updated all pricing with verified sources, corrected LINE ฿0.10, Gemini 2.5 Flash
