import type { BehaviorEvent, PageViewMetadata, IndicatorViewMetadata, FilterApplyMetadata, DwellMetadata } from '../../types/events'
import type { SessionContextDocument, IntentPattern } from '../../types/session'
import { detectIntentPattern } from './behaviorAnalyzer'

const INTENT_LABEL: Record<IntentPattern, string> = {
  UNIV_FIRST: '대학 중심 탐색',
  INDICATOR_FIRST: '지표 중심 탐색',
  REGION_FIRST: '지역 중심 탐색',
  COMPARE_MODE: '대학 비교 중심',
  EXPLORATORY: '다양한 탐색',
  UNKNOWN: '패턴 미확인',
}

// 조회한 대학명 목록 (중복 제거, 순서 유지)
function extractViewedUniversities(events: BehaviorEvent[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  events.forEach(e => {
    if (e.event_type === 'PAGE_VIEW' || e.event_type === 'INDICATOR_VIEW') {
      const meta = e.metadata as PageViewMetadata | IndicatorViewMetadata
      const name = (meta as PageViewMetadata).university_name ?? (meta as IndicatorViewMetadata).university_name
      if (name && !seen.has(name)) {
        seen.add(name)
        result.push(name)
      }
    }
  })
  return result
}

// 조회한 지표명 목록 (중복 제거, 순서 유지)
function extractViewedIndicators(events: BehaviorEvent[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  events.forEach(e => {
    if (e.event_type === 'INDICATOR_VIEW') {
      const meta = e.metadata as IndicatorViewMetadata
      if (!seen.has(meta.indicator_name)) {
        seen.add(meta.indicator_name)
        result.push(meta.indicator_name)
      }
    }
  })
  return result
}

// 적용한 필터 목록
function extractAppliedFilters(events: BehaviorEvent[]): Record<string, string> {
  const filters: Record<string, string> = {}
  events.forEach(e => {
    if (e.event_type === 'FILTER_APPLY') {
      const meta = e.metadata as FilterApplyMetadata
      filters[meta.filter_type] = meta.filter_value
    }
  })
  return filters
}

// 페이지별 체류시간 합산
function extractDwellSummary(events: BehaviorEvent[]): Record<string, number> {
  const summary: Record<string, number> = {}
  events.forEach(e => {
    if (e.event_type === 'DWELL') {
      const meta = e.metadata as DwellMetadata
      summary[meta.page_url] = (summary[meta.page_url] ?? 0) + meta.dwell_time_seconds
    }
  })
  return summary
}

// 자연어 요약 생성 (RAG + GPT-Oss 프롬프트 컨텍스트용)
function buildSummary(
  intentPattern: IntentPattern,
  viewedUniversities: string[],
  viewedIndicators: string[],
  appliedFilters: Record<string, string>,
  dwellSummary: Record<string, number>
): string {
  const parts: string[] = []

  // 의도 패턴
  parts.push(`이 사용자의 탐색 패턴은 '${INTENT_LABEL[intentPattern]}'입니다.`)

  // 조회 대학
  if (viewedUniversities.length > 0) {
    parts.push(`조회한 대학: ${viewedUniversities.join(', ')}.`)
  }

  // 조회 지표
  if (viewedIndicators.length > 0) {
    parts.push(`관심 지표: ${viewedIndicators.join(', ')}.`)
  }

  // 적용 필터
  const filterEntries = Object.entries(appliedFilters)
  if (filterEntries.length > 0) {
    const filterDesc = filterEntries.map(([k, v]) => `${k}(${v})`).join(', ')
    parts.push(`적용한 필터: ${filterDesc}.`)
  }

  // 체류 시간 (상위 2개만)
  const dwellEntries = Object.entries(dwellSummary).sort(([, a], [, b]) => b - a).slice(0, 2)
  if (dwellEntries.length > 0) {
    const dwellDesc = dwellEntries.map(([url, sec]) => `${url}에서 ${sec}초`).join(', ')
    parts.push(`주요 체류: ${dwellDesc}.`)
  }

  return parts.join(' ')
}

export function buildSessionContext(
  sessionId: string,
  events: BehaviorEvent[]
): SessionContextDocument {
  const intentPattern = detectIntentPattern(events)
  const viewedUniversities = extractViewedUniversities(events)
  const viewedIndicators = extractViewedIndicators(events)
  const appliedFilters = extractAppliedFilters(events)
  const dwellSummary = extractDwellSummary(events)
  const summary = buildSummary(intentPattern, viewedUniversities, viewedIndicators, appliedFilters, dwellSummary)

  return {
    session_id: sessionId,
    intent_pattern: intentPattern,
    summary,
    viewed_universities: viewedUniversities,
    viewed_indicators: viewedIndicators,
    applied_filters: appliedFilters,
    dwell_summary: dwellSummary,
    event_count: events.length,
    created_at: new Date().toISOString(),
  }
}
