import { Router, type Request, type Response } from 'express'
import { runRagPipeline, determineAbGroup, type RagRequest } from '../services/rag'

export const recommendRouter = Router()

recommendRouter.post('/', async (req: Request, res: Response) => {
  try {
    const {
      session_id,
      intent_pattern,
      summary,
      viewed_universities = [],
      viewed_indicators = [],
      applied_filters = {},
      ab_group,
    } = req.body as Partial<RagRequest>

    if (!session_id || !summary) {
      res.status(400).json({ error: 'session_id와 summary는 필수입니다.' })
      return
    }

    const resolvedGroup = ab_group ?? determineAbGroup(session_id)

    const result = await runRagPipeline({
      session_id,
      intent_pattern: intent_pattern ?? 'UNKNOWN',
      summary,
      viewed_universities,
      viewed_indicators,
      applied_filters,
      ab_group: resolvedGroup,
    })

    res.json(result)
  } catch (err) {
    console.error('[recommend] error:', err)
    res.status(500).json({ error: '추천 생성 중 오류가 발생했습니다.' })
  }
})
