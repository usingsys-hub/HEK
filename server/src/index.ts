import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { recommendRouter } from './routes/recommend'
import { feedbackRouter } from './routes/feedback'
import { healthRouter } from './routes/health'
import { initDb } from './db/sqlite'

const app = express()
const PORT = process.env.PORT ?? 3001
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'

app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.use('/api/recommend', recommendRouter)
app.use('/api/feedback', feedbackRouter)
app.use('/api/health', healthRouter)

initDb()

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
