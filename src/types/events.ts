export type EventType =
  | 'SEARCH'
  | 'PAGE_VIEW'
  | 'INDICATOR_VIEW'
  | 'FILTER_APPLY'
  | 'COMPARE'
  | 'DOWNLOAD'
  | 'CLICK'
  | 'DWELL'

export type SearchType = '대학명' | '지표명' | '지역명' | '통합'
export type PageType = '대학소개' | '지표페이지' | '비교페이지' | '홈' | '검색결과'
export type FilterType = '지역' | '대학유형' | '설립유형'

export interface SearchMetadata {
  search_keyword: string
  search_type: SearchType
  result_count: number
}

export interface PageViewMetadata {
  page_url: string
  page_type: PageType
  university_id?: string
  university_name?: string
}

export interface IndicatorViewMetadata {
  indicator_id: keyof import('./university').UniversityIndicators
  indicator_name: string
  university_id: string
  university_name: string
  year: string
}

export interface FilterApplyMetadata {
  filter_type: FilterType
  filter_value: string
}

export interface CompareMetadata {
  compared_universities: string[]   // university_id 목록
  compared_indicators: string[]     // indicator_id 목록
}

export interface DownloadMetadata {
  download_type: string
  file_format: string
  related_data: string
}

export interface ClickMetadata {
  recommendation_id?: string
  clicked_item: string
  position_rank?: number
}

export interface DwellMetadata {
  page_url: string
  dwell_time_seconds: number
  scroll_depth_percent: number
}

export type EventMetadata =
  | SearchMetadata
  | PageViewMetadata
  | IndicatorViewMetadata
  | FilterApplyMetadata
  | CompareMetadata
  | DownloadMetadata
  | ClickMetadata
  | DwellMetadata

export interface ClientInfo {
  user_agent: string
  screen_resolution: string
  language: string
}

export interface BehaviorEvent {
  session_id: string
  timestamp: string                 // ISO 8601
  event_type: EventType
  metadata: EventMetadata
  client_info: ClientInfo
}
