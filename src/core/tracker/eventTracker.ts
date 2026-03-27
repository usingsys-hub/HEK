import type {
  BehaviorEvent,
  EventType,
  EventMetadata,
  SearchType,
  PageType,
  FilterType,
} from '../../types/events'
import type { UniversityIndicators } from '../../types/university'
import { sessionStore } from '../session/sessionStore'
import { refreshTTL, getClientInfo } from '../session/sessionManager'

function buildEvent(eventType: EventType, metadata: EventMetadata): BehaviorEvent | null {
  const session = sessionStore.load()
  if (!session) return null

  return {
    session_id: session.session_id,
    timestamp: new Date().toISOString(),
    event_type: eventType,
    metadata,
    client_info: getClientInfo(),
  }
}

function appendEvent(event: BehaviorEvent): void {
  sessionStore.update(session => {
    const updated = refreshTTL({ ...session, events: [...session.events, event] })
    return updated
  })
}

export const eventTracker = {
  // 검색 이벤트
  trackSearch(keyword: string, searchType: SearchType, resultCount: number): void {
    const event = buildEvent('SEARCH', { search_keyword: keyword, search_type: searchType, result_count: resultCount })
    if (event) appendEvent(event)
  },

  // 페이지 조회
  trackPageView(pageUrl: string, pageType: PageType, universityId?: string, universityName?: string): void {
    const event = buildEvent('PAGE_VIEW', { page_url: pageUrl, page_type: pageType, university_id: universityId, university_name: universityName })
    if (event) appendEvent(event)
  },

  // 지표 조회
  trackIndicatorView(
    indicatorId: keyof UniversityIndicators,
    indicatorName: string,
    universityId: string,
    universityName: string,
    year = '2025'
  ): void {
    const event = buildEvent('INDICATOR_VIEW', {
      indicator_id: indicatorId,
      indicator_name: indicatorName,
      university_id: universityId,
      university_name: universityName,
      year,
    })
    if (event) appendEvent(event)
  },

  // 필터 적용
  trackFilterApply(filterType: FilterType, filterValue: string): void {
    const event = buildEvent('FILTER_APPLY', { filter_type: filterType, filter_value: filterValue })
    if (event) appendEvent(event)
  },

  // 대학 비교
  trackCompare(universities: string[], indicators: string[]): void {
    const event = buildEvent('COMPARE', { compared_universities: universities, compared_indicators: indicators })
    if (event) appendEvent(event)
  },

  // 체류 시간
  trackDwell(pageUrl: string, dwellTimeSeconds: number, scrollDepthPercent: number): void {
    const event = buildEvent('DWELL', { page_url: pageUrl, dwell_time_seconds: dwellTimeSeconds, scroll_depth_percent: scrollDepthPercent })
    if (event) appendEvent(event)
  },

  // 다운로드
  trackDownload(downloadType: string, fileFormat: string, relatedData: string): void {
    const event = buildEvent('DOWNLOAD', { download_type: downloadType, file_format: fileFormat, related_data: relatedData })
    if (event) appendEvent(event)
  },

  // 추천 클릭
  trackClick(clickedItem: string, recommendationId?: string, positionRank?: number): void {
    const event = buildEvent('CLICK', { clicked_item: clickedItem, recommendation_id: recommendationId, position_rank: positionRank })
    if (event) appendEvent(event)
  },

  // 테스트용: 외부 이벤트 배열 직접 주입 (시나리오 Replay)
  injectEvents(events: BehaviorEvent[]): void {
    sessionStore.update(session => ({ ...session, events }))
  },
}
