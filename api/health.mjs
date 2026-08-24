import { hasGeminiKey, imageModel, textModel } from './_gemini.mjs'

export default function handler(_req, res) {
  res.status(200).json({ ok: true, gemini: hasGeminiKey(), textModel, imageModel })
}

