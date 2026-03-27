/**
 * 피드백 저장소 — JSON 파일 기반 (네이티브 빌드 불필요)
 * 파일 경로: server/data/feedback.json
 */
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(__dirname, '../../data/feedback.json')

interface FeedbackRecord {
  id: number
  session_id: string
  recommendation_id: string
  feedback_type: 'click' | 'positive' | 'negative'
  position_rank?: number
  ab_group?: string
  created_at: string
}

interface FeedbackStore {
  feedback: FeedbackRecord[]
  nextId: number
}

function readStore(): FeedbackStore {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as FeedbackStore
  } catch {
    return { feedback: [], nextId: 1 }
  }
}

function writeStore(store: FeedbackStore): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(store, null, 2), 'utf-8')
}

export function initDb(): void {
  const store = readStore()
  writeStore(store) // 파일이 없으면 빈 파일 생성
  console.log(`[db] JSON 피드백 저장소 준비 완료 (${DB_PATH})`)
}

export function insertFeedback(params: {
  session_id: string
  recommendation_id: string
  feedback_type: 'click' | 'positive' | 'negative'
  position_rank?: number
  ab_group?: string
}): void {
  const store = readStore()
  store.feedback.push({
    id: store.nextId++,
    ...params,
    created_at: new Date().toISOString(),
  })
  writeStore(store)
}

export interface AbStats {
  ab_group: string
  total_clicks: number
  positive: number
  negative: number
  ctr: number
}

export function getAbStats(): AbStats[] {
  const { feedback } = readStore()

  const groups = new Map<string, { sessions: Set<string>; clicks: number; positive: number; negative: number }>()

  for (const r of feedback) {
    const g = r.ab_group ?? 'unknown'
    if (!groups.has(g)) groups.set(g, { sessions: new Set(), clicks: 0, positive: 0, negative: 0 })
    const stat = groups.get(g)!
    stat.sessions.add(r.session_id)
    if (r.feedback_type === 'click') stat.clicks++
    else if (r.feedback_type === 'positive') stat.positive++
    else if (r.feedback_type === 'negative') stat.negative++
  }

  return Array.from(groups.entries()).map(([ab_group, s]) => ({
    ab_group,
    total_clicks: s.clicks,
    positive: s.positive,
    negative: s.negative,
    ctr: s.sessions.size > 0 ? Math.round((s.clicks / s.sessions.size) * 10000) / 100 : 0,
  }))
}
