import Anthropic from '@anthropic-ai/sdk'
import type { SearchResult } from './pinecone'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const INDICATOR_LABELS: Record<string, string> = {
  scholarship_per_student: '재학생1인당장학금',
  fulltime_faculty_ratio: '전임교원확보율',
  education_cost_per_student: '학생1인당교육비',
  books_per_student: '학생1인당도서수',
  foreign_student_support: '외국인유학생1인당지원금',
  fulltime_lecture_ratio: '전임교원강의담당비율',
  dept_student_count: '단과대학생수',
  employment_rate: '졸업후취업비율',
  major_related_employment: '전공관련취업자비율',
  major_research_cost: '전공관련1인당연구비',
  corporate_transfer: '법인전입금',
}

function formatIndicators(indicators: Record<string, number>): string {
  return Object.entries(indicators)
    .map(([k, v]) => {
      const label = INDICATOR_LABELS[k] ?? k
      if (k.includes('ratio') || k.includes('rate') || k.includes('employment') || k.includes('lecture')) {
        return `${label}: ${v}%`
      }
      if (v >= 100000000) return `${label}: ${(v / 100000000).toFixed(1)}억원`
      if (v >= 10000) return `${label}: ${Math.round(v / 10000)}만원`
      return `${label}: ${v}`
    })
    .join(', ')
}

export interface RecommendationItem {
  university_id: string
  university_name: string
  region: string
  univ_type: string
  score: number
  rank: number
  reason: string
  key_indicators: { name: string; value: string }[]
}

export async function generateRecommendations(
  contextSummary: string,
  viewedIndicators: string[],
  candidates: SearchResult[]
): Promise<RecommendationItem[]> {
  const candidateText = candidates.map((c, i) =>
    `[후보 ${i + 1}] ${c.university_name} (${c.region}, ${c.univ_type})\n` +
    `유사도 점수: ${(c.score * 100).toFixed(1)}%\n` +
    `지표: ${formatIndicators(c.indicators)}`
  ).join('\n\n')

  const prompt = `당신은 대학 입학 상담 전문가입니다. 아래 사용자 탐색 맥락과 후보 대학 목록을 바탕으로 상위 3개 대학을 추천하고 각 이유를 설명하세요.

## 사용자 탐색 맥락
${contextSummary}

## 관심 지표
${viewedIndicators.length > 0 ? viewedIndicators.join(', ') : '특정 지표 없음'}

## 후보 대학
${candidateText}

## 출력 형식 (JSON 배열만 출력, 다른 텍스트 없이)
[
  {
    "university_id": "UNIV_XXX",
    "university_name": "대학명",
    "rank": 1,
    "reason": "추천 이유 (2~3문장, 구체적 지표 수치 포함)",
    "key_indicator_ids": ["employment_rate", "scholarship_per_student"]
  }
]`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // JSON 파싱 (코드블록 감싸져 있을 경우 제거)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned) as Array<{
    university_id: string
    university_name: string
    rank: number
    reason: string
    key_indicator_ids: string[]
  }>

  return parsed.map(item => {
    const candidate = candidates.find(c => c.university_id === item.university_id)
    const keyIndicators = (item.key_indicator_ids ?? []).slice(0, 3).map(id => {
      const value = candidate?.indicators[id]
      const label = INDICATOR_LABELS[id] ?? id
      if (value === undefined) return { name: label, value: '-' }
      if (id.includes('ratio') || id.includes('rate') || id.includes('employment') || id.includes('lecture')) {
        return { name: label, value: `${value}%` }
      }
      if (value >= 100000000) return { name: label, value: `${(value / 100000000).toFixed(1)}억원` }
      if (value >= 10000) return { name: label, value: `${Math.round(value / 10000)}만원` }
      return { name: label, value: String(value) }
    })

    return {
      university_id: item.university_id,
      university_name: item.university_name,
      region: candidate?.region ?? '',
      univ_type: candidate?.univ_type ?? '',
      score: candidate?.score ?? 0,
      rank: item.rank,
      reason: item.reason,
      key_indicators: keyIndicators,
    }
  })
}
