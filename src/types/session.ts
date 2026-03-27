import type { BehaviorEvent } from './events'

export type IntentPattern =
  | 'UNIV_FIRST'        // 대학명 검색 후 지표 확인
  | 'INDICATOR_FIRST'   // 지표 검색/확인 후 대학 탐색
  | 'REGION_FIRST'      // 지역 필터 후 대학/지표 탐색
  | 'COMPARE_MODE'      // 대학 비교 중심
  | 'EXPLORATORY'       // 패턴 불명확, 다양한 탐색
  | 'UNKNOWN'           // 아직 이벤트 부족

export interface SessionData {
  session_id: string                // UUID v4
  created_at: string                // ISO 8601
  last_active_at: string            // ISO 8601
  fingerprint_hash: string          // SHA-256 (User-Agent + 해상도 + 언어 + 시간대)
  events: BehaviorEvent[]
  intent_pattern: IntentPattern
  context_vector?: number[]         // RAG 단계에서 활용
}

export interface SessionContextDocument {
  session_id: string
  intent_pattern: IntentPattern
  summary: string                   // GPT-Oss 프롬프트용 자연어 요약
  viewed_universities: string[]     // 조회한 대학명 목록
  viewed_indicators: string[]       // 조회한 지표명 목록
  applied_filters: Record<string, string>   // 적용한 필터
  dwell_summary: Record<string, number>     // 페이지별 체류시간(초)
  event_count: number
  created_at: string
}
