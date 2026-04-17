/**
 * Topic Detection for Chatbot Fallback
 * Lightweight keyword matching (<1ms)
 */

export type TopicCategory = 'rules' | 'billing' | 'facilities' | 'repair' | 'unknown'

const TOPIC_KEYWORDS: Record<TopicCategory, string[]> = {
  rules: [
    'กฎ', 'ระเบียบ', 'ข้อบังคับ', 'ห้าม', 'อนุญาต', 'กำหนด', 'โทษ',
    'ชั่วโมง', 'เวลา', 'ไม่ได้', 'กฎหมาย', 'บทลงโทษ', 'เข้ากะ'
  ],
  billing: [
    'ค่าหอ', 'ค่าน้ำ', 'ค่าไฟ', 'จ่ายเงิน', 'บิล', 'ค่าใช้จ่าย', 'ชำระ',
    'เงิน', 'ค่าธรรมเนียม', 'ค่าบริการ', 'ยอดเงิน', 'ค้างชำระ'
  ],
  facilities: [
    'สิ่งอำนวยความสะดวก', 'ห้องสมุด', 'ฟิตเนส', 'ซักรีด', 'ที่จอดรถ',
    'wifi', 'อินเทอร์เน็ต', 'ห้องอ่านหนังสือ', 'ห้องประชุม', 'สระว่ายน้ำ',
    'ลานกีฬา', 'ร้านค้า'
  ],
  repair: [
    'ซ่อม', 'เสีย', 'รั่ว', 'แอร์', 'ก๊อก', 'ไฟ', 'ไฟฟ้า', 'ประตู',
    'หน้าต่าง', 'พัง', 'ชำรุด', 'ไม่ทำงาน', 'ห้องน้ำ', 'เครื่องทำน้ำอุ่น'
  ],
  unknown: [] // Fallback category
}

/**
 * Detect topic category from user query
 * Returns most relevant topic or 'unknown'
 */
export function detectTopic(query: string): TopicCategory {
  const lowerQuery = query.toLowerCase()

  // Count keyword matches per topic
  const topicScores: Partial<Record<TopicCategory, number>> = {}

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (topic === 'unknown') continue

    const matchCount = keywords.filter(kw =>
      lowerQuery.includes(kw.toLowerCase())
    ).length

    if (matchCount > 0) {
      topicScores[topic as TopicCategory] = matchCount
    }
  }

  // Return topic with highest score
  if (Object.keys(topicScores).length === 0) {
    return 'unknown'
  }

  return Object.entries(topicScores).reduce((a, b) =>
    (topicScores[a[0] as TopicCategory] ?? 0) > (topicScores[b[0] as TopicCategory] ?? 0) ? a : b
  )[0] as TopicCategory
}
