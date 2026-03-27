import { v4 as uuidv4 } from 'uuid'
import type { SessionData } from '../../types/session'
import { sessionStore } from './sessionStore'

const TTL_MS = 30 * 60 * 1000  // 30분

// User-Agent + 화면해상도 + 언어 + 시간대 → SHA-256 fingerprint
async function getFingerprintHash(): Promise<string> {
  const raw = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|')

  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function isExpired(session: SessionData): boolean {
  const lastActive = new Date(session.last_active_at).getTime()
  return Date.now() - lastActive > TTL_MS
}

export async function createSession(): Promise<SessionData> {
  const fingerprintHash = await getFingerprintHash()
  const now = new Date().toISOString()
  const session: SessionData = {
    session_id: uuidv4(),
    created_at: now,
    last_active_at: now,
    fingerprint_hash: fingerprintHash,
    events: [],
    intent_pattern: 'UNKNOWN',
  }
  sessionStore.save(session)
  return session
}

export async function getOrCreateSession(): Promise<SessionData> {
  const existing = sessionStore.load()

  if (existing && !isExpired(existing)) {
    // fingerprint 비교로 동일 브라우저 환경 확인 (설계서 3.1.2)
    const currentFingerprint = await getFingerprintHash()
    if (existing.fingerprint_hash === currentFingerprint) {
      return existing
    }
  }

  // 만료되었거나 fingerprint 불일치 → 새 세션 생성
  return createSession()
}

export function refreshTTL(session: SessionData): SessionData {
  const updated = { ...session, last_active_at: new Date().toISOString() }
  sessionStore.save(updated)
  return updated
}

export function getClientInfo() {
  return {
    user_agent: navigator.userAgent,
    screen_resolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
  }
}
