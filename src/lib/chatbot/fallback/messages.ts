/**
 * Fallback Message System with Rotation
 * 5 personality tones × 4 topics = 20 variants
 */

import type { TopicCategory } from './topic-detector'
import { getSession, updateSession } from '../session-manager'

export type PersonalityTone = 'apologetic' | 'encouraging' | 'friendly' | 'helpful' | 'playful'

interface FallbackState {
  count: number
  lastIndex: number
  lastTopic: TopicCategory
}

/**
 * Fallback messages in Thai (i18n keys)
 * Organized by topic → tone
 */
const FALLBACK_MESSAGES: Record<TopicCategory, Record<PersonalityTone, string>> = {
  billing: {
    apologetic: 'ขอโทษน้า หาข้อมูลค่าหอเรื่องนี้ไม่เจอเลย 💰 ลองเช็คบิลล่าสุดในแอปหรือติดต่อการเงินหอนะ',
    encouraging: 'เรื่องค่าหอนี้ซีมะโด่งยังไม่มีคำตอบจ้า 🤔 แต่ลองดูบิลล่าสุดในแอปหรือเปลี่ยนคำถามดูนะ!',
    friendly: 'อุ๊ปส์! เรื่องนี้ซีมะโด่งไม่มีข้อมูลจ้า 📋 ลองดูบิลและประวัติการจ่ายได้ในแอปเลยนะ!',
    helpful: 'เรื่องค่าหอนี้ซีมะโด่งไม่แน่ใจน้า 🤔 แนะนำให้ติดต่อฝ่ายการเงินที่ 02-218-XXXX จะได้คำตอบที่แม่นยำนะ',
    playful: 'อุ๊ปส์! เรื่องนี้ซีมะโด่งไม่มีข้อมูลจ้า 💸 แต่ลองดูบิลและประวัติการจ่ายได้ในแอปเลยนะ!'
  },
  repair: {
    apologetic: 'ขอโทษน้า เรื่องซ่อมนี้ซีมะโด่งไม่แน่ใจเลย 🔧 ลองแจ้งซ่อมใหม่หรือติดตามสถานะดูมั้ย?',
    encouraging: 'เรื่องซ่อมนี้ซีมะโด่งยังไม่มีข้อมูลจ้า แต่สามารถแจ้งซ่อมได้ทันทีเลยนะ! 💪',
    friendly: 'อุ๊ปส์! เรื่องนี้ซีมะโด่งไม่แน่ใจน้า 😅 ลองแจ้งซ่อมหรือเช็คสถานะดูมั้ย?',
    helpful: 'เรื่องซ่อมนี้ซีมะโด่งไม่มีคำตอบจ้า 🔨 ลองเลือกเมนูด้านล่างหรือแจ้งซ่อมใหม่ดูมั้ย?',
    playful: 'อ้าว! เรื่องซ่อมนี้ซีมะโด่งหาไม่เจอเลย 🎯 ลองแจ้งซ่อมหรือเช็คสถานะดูมั้ย?'
  },
  rules: {
    apologetic: 'ขอโทษน้า กฎข้อนี้ซีมะโด่งหาไม่เจอเลย 📋 ลองติดต่อสำนักงานหอจะได้คำตอบที่ชัดเจนกว่านะ',
    encouraging: 'กฎเรื่องนี้ซีมะโด่งยังไม่มีในระบบจ้า แต่ลองเปลี่ยนคำถามหรือเลือกเมนูด้านล่างดูนะ!',
    friendly: 'อุ๊ปส์! กฎข้อนี้ซีมะโด่งยังไม่มีในระบบจ้า 😊 ลองถามเจ้าหน้าที่หอจะได้คำตอบที่แน่นอนนะ',
    helpful: 'กฎเรื่องนี้ซีมะโด่งไม่แน่ใจน้า 🤔 แนะนำให้ติดต่อสำนักงานหอที่ 02-218-XXXX จะปลอดภัยกว่านะ',
    playful: 'อ้าว! กฎข้อนี้ซีมะโด่งยังไม่เคยเจอเลย 📖 ลองเลือกเมนูด้านล่างหรือติดต่อสำนักงานหอดูมั้ย?'
  },
  facilities: {
    apologetic: 'ขอโทษน้า สิ่งอำนวยความสะดวกเรื่องนี้ซีมะโด่งไม่มีข้อมูลเลย 🏢 ลองติดต่อสำนักงานหอนะ',
    encouraging: 'เรื่องนี้ซีมะโด่งยังไม่มีคำตอบจ้า แต่ลองเปลี่ยนคำถามหรือเลือกเมนูด้านล่างดูนะ!',
    friendly: 'อุ๊ปส์! เรื่องนี้ซีมะโด่งไม่มีข้อมูลจ้า 😊 ลองเลือกเมนูด้านล่างหรือติดต่อสำนักงานหอดูมั้ย?',
    helpful: 'เรื่องสิ่งอำนวยความสะดวกนี้ซีมะโด่งไม่แน่ใจจ้า ลองเลือกเมนูด้านล่างหรือติดต่อสำนักงานหอดูมั้ย?',
    playful: 'อ้าว! เรื่องนี้ซีมะโด่งยังไม่เคยเจอเลย 🎯 ลองถามใหม่หรือเลือกเมนูด้านล่างดูมั้ย?'
  },
  unknown: {
    apologetic: 'ขอโทษน้า ซีมะโด่งหาข้อมูลเรื่องนี้ไม่เจอเลย 😅 ลองถามเจ้าหน้าที่หอพักโดยตรงนะ',
    encouraging: 'เรื่องนี้ซีมะโด่งยังไม่มีคำตอบเก็บไว้เลยจ้า 🤔 แต่ลองถามอีกทีนะ บางทีถ้าเปลี่ยนคำถามนิดหน่อยอาจช่วยได้!',
    friendly: 'อุ๊ปส์! ซีมะโด่งหาคำตอบไม่เจอน้า 😊 เรื่องนี้ลองติดต่อสำนักงานหอโดยตรงจะเร็วกว่านะ',
    helpful: 'ซีมะโด่งไม่แน่ใจเรื่องนี้เท่าไหร่น้า 🙏 ลองเลือกเมนูด้านล่างดูมั้ย หรือจะติดต่อเจ้าหน้าที่ที่ 02-218-XXXX ก็ได้จ้า',
    playful: 'อ้าว! เรื่องนี้ซีมะโด่งยังไม่เคยเจอเลย 🎉 ช่วยถามใหม่ด้วยคำอื่นได้มั้ย? หรือจะลองเลือกเมนูด้านล่างก็ได้จ้า'
  }
}

const PERSONALITY_TONES: PersonalityTone[] = ['apologetic', 'encouraging', 'friendly', 'helpful', 'playful']

const ESCALATION_MESSAGE = 'ดูเหมือนซีมะโด่งช่วยไม่ได้เท่าไหร่น้า 😅 ต้องการคุยกับเจ้าหน้าที่มั้ย?'

/**
 * Get current fallback state from session
 */
export async function getFallbackState(lineUid: string): Promise<FallbackState> {
  try {
    const session = await getSession(lineUid)
    const stateData = session?.state_data || {}

    return {
      count: (stateData.fallback_count as number) || 0,
      lastIndex: (stateData.last_fallback_index as number) || 0,
      lastTopic: (stateData.last_fallback_topic as TopicCategory) || 'unknown'
    }
  } catch {
    return { count: 0, lastIndex: 0, lastTopic: 'unknown' }
  }
}

/**
 * Select fallback message with rotation
 * Triggers escalation message on 7th consecutive failure
 */
export async function selectFallbackMessage(
  lineUid: string,
  topic: TopicCategory,
  variant?: 'timeout' | 'default'
): Promise<string> {
  const state = await getFallbackState(lineUid)

  // Escalation trigger (7th consecutive failure)
  if (state.count >= 7) {
    return ESCALATION_MESSAGE
  }

  // Timeout variant (generic fallback)
  if (variant === 'timeout') {
    return 'อุ๊ปส์! ซีมะโด่งหาคำตอบไม่ทันน้า ลองใหม่อีกทีนะ'
  }

  // Get messages for topic (fallback to unknown)
  const messages = FALLBACK_MESSAGES[topic] || FALLBACK_MESSAGES['unknown']

  // Round-robin through 5 personality tones
  const tone = PERSONALITY_TONES[state.lastIndex % PERSONALITY_TONES.length]

  return messages[tone]
}

/**
 * Update rotation state after sending fallback message
 */
export async function updateRotationState(
  lineUid: string,
  topic: TopicCategory
): Promise<void> {
  const state = await getFallbackState(lineUid)

  // Detect topic change (reset rotation)
  const topicChanged = state.lastTopic !== topic && state.lastTopic !== 'unknown'
  const newIndex = topicChanged ? 0 : (state.lastIndex + 1) % PERSONALITY_TONES.length

  await updateSession(lineUid, {
    fallback_count: state.count + 1,
    last_fallback_index: newIndex,
    last_fallback_at: new Date().toISOString(),
    last_fallback_topic: topic
  })
}

/**
 * Reset fallback counter (user successfully gets answer)
 */
export async function resetFallbackCount(lineUid: string): Promise<void> {
  await updateSession(lineUid, {
    fallback_count: 0,
    last_fallback_at: new Date().toISOString()
  })
}

/**
 * Increment fallback counter without rotation
 */
export async function incrementFallbackCount(lineUid: string): Promise<number> {
  const state = await getFallbackState(lineUid)
  const newCount = state.count + 1

  await updateSession(lineUid, {
    fallback_count: newCount
  })

  return newCount
}
