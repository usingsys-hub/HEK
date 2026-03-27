import type { University } from '../types/university'
import type { UniversityIndicators } from '../types/university'
import { INDICATOR_LABELS } from '../data/universities'
import { useTracking } from '../hooks/useTracking'

interface Props {
  university: University
}

function formatValue(id: string, value: number): string {
  if (id === 'corporate_transfer') return `${(value / 100000000).toFixed(1)}억원`
  if (id.includes('cost') || id.includes('scholarship') || id.includes('support') || id.includes('research')) {
    return `${(value / 10000).toFixed(0)}만원`
  }
  if (id.includes('ratio') || id.includes('rate') || id.includes('employment')) return `${value}%`
  if (id === 'books_per_student') return `${value}권`
  if (id === 'dept_student_count') return `${value.toLocaleString()}명`
  return String(value)
}

export function IndicatorTable({ university }: Props) {
  const tracking = useTracking()

  function handleIndicatorClick(indicatorId: string) {
    tracking.trackIndicatorView(
      indicatorId as keyof UniversityIndicators,
      INDICATOR_LABELS[indicatorId],
      university.university_id,
      university.university_name
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginBottom: '12px' }}>{university.university_name} 주요 지표</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>지표명</th>
            <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>{university.disclosure_year}년</th>
          </tr>
        </thead>
        <tbody>
          {(Object.entries(university.indicators) as [string, number][]).map(([id, value]) => (
            <tr
              key={id}
              onClick={() => handleIndicatorClick(id)}
              style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <td style={{ padding: '8px 12px' }}>{INDICATOR_LABELS[id]}</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 500 }}>{formatValue(id, value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>* 지표 행 클릭 시 조회 이벤트가 기록됩니다.</div>
    </div>
  )
}
