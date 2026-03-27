import type { SessionContextDocument } from '../types/session'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export interface RecommendationItem {
  id?: string
  university_id: string
  university_name: string
  region: string
  univ_type: string
  score: number
  rank: number
  reason: string
  key_indicators: { name: string; value: string }[]
}

export interface RecommendResponse {
  recommendations: RecommendationItem[]
  ab_group: 'A' | 'B'
  generated_at: string
}

export async function fetchRecommendations(
  context: SessionContextDocument
): Promise<RecommendResponse> {
  const res = await fetch(`${BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: context.session_id,
      intent_pattern: context.intent_pattern,
      summary: context.summary,
      viewed_universities: context.viewed_universities,
      viewed_indicators: context.viewed_indicators,
      applied_filters: context.applied_filters,
    }),
  })
  if (!res.ok) throw new Error(`추천 API 오류: ${res.status}`)
  return res.json()
}

export async function sendFeedback(params: {
  session_id: string
  recommendation_id: string
  feedback_type: 'click' | 'positive' | 'negative'
  position_rank: number
  ab_group: string
}): Promise<void> {
  await fetch(`${BASE_URL}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
}

export interface AbStats {
  ab_group: string
  total_clicks: number
  positive: number
  negative: number
  ctr: number
}

export async function fetchAbStats(): Promise<AbStats[]> {
  const res = await fetch(`${BASE_URL}/api/feedback/stats`)
  if (!res.ok) throw new Error(`통계 API 오류: ${res.status}`)
  const data = await res.json()
  return data.stats
}
