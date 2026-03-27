import type { SessionData } from '../types/session'
import type { IntentPattern } from '../types/session'
import { ALL_SCENARIOS } from '../data/sampleEvents'
import { eventTracker } from '../core/tracker/eventTracker'

const PATTERN_COLOR: Record<IntentPattern, string> = {
  UNIV_FIRST: '#1a6fd4',
  INDICATOR_FIRST: '#2ecc71',
  REGION_FIRST: '#e67e22',
  COMPARE_MODE: '#9b59b6',
  EXPLORATORY: '#e74c3c',
  UNKNOWN: '#95a5a6',
}

const PATTERN_LABEL: Record<IntentPattern, string> = {
  UNIV_FIRST: '대학 중심 탐색',
  INDICATOR_FIRST: '지표 중심 탐색',
  REGION_FIRST: '지역 중심 탐색',
  COMPARE_MODE: '대학 비교',
  EXPLORATORY: '다양한 탐색',
  UNKNOWN: '패턴 미확인',
}

const EVENT_COLOR: Record<string, string> = {
  SEARCH: '#3498db',
  PAGE_VIEW: '#2ecc71',
  INDICATOR_VIEW: '#e67e22',
  FILTER_APPLY: '#9b59b6',
  COMPARE: '#e74c3c',
  DWELL: '#95a5a6',
  DOWNLOAD: '#1abc9c',
  CLICK: '#f39c12',
}

interface Props {
  session: SessionData
  intentPattern: IntentPattern
  onReset: () => void
}

export function BehaviorDashboard({ session, intentPattern, onReset }: Props) {
  function replayScenario(key: keyof typeof ALL_SCENARIOS) {
    const events = ALL_SCENARIOS[key].map(e => ({
      ...e,
      session_id: session.session_id,
    }))
    eventTracker.injectEvents(events)
  }

  return (
    <div style={{ padding: '16px', background: '#1a1a2e', color: '#eee', minHeight: '100%', fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '16px' }}>행동 분석 대시보드</h2>
        <button onClick={onReset} style={{ padding: '4px 12px', background: '#444', color: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
          세션 초기화
        </button>
      </div>

      {/* 세션 정보 */}
      <div style={{ background: '#16213e', padding: '12px', borderRadius: '6px', marginBottom: '12px', fontSize: '12px' }}>
        <div style={{ color: '#aaa', marginBottom: '4px' }}>Session ID</div>
        <div style={{ color: '#7fdbff', wordBreak: 'break-all' }}>{session.session_id}</div>
        <div style={{ color: '#aaa', marginTop: '8px', marginBottom: '4px' }}>이벤트 수</div>
        <div>{session.events.length}개</div>
      </div>

      {/* 의도 패턴 */}
      <div style={{ background: '#16213e', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>감지된 의도 패턴</div>
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '20px',
          background: PATTERN_COLOR[intentPattern],
          color: '#fff',
          fontWeight: 700,
          fontSize: '14px',
        }}>
          {intentPattern} — {PATTERN_LABEL[intentPattern]}
        </div>
      </div>

      {/* 시나리오 Replay */}
      <div style={{ background: '#16213e', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>시나리오 Replay (테스트)</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(Object.keys(ALL_SCENARIOS) as (keyof typeof ALL_SCENARIOS)[]).map(key => (
            <button
              key={key}
              onClick={() => replayScenario(key)}
              style={{
                padding: '4px 10px',
                background: PATTERN_COLOR[key as IntentPattern],
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* 이벤트 로그 */}
      <div style={{ background: '#16213e', padding: '12px', borderRadius: '6px' }}>
        <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>이벤트 로그 (최신순)</div>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {session.events.length === 0 && (
            <div style={{ color: '#666', fontSize: '12px' }}>아직 이벤트가 없습니다. 대학을 검색하거나 시나리오를 Replay해보세요.</div>
          )}
          {[...session.events].reverse().map((event, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0', borderBottom: '1px solid #2a2a4a', fontSize: '12px' }}>
              <span style={{
                padding: '2px 6px',
                borderRadius: '3px',
                background: EVENT_COLOR[event.event_type] ?? '#555',
                color: '#fff',
                flexShrink: 0,
                fontSize: '11px',
              }}>
                {event.event_type}
              </span>
              <span style={{ color: '#bbb', flexShrink: 0 }}>{event.timestamp.slice(11, 19)}</span>
              <span style={{ color: '#eee', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {JSON.stringify(event.metadata).slice(0, 80)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
