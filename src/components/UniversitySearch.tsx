import { useState } from 'react'
import type { University } from '../types/university'
import { SAMPLE_UNIVERSITIES, INDICATOR_LABELS } from '../data/universities'
import { useTracking } from '../hooks/useTracking'

interface Props {
  onSelectUniversity: (univ: University) => void
}

export function UniversitySearch({ onSelectUniversity }: Props) {
  const [keyword, setKeyword] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const tracking = useTracking()

  const regions = [...new Set(SAMPLE_UNIVERSITIES.map(u => u.region))].sort()

  const filtered = SAMPLE_UNIVERSITIES.filter(u => {
    const nameMatch = u.university_name.includes(keyword)
    const regionMatch = !regionFilter || u.region === regionFilter
    const typeMatch = !typeFilter || u.univ_type === typeFilter
    return nameMatch && regionMatch && typeMatch
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const isIndicator = Object.values(INDICATOR_LABELS).some(label => label.includes(keyword))
    tracking.trackSearch(keyword, isIndicator ? '지표명' : '대학명', filtered.length)
  }

  function handleRegionFilter(region: string) {
    setRegionFilter(region)
    if (region) tracking.trackFilterApply('지역', region)
  }

  function handleTypeFilter(type: string) {
    setTypeFilter(type)
    if (type) tracking.trackFilterApply('대학유형', type)
  }

  function handleSelectUniversity(univ: University) {
    tracking.trackPageView(`/university/${univ.university_id}`, '대학소개', univ.university_id, univ.university_name)
    onSelectUniversity(univ)
  }

  return (
    <div style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '12px' }}>대학 검색</h2>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="대학명 또는 지표명 검색..."
          style={{ flex: 1, padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#1a6fd4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          검색
        </button>
      </form>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={regionFilter} onChange={e => handleRegionFilter(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">전체 지역</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={typeFilter} onChange={e => handleTypeFilter(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">전체 유형</option>
          <option value="국립">국립</option>
          <option value="사립">사립</option>
        </select>
      </div>

      <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{filtered.length}개 대학</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
        {filtered.map(univ => (
          <button
            key={univ.university_id}
            onClick={() => handleSelectUniversity(univ)}
            style={{
              padding: '12px',
              textAlign: 'left',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#1a6fd4')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#ddd')}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>{univ.university_name}</div>
            <div style={{ fontSize: '12px', color: '#888' }}>{univ.region} · {univ.univ_type}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
