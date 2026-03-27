import type { BehaviorEvent } from '../types/events'

// 시나리오별 샘플 이벤트 시퀀스 (5종)
// 설계서 5.1 의도 패턴 기반으로 구성

const CLIENT_INFO = {
  user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  screen_resolution: '1920x1080',
  language: 'ko-KR',
}

// ① UNIV_FIRST 시나리오
// "서울대학교" 검색 → 대학소개 → 장학금 지표 확인 → 교육비 지표 확인
export const SCENARIO_UNIV_FIRST: BehaviorEvent[] = [
  {
    session_id: 'scenario-univ-first',
    timestamp: '2026-03-27T09:00:00Z',
    event_type: 'SEARCH',
    metadata: { search_keyword: '서울대학교', search_type: '대학명', result_count: 1 },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-univ-first',
    timestamp: '2026-03-27T09:00:10Z',
    event_type: 'PAGE_VIEW',
    metadata: { page_url: '/university/UNIV_001', page_type: '대학소개', university_id: 'UNIV_001', university_name: '서울대학교' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-univ-first',
    timestamp: '2026-03-27T09:00:45Z',
    event_type: 'DWELL',
    metadata: { page_url: '/university/UNIV_001', dwell_time_seconds: 35, scroll_depth_percent: 60 },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-univ-first',
    timestamp: '2026-03-27T09:01:00Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'scholarship_per_student', indicator_name: '재학생1인당장학금', university_id: 'UNIV_001', university_name: '서울대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-univ-first',
    timestamp: '2026-03-27T09:01:30Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'education_cost_per_student', indicator_name: '학생1인당교육비', university_id: 'UNIV_001', university_name: '서울대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-univ-first',
    timestamp: '2026-03-27T09:02:00Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'employment_rate', indicator_name: '졸업후취업비율', university_id: 'UNIV_001', university_name: '서울대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
]

// ② INDICATOR_FIRST 시나리오
// "장학금" 지표 검색 → 여러 대학의 장학금 지표 확인 → 연관 대학 소개 이동
export const SCENARIO_INDICATOR_FIRST: BehaviorEvent[] = [
  {
    session_id: 'scenario-indicator-first',
    timestamp: '2026-03-27T10:00:00Z',
    event_type: 'SEARCH',
    metadata: { search_keyword: '재학생 장학금', search_type: '지표명', result_count: 20 },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-indicator-first',
    timestamp: '2026-03-27T10:00:15Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'scholarship_per_student', indicator_name: '재학생1인당장학금', university_id: 'UNIV_010', university_name: 'KAIST', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-indicator-first',
    timestamp: '2026-03-27T10:00:40Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'scholarship_per_student', indicator_name: '재학생1인당장학금', university_id: 'UNIV_011', university_name: '포항공과대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-indicator-first',
    timestamp: '2026-03-27T10:01:10Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'scholarship_per_student', indicator_name: '재학생1인당장학금', university_id: 'UNIV_004', university_name: '성균관대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-indicator-first',
    timestamp: '2026-03-27T10:01:40Z',
    event_type: 'PAGE_VIEW',
    metadata: { page_url: '/university/UNIV_010', page_type: '대학소개', university_id: 'UNIV_010', university_name: 'KAIST' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-indicator-first',
    timestamp: '2026-03-27T10:02:20Z',
    event_type: 'DWELL',
    metadata: { page_url: '/university/UNIV_010', dwell_time_seconds: 40, scroll_depth_percent: 75 },
    client_info: CLIENT_INFO,
  },
]

// ③ REGION_FIRST 시나리오
// 부산 지역 필터 → 부산 대학 탐색 → 취업률 지표 확인
export const SCENARIO_REGION_FIRST: BehaviorEvent[] = [
  {
    session_id: 'scenario-region-first',
    timestamp: '2026-03-27T11:00:00Z',
    event_type: 'FILTER_APPLY',
    metadata: { filter_type: '지역', filter_value: '부산' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-region-first',
    timestamp: '2026-03-27T11:00:10Z',
    event_type: 'PAGE_VIEW',
    metadata: { page_url: '/university/UNIV_006', page_type: '대학소개', university_id: 'UNIV_006', university_name: '부산대학교' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-region-first',
    timestamp: '2026-03-27T11:00:50Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'employment_rate', indicator_name: '졸업후취업비율', university_id: 'UNIV_006', university_name: '부산대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-region-first',
    timestamp: '2026-03-27T11:01:20Z',
    event_type: 'PAGE_VIEW',
    metadata: { page_url: '/university/UNIV_018', page_type: '대학소개', university_id: 'UNIV_018', university_name: '동아대학교' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-region-first',
    timestamp: '2026-03-27T11:01:50Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'employment_rate', indicator_name: '졸업후취업비율', university_id: 'UNIV_018', university_name: '동아대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-region-first',
    timestamp: '2026-03-27T11:02:10Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'major_related_employment', indicator_name: '전공관련취업자비율', university_id: 'UNIV_018', university_name: '동아대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
]

// ④ COMPARE_MODE 시나리오
// 서울대 소개 → 연세대 소개 → 직접 비교 이벤트 발생
export const SCENARIO_COMPARE_MODE: BehaviorEvent[] = [
  {
    session_id: 'scenario-compare-mode',
    timestamp: '2026-03-27T13:00:00Z',
    event_type: 'PAGE_VIEW',
    metadata: { page_url: '/university/UNIV_001', page_type: '대학소개', university_id: 'UNIV_001', university_name: '서울대학교' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-compare-mode',
    timestamp: '2026-03-27T13:00:30Z',
    event_type: 'PAGE_VIEW',
    metadata: { page_url: '/university/UNIV_002', page_type: '대학소개', university_id: 'UNIV_002', university_name: '연세대학교' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-compare-mode',
    timestamp: '2026-03-27T13:01:00Z',
    event_type: 'COMPARE',
    metadata: {
      compared_universities: ['UNIV_001', 'UNIV_002'],
      compared_indicators: ['scholarship_per_student', 'employment_rate', 'fulltime_faculty_ratio'],
    },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-compare-mode',
    timestamp: '2026-03-27T13:01:40Z',
    event_type: 'PAGE_VIEW',
    metadata: { page_url: '/university/UNIV_003', page_type: '대학소개', university_id: 'UNIV_003', university_name: '고려대학교' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-compare-mode',
    timestamp: '2026-03-27T13:02:10Z',
    event_type: 'COMPARE',
    metadata: {
      compared_universities: ['UNIV_001', 'UNIV_002', 'UNIV_003'],
      compared_indicators: ['scholarship_per_student', 'employment_rate'],
    },
    client_info: CLIENT_INFO,
  },
]

// ⑤ EXPLORATORY 시나리오
// 뚜렷한 패턴 없이 다양한 대학/지표 혼재 탐색
export const SCENARIO_EXPLORATORY: BehaviorEvent[] = [
  {
    session_id: 'scenario-exploratory',
    timestamp: '2026-03-27T14:00:00Z',
    event_type: 'PAGE_VIEW',
    metadata: { page_url: '/', page_type: '홈' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-exploratory',
    timestamp: '2026-03-27T14:00:20Z',
    event_type: 'SEARCH',
    metadata: { search_keyword: '대학', search_type: '통합', result_count: 103 },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-exploratory',
    timestamp: '2026-03-27T14:00:40Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'books_per_student', indicator_name: '학생1인당도서수', university_id: 'UNIV_014', university_name: '강원대학교', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-exploratory',
    timestamp: '2026-03-27T14:01:10Z',
    event_type: 'FILTER_APPLY',
    metadata: { filter_type: '대학유형', filter_value: '국립' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-exploratory',
    timestamp: '2026-03-27T14:01:30Z',
    event_type: 'INDICATOR_VIEW',
    metadata: { indicator_id: 'foreign_student_support', indicator_name: '외국인유학생1인당지원금', university_id: 'UNIV_010', university_name: 'KAIST', year: '2025' },
    client_info: CLIENT_INFO,
  },
  {
    session_id: 'scenario-exploratory',
    timestamp: '2026-03-27T14:02:00Z',
    event_type: 'SEARCH',
    metadata: { search_keyword: '법인전입금', search_type: '지표명', result_count: 20 },
    client_info: CLIENT_INFO,
  },
]

export const ALL_SCENARIOS = {
  UNIV_FIRST: SCENARIO_UNIV_FIRST,
  INDICATOR_FIRST: SCENARIO_INDICATOR_FIRST,
  REGION_FIRST: SCENARIO_REGION_FIRST,
  COMPARE_MODE: SCENARIO_COMPARE_MODE,
  EXPLORATORY: SCENARIO_EXPLORATORY,
}
