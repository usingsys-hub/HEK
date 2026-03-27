import type { SessionData } from '../../types/session'

const STORAGE_KEY = 'hek_session'

// localStorage 기반 세션 저장소 (개발용)
// 실서비스에서는 Redis로 대체
export const sessionStore = {
  save(session: SessionData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } catch {
      // localStorage 사용 불가 환경 무시
    }
  },

  load(): SessionData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as SessionData
    } catch {
      return null
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 무시
    }
  },

  update(updater: (session: SessionData) => SessionData): SessionData | null {
    const current = this.load()
    if (!current) return null
    const updated = updater(current)
    this.save(updated)
    return updated
  },
}
