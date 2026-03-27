import { useMemo } from 'react'
import type { SessionData } from '../types/session'
import type { SessionContextDocument, IntentPattern } from '../types/session'
import { detectIntentPattern } from '../core/analyzer/behaviorAnalyzer'
import { buildSessionContext } from '../core/analyzer/contextBuilder'

export function useBehaviorAnalysis(session: SessionData | null): {
  intentPattern: IntentPattern
  contextDocument: SessionContextDocument | null
} {
  const intentPattern = useMemo<IntentPattern>(() => {
    if (!session) return 'UNKNOWN'
    return detectIntentPattern(session.events)
  }, [session])

  const contextDocument = useMemo<SessionContextDocument | null>(() => {
    if (!session || session.events.length === 0) return null
    return buildSessionContext(session.session_id, session.events)
  }, [session])

  return { intentPattern, contextDocument }
}
