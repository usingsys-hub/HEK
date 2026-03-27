/**
 * 대학 데이터 Pinecone 인덱싱 스크립트 (1회 실행)
 * 실행: cd server && npm run index
 */
import 'dotenv/config'
import { Pinecone } from '@pinecone-database/pinecone'
import { upsertUniversities } from '../services/pinecone'

const INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? 'hek-universities'
const EMBEDDING_MODEL = 'multilingual-e5-large'
const DIMENSION = 1024

// 프론트엔드 대학 데이터를 서버 스크립트에서 직접 정의 (공유)
const UNIVERSITIES = [
  { university_id: 'UNIV_001', university_name: '서울대학교', region: '서울', univ_type: '국립', text_profile: '서울대학교는 서울 소재 국립대학으로, 전임교원확보율 87.3%, 재학생1인당장학금 285만원, 학생1인당교육비 1,240만원 수준이다. 취업률 68.5%, 전공관련취업률 71.2%이다.', indicators: { scholarship_per_student: 2850000, fulltime_faculty_ratio: 87.3, education_cost_per_student: 12400000, books_per_student: 145, foreign_student_support: 3200000, fulltime_lecture_ratio: 72.1, dept_student_count: 4200, employment_rate: 68.5, major_related_employment: 71.2, major_research_cost: 8900000, corporate_transfer: 15200000000 } },
  { university_id: 'UNIV_002', university_name: '연세대학교', region: '서울', univ_type: '사립', text_profile: '연세대학교는 서울 소재 사립대학으로, 재학생1인당장학금 310만원, 전임교원확보율 82.6%이다. 취업률 72.1%이다.', indicators: { scholarship_per_student: 3100000, fulltime_faculty_ratio: 82.6, education_cost_per_student: 11800000, books_per_student: 132, foreign_student_support: 2900000, fulltime_lecture_ratio: 68.4, dept_student_count: 3800, employment_rate: 72.1, major_related_employment: 68.9, major_research_cost: 7600000, corporate_transfer: 12500000000 } },
  { university_id: 'UNIV_003', university_name: '고려대학교', region: '서울', univ_type: '사립', text_profile: '고려대학교는 서울 소재 사립대학으로, 재학생1인당장학금 295만원, 취업률 70.8%이다.', indicators: { scholarship_per_student: 2950000, fulltime_faculty_ratio: 80.1, education_cost_per_student: 11200000, books_per_student: 128, foreign_student_support: 2700000, fulltime_lecture_ratio: 66.9, dept_student_count: 3600, employment_rate: 70.8, major_related_employment: 67.4, major_research_cost: 7100000, corporate_transfer: 11800000000 } },
  { university_id: 'UNIV_004', university_name: '성균관대학교', region: '서울', univ_type: '사립', text_profile: '성균관대학교는 서울 소재 사립대학(삼성 지원)으로, 법인전입금 189억원으로 높은 편이며 취업률 74.3%이다.', indicators: { scholarship_per_student: 3250000, fulltime_faculty_ratio: 84.2, education_cost_per_student: 13100000, books_per_student: 118, foreign_student_support: 3500000, fulltime_lecture_ratio: 70.3, dept_student_count: 3200, employment_rate: 74.3, major_related_employment: 72.1, major_research_cost: 9200000, corporate_transfer: 18900000000 } },
  { university_id: 'UNIV_005', university_name: '한양대학교', region: '서울', univ_type: '사립', text_profile: '한양대학교는 서울 소재 사립대학으로, 취업률 71.6%, 재학생1인당장학금 278만원이다.', indicators: { scholarship_per_student: 2780000, fulltime_faculty_ratio: 79.5, education_cost_per_student: 10900000, books_per_student: 112, foreign_student_support: 2400000, fulltime_lecture_ratio: 65.7, dept_student_count: 3400, employment_rate: 71.6, major_related_employment: 69.8, major_research_cost: 6800000, corporate_transfer: 9700000000 } },
  { university_id: 'UNIV_006', university_name: '부산대학교', region: '부산', univ_type: '국립', text_profile: '부산대학교는 부산 소재 국립대학으로, 전임교원확보율 83.7%, 재학생1인당장학금 245만원이다.', indicators: { scholarship_per_student: 2450000, fulltime_faculty_ratio: 83.7, education_cost_per_student: 9800000, books_per_student: 138, foreign_student_support: 2100000, fulltime_lecture_ratio: 74.2, dept_student_count: 2900, employment_rate: 65.2, major_related_employment: 63.4, major_research_cost: 6200000, corporate_transfer: 8400000000 } },
  { university_id: 'UNIV_007', university_name: '경북대학교', region: '대구', univ_type: '국립', text_profile: '경북대학교는 대구 소재 국립대학으로, 전임교원강의담당비율 75.8%로 높은 편이다.', indicators: { scholarship_per_student: 2380000, fulltime_faculty_ratio: 81.4, education_cost_per_student: 9400000, books_per_student: 142, foreign_student_support: 1900000, fulltime_lecture_ratio: 75.8, dept_student_count: 2700, employment_rate: 63.8, major_related_employment: 61.2, major_research_cost: 5800000, corporate_transfer: 7200000000 } },
  { university_id: 'UNIV_008', university_name: '전남대학교', region: '광주', univ_type: '국립', text_profile: '전남대학교는 광주 소재 국립대학으로, 학생1인당도서수 135권이다.', indicators: { scholarship_per_student: 2290000, fulltime_faculty_ratio: 80.6, education_cost_per_student: 8900000, books_per_student: 135, foreign_student_support: 1800000, fulltime_lecture_ratio: 73.4, dept_student_count: 2500, employment_rate: 62.1, major_related_employment: 59.8, major_research_cost: 5400000, corporate_transfer: 6800000000 } },
  { university_id: 'UNIV_009', university_name: '충남대학교', region: '대전', univ_type: '국립', text_profile: '충남대학교는 대전 소재 국립대학으로, 전임교원확보율 82.1%이다.', indicators: { scholarship_per_student: 2360000, fulltime_faculty_ratio: 82.1, education_cost_per_student: 9200000, books_per_student: 130, foreign_student_support: 2000000, fulltime_lecture_ratio: 74.6, dept_student_count: 2600, employment_rate: 64.5, major_related_employment: 62.3, major_research_cost: 5900000, corporate_transfer: 7100000000 } },
  { university_id: 'UNIV_010', university_name: 'KAIST', region: '대전', univ_type: '국립', text_profile: 'KAIST는 대전 소재 과학기술특성화 국립대학으로, 재학생1인당장학금 850만원, 전임교원확보율 95.2%, 전공관련취업률 91.4%로 매우 높다.', indicators: { scholarship_per_student: 8500000, fulltime_faculty_ratio: 95.2, education_cost_per_student: 28000000, books_per_student: 210, foreign_student_support: 9800000, fulltime_lecture_ratio: 88.4, dept_student_count: 1200, employment_rate: 82.3, major_related_employment: 91.4, major_research_cost: 35000000, corporate_transfer: 42000000000 } },
  { university_id: 'UNIV_011', university_name: '포항공과대학교', region: '경북', univ_type: '사립', text_profile: '포항공과대학교(POSTECH)는 경북 소재 이공계 특성화 사립대학으로, 재학생1인당장학금 920만원, 전공관련1인당연구비 4,200만원으로 최상위권이다.', indicators: { scholarship_per_student: 9200000, fulltime_faculty_ratio: 97.1, education_cost_per_student: 32000000, books_per_student: 195, foreign_student_support: 8700000, fulltime_lecture_ratio: 90.2, dept_student_count: 900, employment_rate: 79.6, major_related_employment: 93.8, major_research_cost: 42000000, corporate_transfer: 51000000000 } },
  { university_id: 'UNIV_012', university_name: '인하대학교', region: '인천', univ_type: '사립', text_profile: '인하대학교는 인천 소재 사립대학으로, 취업률 69.4%이다.', indicators: { scholarship_per_student: 2650000, fulltime_faculty_ratio: 77.3, education_cost_per_student: 9600000, books_per_student: 108, foreign_student_support: 2200000, fulltime_lecture_ratio: 64.8, dept_student_count: 2800, employment_rate: 69.4, major_related_employment: 66.7, major_research_cost: 6100000, corporate_transfer: 8900000000 } },
  { university_id: 'UNIV_013', university_name: '아주대학교', region: '경기', univ_type: '사립', text_profile: '아주대학교는 경기 소재 사립대학으로, 취업률 70.2%이다.', indicators: { scholarship_per_student: 2720000, fulltime_faculty_ratio: 78.9, education_cost_per_student: 10100000, books_per_student: 115, foreign_student_support: 2300000, fulltime_lecture_ratio: 66.2, dept_student_count: 2400, employment_rate: 70.2, major_related_employment: 68.1, major_research_cost: 6500000, corporate_transfer: 9200000000 } },
  { university_id: 'UNIV_014', university_name: '강원대학교', region: '강원', univ_type: '국립', text_profile: '강원대학교는 강원 소재 국립대학으로, 학생1인당도서수 125권이다.', indicators: { scholarship_per_student: 2180000, fulltime_faculty_ratio: 78.4, education_cost_per_student: 8500000, books_per_student: 125, foreign_student_support: 1600000, fulltime_lecture_ratio: 72.9, dept_student_count: 2200, employment_rate: 60.3, major_related_employment: 57.6, major_research_cost: 4900000, corporate_transfer: 5800000000 } },
  { university_id: 'UNIV_015', university_name: '제주대학교', region: '제주', univ_type: '국립', text_profile: '제주대학교는 제주 소재 국립대학으로, 단과대학생수 1,800명 규모이다.', indicators: { scholarship_per_student: 2250000, fulltime_faculty_ratio: 79.8, education_cost_per_student: 8800000, books_per_student: 121, foreign_student_support: 1500000, fulltime_lecture_ratio: 73.6, dept_student_count: 1800, employment_rate: 59.7, major_related_employment: 56.3, major_research_cost: 4700000, corporate_transfer: 5200000000 } },
  { university_id: 'UNIV_016', university_name: '이화여자대학교', region: '서울', univ_type: '사립', text_profile: '이화여자대학교는 서울 소재 사립대학으로, 재학생1인당장학금 305만원, 취업률 71.9%이다.', indicators: { scholarship_per_student: 3050000, fulltime_faculty_ratio: 81.7, education_cost_per_student: 11500000, books_per_student: 127, foreign_student_support: 2800000, fulltime_lecture_ratio: 67.8, dept_student_count: 3100, employment_rate: 71.9, major_related_employment: 70.3, major_research_cost: 7300000, corporate_transfer: 10800000000 } },
  { university_id: 'UNIV_017', university_name: '숭실대학교', region: '서울', univ_type: '사립', text_profile: '숭실대학교는 서울 소재 사립대학으로, 취업률 68.7%이다.', indicators: { scholarship_per_student: 2580000, fulltime_faculty_ratio: 75.2, education_cost_per_student: 9100000, books_per_student: 105, foreign_student_support: 2100000, fulltime_lecture_ratio: 63.4, dept_student_count: 2600, employment_rate: 68.7, major_related_employment: 65.9, major_research_cost: 5700000, corporate_transfer: 7800000000 } },
  { university_id: 'UNIV_018', university_name: '동아대학교', region: '부산', univ_type: '사립', text_profile: '동아대학교는 부산 소재 사립대학이다.', indicators: { scholarship_per_student: 2420000, fulltime_faculty_ratio: 74.6, education_cost_per_student: 8700000, books_per_student: 102, foreign_student_support: 1800000, fulltime_lecture_ratio: 62.7, dept_student_count: 2400, employment_rate: 63.5, major_related_employment: 60.8, major_research_cost: 5100000, corporate_transfer: 6500000000 } },
  { university_id: 'UNIV_019', university_name: '전북대학교', region: '전북', univ_type: '국립', text_profile: '전북대학교는 전북 소재 국립대학이다.', indicators: { scholarship_per_student: 2320000, fulltime_faculty_ratio: 80.9, education_cost_per_student: 9000000, books_per_student: 128, foreign_student_support: 1900000, fulltime_lecture_ratio: 73.1, dept_student_count: 2500, employment_rate: 62.8, major_related_employment: 60.5, major_research_cost: 5500000, corporate_transfer: 6900000000 } },
  { university_id: 'UNIV_020', university_name: '경상국립대학교', region: '경남', univ_type: '국립', text_profile: '경상국립대학교는 경남 소재 국립대학이다.', indicators: { scholarship_per_student: 2280000, fulltime_faculty_ratio: 79.3, education_cost_per_student: 8600000, books_per_student: 122, foreign_student_support: 1700000, fulltime_lecture_ratio: 72.4, dept_student_count: 2300, employment_rate: 61.4, major_related_employment: 58.9, major_research_cost: 5200000, corporate_transfer: 6300000000 } },
]

async function createIndexIfNotExists(pc: Pinecone): Promise<void> {
  const existing = await pc.listIndexes()
  const names = (existing.indexes ?? []).map(i => i.name)
  if (names.includes(INDEX_NAME)) {
    console.log(`[index] "${INDEX_NAME}" 이미 존재합니다. 업서트만 진행합니다.`)
    return
  }
  console.log(`[index] "${INDEX_NAME}" 생성 중...`)
  await pc.createIndex({
    name: INDEX_NAME,
    dimension: DIMENSION,
    metric: 'cosine',
    spec: { serverless: { cloud: 'aws', region: 'us-east-1' } },
  })
  // 인덱스 준비 대기
  let ready = false
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const desc = await pc.describeIndex(INDEX_NAME)
    if (desc.status?.ready) { ready = true; break }
    process.stdout.write('.')
  }
  if (!ready) throw new Error('인덱스 준비 시간 초과')
  console.log('\n[index] 인덱스 준비 완료')
}

async function main() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY 환경변수가 필요합니다. .env 파일을 확인하세요.')
  }

  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
  await createIndexIfNotExists(pc)
  await upsertUniversities(UNIVERSITIES)
  console.log('[index] 완료! 총 20개 대학이 인덱싱되었습니다.')
}

main().catch(err => {
  console.error('[index] 오류:', err.message)
  process.exit(1)
})
