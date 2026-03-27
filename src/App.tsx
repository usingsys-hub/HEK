import { useState } from 'react'
import type { University } from './types/university'
import { useSession } from './hooks/useSession'
import { useBehaviorAnalysis } from './hooks/useBehaviorAnalysis'
import { UniversitySearch } from './components/UniversitySearch'
import { IndicatorTable } from './components/IndicatorTable'
import { BehaviorDashboard } from './components/BehaviorDashboard'
import { SessionContextViewer } from './components/SessionContextViewer'

type Tab = 'search' | 'context'

export default function App() {
  const { session, loading, resetSession } = useSession()
  const { intentPattern, contextDocument } = useBehaviorAnalysis(session)
  const [selectedUniv, setSelectedUniv] = useState<University | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('search')

  if (loading || !session) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>세션 초기화 중...</div>
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', fontSize: '14px' }}>
      {/* 좌측: 검색 + 지표 */}
      <div style={{ flex: 1, overflowY: 'auto', borderRight: '1px solid #ddd' }}>
        <div style={{ background: '#1a6fd4', color: '#fff', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>대학알리미 추천시스템</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Phase 1~2 데모</span>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
          {(['search', 'context'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: activeTab === tab ? '#fff' : '#f5f5f5',
                borderBottom: activeTab === tab ? '2px solid #1a6fd4' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? '#1a6fd4' : '#666',
              }}
            >
              {tab === 'search' ? '대학 검색' : 'Context Document'}
            </button>
          ))}
        </div>

        {activeTab === 'search' && (
          <>
            <UniversitySearch onSelectUniversity={setSelectedUniv} />
            {selectedUniv && (
              <div style={{ borderTop: '1px solid #eee' }}>
                <IndicatorTable university={selectedUniv} />
              </div>
            )}
          </>
        )}

        {activeTab === 'context' && (
          <SessionContextViewer contextDocument={contextDocument} />
        )}
      </div>

      {/* 우측: 행동 분석 대시보드 */}
      <div style={{ width: '420px', overflowY: 'auto', background: '#1a1a2e' }}>
        <BehaviorDashboard
          session={session}
          intentPattern={intentPattern}
          onReset={resetSession}
        />
      </div>
    </div>
  )
}
