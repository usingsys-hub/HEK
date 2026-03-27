import { useState, useCallback } from 'react'
import { fetchRecommendations, sendFeedback, type RecommendResponse } from '../api/client'
import type { SessionContextDocument } from '../types/session'

interface UseRecommendationReturn {
  response: RecommendResponse | null
  loading: boolean
  error: string | null
  getRecommendations: (context: SessionContextDocument) => Promise<void>
  recordFeedback: (params: {
    recommendationId: string
    feedbackType: 'click' | 'positive' | 'negative'
    positionRank: number
    sessionId: string
  }) => Promise<void>
}

export function useRecommendation(): UseRecommendationReturn {
  const [response, setResponse] = useState<RecommendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRecommendations = useCallback(async (context: SessionContextDocument) => {
    if (context.event_count < 2) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRecommendations(context)
      setResponse(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }, [])

  const recordFeedback = useCallback(async (params: {
    recommendationId: string
    feedbackType: 'click' | 'positive' | 'negative'
    positionRank: number
    sessionId: string
  }) => {
    if (!response) return
    await sendFeedback({
      session_id: params.sessionId,
      recommendation_id: params.recommendationId,
      feedback_type: params.feedbackType,
      position_rank: params.positionRank,
      ab_group: response.ab_group,
    }).catch(console.error)
  }, [response])

  return { response, loading, error, getRecommendations, recordFeedback }
}
