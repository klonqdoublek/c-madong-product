/**
 * Smart Suggestion Engine — Synchronous
 * Universal fallback: just "คุยกับเจ้าหน้าที่"
 */

import type { QuickReplyItem } from '../types'

const TALK_TO_STAFF: QuickReplyItem = {
  type: 'action',
  action: { type: 'message', label: '💬 คุยกับเจ้าหน้าที่', text: 'ขอคุยกับเจ้าหน้าที่' }
}

/**
 * Get fallback quick reply — always "talk to staff"
 * No topic detection needed, cannot fail
 */
export function getSmartSuggestions(): QuickReplyItem[] {
  return [TALK_TO_STAFF]
}
