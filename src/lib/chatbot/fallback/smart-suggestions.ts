/**
 * Smart Suggestion Engine
 * Context-aware quick replies with priority matrix
 */

import type { TopicCategory } from './topic-detector'
import { createAdminClient } from '@/lib/supabase/admin'
import { MAIN_MENU_QUICK_REPLY } from '../quick-reply'
import type { QuickReplyItem } from '../types'

interface UserActivityContext {
  hasUnpaidBills: boolean
  hasOverdueBills: boolean
  hasPendingRepairs: boolean
  hasUnclaimedParcels: boolean
  hasUpcomingEvents: boolean
  hasLowScore: boolean
  lastActivityType?: 'repair' | 'bill' | 'event' | 'parcel'
}

const DEFAULT_CONTEXT: UserActivityContext = {
  hasUnpaidBills: false,
  hasOverdueBills: false,
  hasPendingRepairs: false,
  hasUnclaimedParcels: false,
  hasUpcomingEvents: false,
  hasLowScore: false
}

/**
 * Fetch user activity context with 500ms timeout
 */
async function fetchUserContext(lineUid: string): Promise<UserActivityContext> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 500)

  try {
    const adminClient = createAdminClient()

    // Get profile ID
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('line_uid', lineUid)
      .single()

    if (!profile) return DEFAULT_CONTEXT

    // Parallel queries for activity
    const [bills, repairs, parcels, events] = await Promise.all([
      adminClient
        .from('bills')
        .select('paid_at, due_date')
        .eq('user_id', profile.id)
        .is('paid_at', null)
        .limit(5),
      adminClient
        .from('maintenance_requests')
        .select('status')
        .eq('reporter_id', profile.id)
        .in('status', ['pending', 'acknowledged'])
        .limit(5),
      adminClient
        .from('parcels')
        .select('collected_at')
        .eq('resident_id', profile.id)
        .is('collected_at', null)
        .limit(5),
      adminClient
        .from('dorm_events')
        .select('event_date')
        .gte('event_date', new Date().toISOString())
        .limit(5)
    ])

    const unpaidBills = bills.data || []
    const now = new Date()

    return {
      hasUnpaidBills: unpaidBills.length > 0,
      hasOverdueBills: unpaidBills.some(b => new Date(b.due_date) < now),
      hasPendingRepairs: (repairs.data?.length ?? 0) > 0,
      hasUnclaimedParcels: (parcels.data?.length ?? 0) > 0,
      hasUpcomingEvents: (events.data?.length ?? 0) > 0,
      hasLowScore: false // TODO: implement score check when score system is available
    }
  } catch (err) {
    // Timeout or DB error → return default
    return DEFAULT_CONTEXT
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Static suggestions by topic (fallback when context fetch fails)
 */
const STATIC_SUGGESTIONS: Record<TopicCategory, QuickReplyItem[]> = {
  billing: [
    { type: 'action', action: { type: 'message', label: '💰 ดูบิล', text: 'ค่าหอ' } },
    { type: 'action', action: { type: 'message', label: '📋 กฎการชำระ', text: 'กฎการชำระค่าหอ' } },
    { type: 'action', action: { type: 'message', label: '📊 เช็คคะแนน', text: 'คะแนนหอ' } }
  ],
  repair: [
    { type: 'action', action: { type: 'message', label: '🔧 แจ้งซ่อม', text: 'แจ้งซ่อม' } },
    { type: 'action', action: { type: 'message', label: '🔍 ติดตามสถานะ', text: 'ติดตามสถานะ' } },
    { type: 'action', action: { type: 'message', label: '📋 กฎหอพัก', text: 'กฎหอพัก' } }
  ],
  rules: [
    { type: 'action', action: { type: 'message', label: '📋 กฎหอพัก', text: 'กฎหอพัก' } },
    { type: 'action', action: { type: 'message', label: '🏢 สิ่งอำนวยความสะดวก', text: 'สิ่งอำนวยความสะดวก' } },
    { type: 'action', action: { type: 'message', label: '📊 เช็คคะแนน', text: 'คะแนนหอ' } }
  ],
  facilities: [
    { type: 'action', action: { type: 'message', label: '🏢 สิ่งอำนวยความสะดวก', text: 'สิ่งอำนวยความสะดวก' } },
    { type: 'action', action: { type: 'message', label: '📋 กฎหอพัก', text: 'กฎหอพัก' } },
    { type: 'action', action: { type: 'message', label: '🎉 ดูกิจกรรม', text: 'กิจกรรมหอ' } }
  ],
  unknown: MAIN_MENU_QUICK_REPLY.items.slice(0, 3)
}

/**
 * Generate smart suggestions based on user context and topic
 * Returns top 3 suggestions by priority
 */
export async function generateSmartSuggestions(
  lineUid: string,
  topic: TopicCategory,
  query: string,
  failbackCount: number = 0
): Promise<QuickReplyItem[]> {
  try {
    // Fetch user context (with timeout)
    const context = await fetchUserContext(lineUid)

    const suggestions: Array<{ item: QuickReplyItem; priority: number }> = []

    // Level 1: Urgent context-based (priority 90-100)
    if (context.hasOverdueBills) {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '💰 เช็คบิลค้างชำระ', text: 'ค่าหอ' } },
        priority: 95
      })
    }

    if (context.hasUnclaimedParcels) {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '📦 พัสดุรอรับ', text: 'พัสดุ' } },
        priority: 90
      })
    }

    // Level 2: Topic-related (priority 70-80)
    if (topic === 'billing' && !context.hasOverdueBills) {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '💰 ดูบิลล่าสุด', text: 'ค่าหอ' } },
        priority: 75
      })
    }

    if (topic === 'repair') {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '🔧 แจ้งซ่อม', text: 'แจ้งซ่อม' } },
        priority: 80
      })
    }

    if (topic === 'rules') {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '📋 กฎหอพัก', text: 'กฎหอพัก' } },
        priority: 80
      })
    }

    if (topic === 'facilities') {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '🏢 สิ่งอำนวยความสะดวก', text: 'สิ่งอำนวยความสะดวก' } },
        priority: 80
      })
    }

    // Level 3: Generic helpful (priority 50-60)
    if (!suggestions.some(s => s.item.action.text === 'คะแนนหอ')) {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '📊 เช็คคะแนนหอ', text: 'คะแนนหอ' } },
        priority: 55
      })
    }

    if (context.hasUpcomingEvents && !suggestions.some(s => s.item.action.text === 'กิจกรรมหอ')) {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '🎉 ดูกิจกรรม', text: 'กิจกรรมหอ' } },
        priority: 60
      })
    } else if (!suggestions.some(s => s.item.action.text === 'กิจกรรมหอ')) {
      suggestions.push({
        item: { type: 'action', action: { type: 'message', label: '🎉 ดูกิจกรรม', text: 'กิจกรรมหอ' } },
        priority: 50
      })
    }

    // Add escalation on 7th failure
    if (failbackCount >= 7) {
      suggestions.unshift({
        item: { type: 'action', action: { type: 'message', label: '💬 คุยกับเจ้าหน้าที่', text: 'ขอคุยกับเจ้าหน้าที่' } },
        priority: 100
      })
    }

    // Sort by priority, take top 3
    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3)
      .map(s => s.item)

  } catch {
    // Context fetch failed → fallback to static suggestions
    return STATIC_SUGGESTIONS[topic] || STATIC_SUGGESTIONS['unknown']
  }
}
