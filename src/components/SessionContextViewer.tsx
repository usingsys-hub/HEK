import type { SessionContextDocument } from '../types/session'

interface Props {
  contextDocument: SessionContextDocument | null
}

export function SessionContextViewer({ contextDocument }: Props) {
  if (!contextDocument) {
    return (
      <div style={{ padding: '16px', color: '#999', fontSize: '14px' }}>
        이벤트가 쌓이면 Session Context Document가 생성됩니다.
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '15px' }}>Session Context Document</h3>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
        RAG + GPT-Oss 20B 프롬프트 컨텍스트로 전달될 문서입니다.
      </div>

      {/* 자연어 요약 */}
      <div style={{ background: '#f0f7ff', border: '1px solid #b3d4f5', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', color: '#1a6fd4', fontWeight: 600, marginBottom: '6px' }}>자연어 요약 (GPT-Oss 입력용)</div>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>{contextDocument.summary}</div>
      </div>

      {/* 상세 정보 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
        <InfoBox label="의도 패턴" value={contextDocument.intent_pattern} />
        <InfoBox label="이벤트 수" value={`${contextDocument.event_count}개`} />

        {contextDocument.viewed_universities.length > 0 && (
          <InfoBox label="조회 대학" value={contextDocument.viewed_universities.join(', ')} fullWidth />
        )}
        {contextDocument.viewed_indicators.length > 0 && (
          <InfoBox label="관심 지표" value={contextDocument.viewed_indicators.join(', ')} fullWidth />
        )}
        {Object.keys(contextDocument.applied_filters).length > 0 && (
          <InfoBox
            label="적용 필터"
            value={Object.entries(contextDocument.applied_filters).map(([k, v]) => `${k}: ${v}`).join(', ')}
            fullWidth
          />
        )}
        {Object.keys(contextDocument.dwell_summary).length > 0 && (
          <InfoBox
            label="체류 시간"
            value={Object.entries(contextDocument.dwell_summary).map(([url, sec]) => `${url}: ${sec}초`).join(' | ')}
            fullWidth
          />
        )}
      </div>

      {/* Raw JSON */}
      <details style={{ marginTop: '12px' }}>
        <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#888' }}>Raw JSON 보기</summary>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px', fontSize: '11px', overflow: 'auto', marginTop: '8px' }}>
          {JSON.stringify(contextDocument, null, 2)}
        </pre>
      </details>
    </div>
  )
}

function InfoBox({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : undefined, background: '#f9f9f9', border: '1px solid #eee', borderRadius: '4px', padding: '8px' }}>
      <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontWeight: 500 }}>{value}</div>
    </div>
  )
}
