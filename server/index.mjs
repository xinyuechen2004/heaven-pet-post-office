import express from 'express'
import cors from 'cors'
import {
  editImage,
  generateImage,
  generateText,
  hasGeminiKey,
  imageModel,
  textModel,
} from '../api/_gemini.mjs'

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors())
app.use(express.json({ limit: '12mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, gemini: hasGeminiKey(), textModel, imageModel })
})

app.post('/api/text', async (req, res) => {
  try {
    const { prompt } = req.body || {}
    if (!prompt) return res.status(400).json({ error: '缺少 prompt' })

    res.json(await generateText(prompt))
  } catch (error) {
    console.error('[api/text]', error)
    res.status(500).json({ error: error?.message || '文字生成失败' })
  }
})

app.post('/api/image/edit', async (req, res) => {
  try {
    const { prompt, imageBase64 } = req.body || {}
    if (!prompt || !imageBase64) return res.status(400).json({ error: '缺少 prompt 或图片' })

    res.json(await editImage(prompt, imageBase64))
  } catch (error) {
    console.error('[api/image/edit]', error)
    res.status(500).json({ error: error?.message || '图片生成失败' })
  }
})

app.post('/api/image/generate', async (req, res) => {
  try {
    const { prompt } = req.body || {}
    if (!prompt) return res.status(400).json({ error: '缺少 prompt' })

    res.json(await generateImage(prompt))
  } catch (error) {
    console.error('[api/image/generate]', error)
    res.status(500).json({ error: error?.message || '图片生成失败' })
  }
})

app.listen(port, () => {
  console.log(`Heaven Pet Post Office API listening on http://localhost:${port}`)
})
