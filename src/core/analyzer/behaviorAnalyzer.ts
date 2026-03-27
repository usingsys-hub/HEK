import type { BehaviorEvent, SearchMetadata, PageViewMetadata, FilterApplyMetadata } from '../../types/events'
import type { IntentPattern } from '../../types/session'

// 설계서 5.2 기준 Rule-based 의도 패턴 분류
// ML/DL 없이 if-else 규칙으로 처리

function getFirst(events: BehaviorEvent[], n: number): BehaviorEvent[] {
  return events.slice(0, n)
}

function hasEventType(events: BehaviorEvent[], type: BehaviorEvent['event_type']): boolean {
  return events.some(e => e.event_type === type)
}

function countEventType(events: BehaviorEvent[], type: BehaviorEvent['event_type']): number {
  return events.filter(e => e.event_type === type).length
}

// SEARCH 이벤트의 search_type 확인
function hasSearchOfType(events: BehaviorEvent[], searchType: string): boolean {
  return events.some(e => {
    if (e.event_type !== 'SEARCH') return false
    const meta = e.metadata as SearchMetadata
    return meta.search_type === searchType
  })
}

// PAGE_VIEW 이벤트의 page_type 확인
function hasPageViewOfType(events: BehaviorEvent[], pageType: string): boolean {
  return events.some(e => {
    if (e.event_type !== 'PAGE_VIEW') return false
    const meta = e.metadata as PageViewMetadata
    return meta.page_type === pageType
  })
}

// 필터 타입 확인
function hasFilterOfType(events: BehaviorEvent[], filterType: string): boolean {
  return events.some(e => {
    if (e.event_type !== 'FILTER_APPLY') return false
    const meta = e.metadata as FilterApplyMetadata
    return meta.filter_type === filterType
  })
}

// 서로 다른 대학 PAGE_VIEW 수
function countDistinctUniversityViews(events: BehaviorEvent[]): number {
  const univIds = new Set<string>()
  events.forEach(e => {
    if (e.event_type !== 'PAGE_VIEW') return
    const meta = e.metadata as PageViewMetadata
    if (meta.university_id) univIds.add(meta.university_id)
  })
  return univIds.size
}

export function detectIntentPattern(events: BehaviorEvent[]): IntentPattern {
  if (events.length === 0) return 'UNKNOWN'

  // COMPARE_MODE: 최우선 규칙
  // COMPARE 이벤트 발생 OR 2개 이상 대학 PAGE_VIEW가 연속 발생
  if (hasEventType(events, 'COMPARE') || countDistinctUniversityViews(events) >= 2) {
    return 'COMPARE_MODE'
  }

  const first3 = getFirst(events, 3)
  const firstHalf = getFirst(events, Math.ceil(events.length / 2))

  // UNIV_FIRST: 첫 3개 이벤트에 대학명 검색 또는 대학소개 PAGE_VIEW 포함
  //             이후 INDICATOR_VIEW가 따라오는 경우
  const univFirstTrigger =
    hasSearchOfType(first3, '대학명') || hasPageViewOfType(first3, '대학소개')
  const indicatorFollows = hasEventType(events, 'INDICATOR_VIEW')

  if (univFirstTrigger && indicatorFollows) {
    return 'UNIV_FIRST'
  }

  // INDICATOR_FIRST: 첫 3개 이벤트에 지표명 검색 또는 INDICATOR_VIEW 포함
  //                  이후 대학소개 PAGE_VIEW 자동 포함
  const indicatorFirstTrigger =
    hasSearchOfType(first3, '지표명') || hasEventType(first3, 'INDICATOR_VIEW')
  const pageViewFollows = hasPageViewOfType(events, '대학소개')

  if (indicatorFirstTrigger && pageViewFollows) {
    return 'INDICATOR_FIRST'
  }

  // REGION_FIRST: 첫 절반에 지역 FILTER_APPLY 포함
  if (hasFilterOfType(firstHalf, '지역')) {
    return 'REGION_FIRST'
  }

  // UNIV_FIRST (PAGE_VIEW 없이 지표만 봤어도)
  if (univFirstTrigger) return 'UNIV_FIRST'

  // INDICATOR_FIRST (대학 소개 없이 지표만)
  if (indicatorFirstTrigger) return 'INDICATOR_FIRST'

  // 이벤트가 3개 미만이면 아직 패턴 불명확
  if (events.length < 3) return 'UNKNOWN'

  // EXPLORATORY: 다양한 이벤트 타입이 혼재하고 특정 패턴 없음
  const uniqueTypes = new Set(events.map(e => e.event_type)).size
  if (uniqueTypes >= 3 || countEventType(events, 'SEARCH') >= 2) {
    return 'EXPLORATORY'
  }

  return 'UNKNOWN'
}
