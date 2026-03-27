import React, { useEffect } from 'react'
import type { SessionContextDocument } from '../types/session'
import { useRecommendation } from '../hooks/useRecommendation'
import type { RecommendationItem } from '../api/client'

interface Props {
  context: SessionContextDocument | null
  sessionId: string
}

function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 85 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#64748b'
  return (
    <span style={{
      background: color,
      color: '#fff',
      borderRadius: 4,
      padding: '1px 6px',
      fontSize: 11,
      fontWeight: 700,
    }}>
      {pct}%
    </span>
  )
}

function RecommendationCard({
  item,
  sessionId,
  abGroup,
  onFeedback,
}: {
  item: RecommendationItem
  sessionId: string
  abGroup: string
  onFeedback: (type: 'click' | 'positive' | 'negative') => void
}) {
  const recId = `${sessionId}_${item.university_id}_${item.rank}`
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '12px 14px',
      marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ color: '#94a3b8', fontSize: 12, minWidth: 18 }}>#{item.rank}</span>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>
          {item.university_name}
        </span>
        <span style={{ color: '#64748b', fontSize: 11 }}>
          {item.region} · {item.univ_type}
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <ScoreBadge score={item.score} />
        </div>
      </div>

      <p style={{ color: '#cbd5e1', fontSize: 12, margin: '0 0 8px 26px', lineHeight: 1.5 }}>
        {item.reason}
      </p>

      {item.key_indicators.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 26, marginBottom: 8 }}>
          {item.key_indicators.map(ind => (
            <span key={ind.name} style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 10,
              color: '#94a3b8',
            }}>
              {ind.name}: <strong style={{ color: '#e2e8f0' }}>{ind.value}</strong>
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginLeft: 26 }}>
        <button
          onClick={() => onFeedback('click')}
          style={btnStyle('#3b82f6')}
          title="자세히 보기"
        >
          상세보기
        </button>
        <button
          onClick={() => onFeedback('positive')}
          style={btnStyle('#22c55e')}
          title="도움이 됐어요"
        >
          👍
        </button>
        <button
          onClick={() => onFeedback('negative')}
          style={btnStyle('#ef4444')}
          title="맞지 않아요"
        >
          👎
        </button>
      </div>
    </div>
  )
}

function btnStyle(color: string): React.CSSProperties {
  return {
    background: 'transparent',
    border: `1px solid ${color}`,
    color: color,
    borderRadius: 4,
    padding: '2px 8px',
    fontSize: 11,
    cursor: 'pointer',
  }
}

export function RecommendationPanel({ context, sessionId }: Props) {
  const { response, loading, error, getRecommendations, recordFeedback } = useRecommendation()

  useEffect(() => {
    if (context && context.event_count >= 2) {
      getRecommendations(context)
    }
  }, [context?.event_count, context?.intent_pattern])

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
          AI 추천
        </span>
        {response && (
          <span style={{
            background: response.ab_group === 'B' ? '#7c3aed' : '#0369a1',
            color: '#fff',
            fontSize: 10,
            padding: '1px 5px',
            borderRadius: 3,
            fontWeight: 700,
          }}>
            그룹 {response.ab_group}{response.ab_group === 'B' ? ' (RAG)' : ' (규칙)'}
          </span>
        )}
        {loading && (
          <span style={{ color: '#64748b', fontSize: 11 }}>추천 생성 중...</span>
        )}
      </div>

      {!context || context.event_count < 2 ? (
        <p style={{ color: '#475569', fontSize: 12 }}>
          탐색 활동이 2개 이상 쌓이면 맞춤 대학을 추천해드립니다.
        </p>
      ) : error ? (
        <p style={{ color: '#f87171', fontSize: 12 }}>오류: {error}</p>
      ) : response ? (
        <>
          {response.recommendations.map(item => (
            <RecommendationCard
              key={item.university_id}
              item={item}
              sessionId={sessionId}
              abGroup={response.ab_group}
              onFeedback={(type) => recordFeedback({
                recommendationId: `${sessionId}_${item.university_id}_${item.rank}`,
                feedbackType: type,
                positionRank: item.rank,
                sessionId,
              })}
            />
          ))}
          <p style={{ color: '#475569', fontSize: 10, marginTop: 4 }}>
            {new Date(response.generated_at).toLocaleTimeString('ko-KR')} 기준
          </p>
        </>
      ) : null}
    </div>
  )
}
