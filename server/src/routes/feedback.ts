import { Router, type Request, type Response } from 'express'
import { insertFeedback, getAbStats } from '../db/sqlite'

export const feedbackRouter = Router()

feedbackRouter.post('/', (req: Request, res: Response) => {
  try {
    const { session_id, recommendation_id, feedback_type, position_rank, ab_group } = req.body

    if (!session_id || !recommendation_id || !feedback_type) {
      res.status(400).json({ error: 'session_id, recommendation_id, feedback_type는 필수입니다.' })
      return
    }

    if (!['click', 'positive', 'negative'].includes(feedback_type)) {
      res.status(400).json({ error: 'feedback_type은 click | positive | negative 중 하나여야 합니다.' })
      return
    }

    insertFeedback({ session_id, recommendation_id, feedback_type, position_rank, ab_group })
    res.json({ success: true })
  } catch (err) {
    console.error('[feedback] error:', err)
    res.status(500).json({ error: '피드백 저장 중 오류가 발생했습니다.' })
  }
})

// A/B 테스트 통계 조회
feedbackRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = getAbStats()
    res.json({ stats })
  } catch (err) {
    console.error('[feedback/stats] error:', err)
    res.status(500).json({ error: '통계 조회 중 오류가 발생했습니다.' })
  }
})
