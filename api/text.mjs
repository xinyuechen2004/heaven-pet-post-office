import { generateText } from './_gemini.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' })
  }

  try {
    const { prompt } = req.body || {}
    const result = await generateText(prompt)
    res.status(200).json(result)
  } catch (error) {
    console.error('[api/text]', error)
    res.status(500).json({ error: error?.message || '文字生成失败' })
  }
}

