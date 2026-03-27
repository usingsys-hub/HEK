import { useState, useEffect } from 'react'
import type { SessionData } from '../types/session'
import { getOrCreateSession } from '../core/session/sessionManager'
import { sessionStore } from '../core/session/sessionStore'

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrCreateSession().then(s => {
      setSession(s)
      setLoading(false)
    })
  }, [])

  // localStorage 변경 감지로 이벤트 추가 반영
  useEffect(() => {
    const interval = setInterval(() => {
      const current = sessionStore.load()
      if (current) setSession({ ...current })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  function resetSession() {
    sessionStore.clear()
    getOrCreateSession().then(s => setSession(s))
  }

  return { session, loading, resetSession }
}
