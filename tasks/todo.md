# HEK 대학 추천 시스템 — 풀스택 구현 계획

## 아키텍처 개요

```
[React Frontend]
      ↕ REST API
[Node.js/Express Backend]
      ↕ Pinecone SDK       ↕ Anthropic SDK
[Pinecone Vector DB]    [Claude Haiku API]
      ↕
[SQLite (피드백 저장)]
```

### 배포
- Frontend → Vercel (무료)
- Backend  → Railway (무료 $5 크레딧/월)
- Vector DB → Pinecone Serverless (무료 100K 벡터)

---

## 디렉토리 구조

```
HEK/
├── src/                               # 기존 Phase 1~2 프론트엔드
│   ├── api/
│   │   └── client.ts                  # [NEW] 백엔드 API 클라이언트
│   ├── components/
│   │   ├── RecommendationPanel.tsx    # [NEW] 추천 결과 UI
│   │   └── FeedbackButton.tsx         # [NEW] 추천 피드백 버튼
│   └── hooks/
│       └── useRecommendation.ts       # [NEW] 추천 API 훅
│
├── server/                            # [NEW] 백엔드
│   ├── src/
│   │   ├── index.ts                   # Express 앱 진입점
│   │   ├── routes/
│   │   │   ├── recommend.ts           # POST /api/recommend
│   │   │   ├── feedback.ts            # POST /api/feedback
│   │   │   └── health.ts              # GET  /api/health
│   │   ├── services/
│   │   │   ├── pinecone.ts            # 벡터 검색 서비스
│   │   │   ├── claude.ts              # Claude API 서비스
│   │   │   └── rag.ts                 # RAG 파이프라인
│   │   ├── db/
│   │   │   └── sqlite.ts              # 피드백 DB
│   │   └── scripts/
│   │       └── indexUniversities.ts   # 대학 데이터 임베딩 (1회 실행)
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example                       # [NEW] 환경변수 템플릿
├── vercel.json                        # [NEW] Vercel 배포 설정
└── railway.toml                       # [NEW] Railway 배포 설정
```

---

## API 명세

### POST /api/recommend
```json
// Request
{
  "session_id": "uuid",
  "intent_pattern": "UNIV_FIRST",
  "summary": "이 사용자의 탐색 패턴은 '대학 중심 탐색'입니다...",
  "viewed_universities": ["서울대학교"],
  "viewed_indicators": ["취업률"],
  "applied_filters": { "지역": "서울" },
  "ab_group": "A"
}

// Response
{
  "recommendations": [
    {
      "id": "rec_uuid",
      "university_id": "UNIV_001",
      "university_name": "서울대학교",
      "region": "서울",
      "univ_type": "국립",
      "score": 0.92,
      "rank": 1,
      "reason": "취업률 68.5%로 높으며, 관심 지역인 서울 소재 국립대입니다.",
      "key_indicators": [
        { "name": "취업률", "value": "68.5%" },
        { "name": "전임교원확보율", "value": "87.3%" }
      ]
    }
  ],
  "ab_group": "A",
  "generated_at": "ISO8601"
}
```

### POST /api/feedback
```json
// Request
{
  "session_id": "uuid",
  "recommendation_id": "rec_uuid",
  "feedback_type": "click" | "positive" | "negative",
  "position_rank": 1
}
// Response: { "success": true }
```

### GET /api/health
```json
{ "status": "ok", "timestamp": "ISO8601" }
```

---

## RAG 파이프라인

```
1. 입력: SessionContextDocument (summary + viewed_universities + viewed_indicators)
2. 쿼리 텍스트 생성: summary를 임베딩 쿼리로 사용
3. Pinecone 검색: multilingual-e5-large 임베딩 → Top-5 유사 대학
4. 프롬프트 조합:
   [시스템] 당신은 대학 추천 전문가입니다...
   [사용자 컨텍스트] {summary}
   [후보 대학] {top-5 대학 정보}
   → 상위 3개 추천 + 각 이유 생성
5. Claude Haiku 호출 → JSON 파싱
6. 응답 반환
```

---

## A/B 테스트 설계

| 그룹 | 비율 | 로직 |
|------|------|------|
| A    | 50%  | 규칙 기반 추천 (의도 패턴 → 필터링) |
| B    | 50%  | RAG + Claude 추천 |

- 분할 기준: `session_id` 첫 바이트 % 2 (0=A, 1=B)
- 측정 지표: CTR (클릭률), 피드백 긍정률

---

## 구현 체크리스트

### Phase 3 — 추천 시스템
- [ ] 백엔드 초기화 (Express + TypeScript)
- [ ] Pinecone 서비스 (인덱싱 + 검색)
- [ ] 대학 인덱싱 스크립트 실행
- [ ] Claude API 서비스
- [ ] RAG 파이프라인
- [ ] SQLite 피드백 DB
- [ ] API 라우트 (recommend, feedback, health)
- [ ] 프론트엔드 API 클라이언트
- [ ] RecommendationPanel 컴포넌트
- [ ] FeedbackButton 컴포넌트
- [ ] useRecommendation 훅

### Phase 4 — A/B 테스트 + 배포
- [ ] A/B 그룹 분할 로직
- [ ] 모니터링 대시보드 확장 (CTR, 그룹 비교)
- [ ] Vercel 배포 설정
- [ ] Railway 배포 설정
- [ ] 환경변수 가이드

---

## 환경변수

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=hek-universities

# 서버
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## 성능 목표 (Phase 4 KPI)

| 지표 | 목표 |
|------|------|
| 추천 응답 시간 | < 2초 |
| Pinecone 검색 시간 | < 100ms |
| CTR | 15%+ |
| 피드백 긍정률 | 60%+ |
