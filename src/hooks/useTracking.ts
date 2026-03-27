import { eventTracker } from '../core/tracker/eventTracker'
import type { SearchType, PageType, FilterType } from '../types/events'
import type { UniversityIndicators } from '../types/university'

// 컴포넌트에서 편리하게 이벤트 트래킹 사용하기 위한 hook
export function useTracking() {
  return {
    trackSearch: (keyword: string, type: SearchType = '통합', resultCount = 0) =>
      eventTracker.trackSearch(keyword, type, resultCount),

    trackPageView: (url: string, pageType: PageType, univId?: string, univName?: string) =>
      eventTracker.trackPageView(url, pageType, univId, univName),

    trackIndicatorView: (
      indicatorId: keyof UniversityIndicators,
      indicatorName: string,
      univId: string,
      univName: string
    ) => eventTracker.trackIndicatorView(indicatorId, indicatorName, univId, univName),

    trackFilterApply: (filterType: FilterType, value: string) =>
      eventTracker.trackFilterApply(filterType, value),

    trackCompare: (universities: string[], indicators: string[]) =>
      eventTracker.trackCompare(universities, indicators),

    trackDwell: (url: string, seconds: number, scrollDepth: number) =>
      eventTracker.trackDwell(url, seconds, scrollDepth),
  }
}
