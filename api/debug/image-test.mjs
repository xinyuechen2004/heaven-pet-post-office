import { generateImage, hasGeminiKey, imageModel, textModel } from '../_gemini.mjs'

export const config = {
  maxDuration: 60,
}

export default async function handler(_req, res) {
  try {
    const result = await generateImage(
      '一张温柔小清新的正方形插画：奶油色信封里露出一颗发光金色星星，浅奶油背景，干净可爱。'
    )

    res.status(200).json({
      ok: true,
      gemini: hasGeminiKey(),
      textModel,
      imageModel,
      imagePrefix: result.image.slice(0, 40),
      imageLength: result.image.length,
      fallback: Boolean(result.fallback),
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      gemini: hasGeminiKey(),
      textModel,
      imageModel,
      errorName: error?.name || 'Error',
      errorMessage: error?.message || '图片生成失败',
      errorStack: String(error?.stack || '').split('\n').slice(0, 4).join('\n'),
    })
  }
}

