import { generateImage } from '../_gemini.mjs'

export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' })
  }

  try {
    const { prompt } = req.body || {}
    const result = await generateImage(prompt)
    res.status(200).json(result)
  } catch (error) {
    console.error('[api/image/generate]', error)
    res.status(500).json({ error: error?.message || '图片生成失败' })
  }
}
