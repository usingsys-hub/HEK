import { Pinecone } from '@pinecone-database/pinecone'

const INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? 'hek-universities'
const EMBEDDING_MODEL = 'multilingual-e5-large'
const TOP_K = 5

let pc: Pinecone | null = null

function getClient(): Pinecone {
  if (!pc) {
    pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
  }
  return pc
}

export interface UniversityVector {
  university_id: string
  university_name: string
  region: string
  univ_type: string
  text_profile: string
  indicators: Record<string, number>
}

// 텍스트 → 임베딩 벡터 변환 (Pinecone Inference API 사용)
async function embedText(text: string): Promise<number[]> {
  const client = getClient()
  const result = await client.inference.embed(
    EMBEDDING_MODEL,
    [text],
    { inputType: 'query', truncate: 'END' }
  )
  const embedding = result[0]
  if (!embedding?.values) throw new Error('Pinecone embedding failed')
  return embedding.values
}

// 대학 데이터를 Pinecone에 upsert (인덱싱 스크립트용)
export async function upsertUniversities(universities: UniversityVector[]): Promise<void> {
  const client = getClient()

  // 텍스트 임베딩 일괄 생성
  const texts = universities.map(u => u.text_profile)
  const embedResult = await client.inference.embed(
    EMBEDDING_MODEL,
    texts,
    { inputType: 'passage', truncate: 'END' }
  )

  const vectors = universities.map((u, i) => ({
    id: u.university_id,
    values: embedResult[i].values!,
    metadata: {
      university_name: u.university_name,
      region: u.region,
      univ_type: u.univ_type,
      text_profile: u.text_profile,
      ...Object.fromEntries(
        Object.entries(u.indicators).map(([k, v]) => [`ind_${k}`, v])
      ),
    },
  }))

  const index = client.index(INDEX_NAME)
  // Pinecone 무료 티어: 배치 최대 100개 (20개 대학은 한 번에 처리)
  await index.upsert(vectors)
  console.log(`[pinecone] upserted ${vectors.length} universities`)
}

export interface SearchResult {
  university_id: string
  university_name: string
  region: string
  univ_type: string
  text_profile: string
  score: number
  indicators: Record<string, number>
}

// 컨텍스트 요약으로 유사 대학 검색
export async function searchSimilarUniversities(
  queryText: string,
  excludeIds: string[] = []
): Promise<SearchResult[]> {
  const client = getClient()
  const queryVector = await embedText(queryText)

  const index = client.index(INDEX_NAME)
  const response = await index.query({
    vector: queryVector,
    topK: TOP_K + excludeIds.length, // 제외 후 TOP_K 확보
    includeMetadata: true,
  })

  return (response.matches ?? [])
    .filter(m => !excludeIds.includes(m.id))
    .slice(0, TOP_K)
    .map(m => {
      const meta = m.metadata as Record<string, unknown>
      const indicators: Record<string, number> = {}
      for (const [k, v] of Object.entries(meta)) {
        if (k.startsWith('ind_')) {
          indicators[k.replace('ind_', '')] = v as number
        }
      }
      return {
        university_id: m.id,
        university_name: meta.university_name as string,
        region: meta.region as string,
        univ_type: meta.univ_type as string,
        text_profile: meta.text_profile as string,
        score: m.score ?? 0,
        indicators,
      }
    })
}
