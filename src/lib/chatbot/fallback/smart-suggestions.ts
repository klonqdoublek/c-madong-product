/**
 * Smart Suggestion Engine — Synchronous
 * 1 topic-related action + "คุยกับเจ้าหน้าที่" per fallback
 */

import type { TopicCategory } from './topic-detector'
import type { QuickReplyItem } from '../types'

const TALK_TO_STAFF: QuickReplyItem = {
  type: 'action',
  action: { type: 'message', label: '💬 คุยกับเจ้าหน้าที่', text: 'ขอคุยกับเจ้าหน้าที่' }
}

const TOPIC_SUGGESTIONS: Record<TopicCategory, QuickReplyItem> = {
  billing:    { type: 'action', action: { type: 'message', label: '💰 ดูบิล', text: 'ค่าหอ' } },
  repair:     { type: 'action', action: { type: 'message', label: '🔧 แจ้งซ่อม', text: 'แจ้งซ่อม' } },
  rules:      { type: 'action', action: { type: 'message', label: '📋 กฎหอพัก', text: 'กฎหอพัก' } },
  facilities: { type: 'action', action: { type: 'message', label: '🏢 สิ่งอำนวยความสะดวก', text: 'สิ่งอำนวยความสะดวก' } },
  unknown:    { type: 'action', action: { type: 'message', label: '📋 เมนูหลัก', text: 'น้องซีมะโด่ง' } },
}

/**
 * Generate quick reply suggestions — synchronous, cannot fail
 * Returns [topic action, talk to staff]
 */
export function getSmartSuggestions(topic: TopicCategory): QuickReplyItem[] {
  const topicAction = TOPIC_SUGGESTIONS[topic] || TOPIC_SUGGESTIONS['unknown']
  return [topicAction, TALK_TO_STAFF]
}
