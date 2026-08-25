import { hasGeminiKey, hasSiliconFlowKey, imageModel, imageProvider, siliconFlowTextModel, textModel, textToImageModel } from './_gemini.mjs'

export default function handler(_req, res) {
  res.status(200).json({
    ok: true,
    gemini: hasGeminiKey(),
    siliconflow: hasSiliconFlowKey(),
    imageProvider,
    textModel,
    siliconFlowTextModel,
    imageModel,
    textToImageModel,
  })
}
