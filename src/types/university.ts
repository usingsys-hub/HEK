export interface UniversityIndicators {
  scholarship_per_student: number        // 재학생1인당장학금 (원)
  fulltime_faculty_ratio: number         // 전임교원확보율 (%)
  education_cost_per_student: number     // 학생1인당교육비 (원)
  books_per_student: number              // 학생1인당도서수 (권)
  foreign_student_support: number        // 외국인유학생1인당지원금 (원)
  fulltime_lecture_ratio: number         // 전임교원강의담당비율 (%)
  dept_student_count: number             // 단과대학생수 (명)
  employment_rate: number                // 졸업후취업비율 (%)
  major_related_employment: number       // 전공관련취업자비율 (%)
  major_research_cost: number            // 전공관련1인당연구비 (원)
  corporate_transfer: number             // 법인전입금 (원)
}

export type UnivType = '국립' | '사립' | '공립'
export type Region = '서울' | '경기' | '인천' | '부산' | '대구' | '대전' | '광주' | '울산' | '세종' | '강원' | '충북' | '충남' | '전북' | '전남' | '경북' | '경남' | '제주'

export interface University {
  university_id: string
  university_name: string
  region: Region
  univ_type: UnivType
  indicators: UniversityIndicators
  disclosure_year: string
  text_profile?: string  // 임베딩용 자연어 프로필 (RAG 단계에서 활용)
}
