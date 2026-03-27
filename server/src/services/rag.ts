import { searchSimilarUniversities } from './pinecone'
import { generateRecommendations, type RecommendationItem } from './claude'

// A 그룹: 규칙 기반 추천 (Vector DB + Claude 없이 필터링만 사용)
const RULE_BASED_UNIVERSITIES = [
  { university_id: 'UNIV_001', university_name: '서울대학교', region: '서울', univ_type: '국립', indicators: { employment_rate: 68.5, scholarship_per_student: 2850000, fulltime_faculty_ratio: 87.3 } },
  { university_id: 'UNIV_010', university_name: 'KAIST', region: '대전', univ_type: '국립', indicators: { employment_rate: 82.3, scholarship_per_student: 8500000, fulltime_faculty_ratio: 95.2 } },
  { university_id: 'UNIV_011', university_name: '포항공과대학교', region: '경북', univ_type: '사립', indicators: { employment_rate: 79.6, scholarship_per_student: 9200000, fulltime_faculty_ratio: 97.1 } },
  { university_id: 'UNIV_004', university_name: '성균관대학교', region: '서울', univ_type: '사립', indicators: { employment_rate: 74.3, scholarship_per_student: 3250000, fulltime_faculty_ratio: 84.2 } },
  { university_id: 'UNIV_002', university_name: '연세대학교', region: '서울', univ_type: '사립', indicators: { employment_rate: 72.1, scholarship_per_student: 3100000, fulltime_faculty_ratio: 82.6 } },
]

export interface RagRequest {
  session_id: string
  intent_pattern: string
  summary: string
  viewed_universities: string[]
  viewed_indicators: string[]
  applied_filters: Record<string, string>
  ab_group: 'A' | 'B'
}

export interface RagResponse {
  recommendations: RecommendationItem[]
  ab_group: 'A' | 'B'
  generated_at: string
}

// 세션 ID 첫 바이트 기반 A/B 그룹 결정 (50/50)
export function determineAbGroup(sessionId: string): 'A' | 'B' {
  const firstChar = sessionId.replace(/-/g, '')[0] ?? '0'
  const val = parseInt(firstChar, 16)
  return val % 2 === 0 ? 'A' : 'B'
}

async function ruleBasedRecommend(
  req: RagRequest
): Promise<RecommendationItem[]> {
  // 간단한 규칙: 이미 본 대학 제외 후 상위 3개 반환
  const viewed = new Set(req.viewed_universities)
  const filtered = RULE_BASED_UNIVERSITIES.filter(u => !viewed.has(u.university_name))
  return filtered.slice(0, 3).map((u, i) => ({
    university_id: u.university_id,
    university_name: u.university_name,
    region: u.region,
    univ_type: u.univ_type,
    score: 0.9 - i * 0.05,
    rank: i + 1,
    reason: `${u.university_name}은(는) 취업률 ${u.indicators.employment_rate}%로 우수하며, 전임교원확보율 ${u.indicators.fulltime_faculty_ratio}%입니다.`,
    key_indicators: [
      { name: '졸업후취업비율', value: `${u.indicators.employment_rate}%` },
      { name: '전임교원확보율', value: `${u.indicators.fulltime_faculty_ratio}%` },
    ],
  }))
}

async function ragRecommend(req: RagRequest): Promise<RecommendationItem[]> {
  // 이미 본 대학 ID 조회 (제외용)
  const viewedUnivNames = new Set(req.viewed_universities)

  const candidates = await searchSimilarUniversities(req.summary)
  const filteredCandidates = candidates.filter(c => !viewedUnivNames.has(c.university_name))

  if (filteredCandidates.length === 0) {
    // 후보가 없으면 전체 후보 사용
    return generateRecommendations(req.summary, req.viewed_indicators, candidates)
  }

  return generateRecommendations(req.summary, req.viewed_indicators, filteredCandidates)
}

export async function runRagPipeline(req: RagRequest): Promise<RagResponse> {
  const group = req.ab_group ?? determineAbGroup(req.session_id)

  const recommendations = group === 'A'
    ? await ruleBasedRecommend(req)
    : await ragRecommend(req)

  return {
    recommendations,
    ab_group: group,
    generated_at: new Date().toISOString(),
  }
}
