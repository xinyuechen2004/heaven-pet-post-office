import { GoogleGenAI } from '@google/genai'

const geminiApiKey = process.env.GEMINI_API_KEY
const client = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null
const siliconFlowApiKey = process.env.SILICONFLOW_API_KEY
const siliconFlowBaseUrl = process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1'

export const textModel = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash'
export const imageModel = process.env.SILICONFLOW_IMAGE_MODEL || 'Qwen/Qwen-Image-Edit-2509'
export const textToImageModel = process.env.SILICONFLOW_TEXT_TO_IMAGE_MODEL || 'Kwai-Kolors/Kolors'
export const imageProvider = siliconFlowApiKey ? 'siliconflow' : 'gemini-fallback'

export function hasGeminiKey() {
  return Boolean(client)
}

export function hasSiliconFlowKey() {
  return Boolean(siliconFlowApiKey)
}

export function fallbackSvgDataUrl(label = 'TA') {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff8ed"/>
          <stop offset="1" stop-color="#f6dfcc"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="38%" r="45%">
          <stop offset="0" stop-color="#fff8c9"/>
          <stop offset="1" stop-color="#f7b574"/>
        </radialGradient>
      </defs>
      <rect width="1024" height="1024" rx="210" fill="url(#bg)"/>
      <circle cx="512" cy="455" r="255" fill="url(#glow)" opacity="0.9"/>
      <path d="M512 220c50 95 142 74 166 152 22 70-45 126-35 218 9 84-55 152-131 152s-140-68-131-152c10-92-57-148-35-218 24-78 116-57 166-152z" fill="#fff5e6" stroke="#d8b99a" stroke-width="10"/>
      <circle cx="430" cy="455" r="28" fill="#5a4638"/>
      <circle cx="594" cy="455" r="28" fill="#5a4638"/>
      <path d="M470 555q42 36 84 0" fill="none" stroke="#8b6b55" stroke-width="18" stroke-linecap="round"/>
      <text x="512" y="850" text-anchor="middle" font-size="54" fill="#a7775b" font-family="sans-serif">${label}</text>
    </svg>
  `.trim()
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

export function normalizeBase64Image(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('缺少图片数据')
  }
  const match = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/)
  if (match) {
    return { mime: match[1], buffer: Buffer.from(match[2], 'base64') }
  }
  return { mime: 'image/png', buffer: Buffer.from(imageBase64, 'base64') }
}

function bufferToBase64(buffer) {
  return Buffer.isBuffer(buffer) ? buffer.toString('base64') : Buffer.from(buffer).toString('base64')
}

function detectImageMime(buffer, fallback = 'image/png') {
  if (!buffer || buffer.length < 12) return fallback
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png'
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif'
  }
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) {
    return 'image/webp'
  }
  return fallback
}

function normalizeImageDataUrlForSiliconFlow(imageBase64) {
  const { buffer, mime } = normalizeBase64Image(imageBase64)
  const safeMime = mime.startsWith('image/') && mime !== 'image/octet-stream'
    ? mime
    : detectImageMime(buffer)
  return `data:${safeMime};base64,${bufferToBase64(buffer)}`
}

function extractImageFromOutputs(outputs) {
  const imageOutput = outputs?.find((output) => output?.type === 'image' && output?.data)
  if (!imageOutput?.data) return null
  return `data:${imageOutput.mime_type || 'image/png'};base64,${imageOutput.data}`
}

function extractImageFromGenerateContent(response) {
  const parts = response?.candidates?.[0]?.content?.parts || []
  const imagePart = parts.find((part) => part?.inlineData?.data)
  if (!imagePart?.inlineData?.data) return null
  return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`
}

function withTimeout(promise, ms, label = '请求超时') {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(label)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function fetchSiliconFlowImage(payload) {
  if (!siliconFlowApiKey) {
    throw new Error('缺少 SILICONFLOW_API_KEY')
  }

  const response = await withTimeout(fetch(`${siliconFlowBaseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${siliconFlowApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }), 58_000, '硅基流动图片生成超时，请稍后重试')

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.message || data?.error?.message || data?.data || response.statusText
    throw new Error(`硅基流动图片生成失败：${message}`)
  }

  const imageUrl = data?.images?.[0]?.url
  if (!imageUrl) {
    throw new Error('硅基流动未返回图片地址')
  }

  const imageResponse = await withTimeout(fetch(imageUrl), 20_000, '下载生成图片超时')
  if (!imageResponse.ok) {
    throw new Error(`下载生成图片失败：${imageResponse.status}`)
  }

  const contentType = imageResponse.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageResponse.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const safeContentType = contentType.startsWith('image/') && contentType !== 'image/octet-stream'
    ? contentType
    : detectImageMime(buffer)
  return `data:${safeContentType};base64,${buffer.toString('base64')}`
}

async function editImageWithSiliconFlow(prompt, imageBase64) {
  return {
    image: await fetchSiliconFlowImage({
      model: imageModel,
      prompt,
      image: normalizeImageDataUrlForSiliconFlow(imageBase64),
      num_inference_steps: 20,
      guidance_scale: 4,
    }),
    provider: 'siliconflow',
  }
}

async function generateImageWithSiliconFlow(prompt) {
  return {
    image: await fetchSiliconFlowImage({
      model: textToImageModel,
      prompt,
      image_size: '1024x1024',
      batch_size: 1,
      num_inference_steps: 20,
      guidance_scale: 7.5,
    }),
    provider: 'siliconflow',
  }
}

export async function generateText(prompt) {
  if (!prompt) throw new Error('缺少 prompt')

  if (!client) {
    return {
      text: '我今天到了一个很温暖的地方。这里的风很轻，路边有小小的花。我会慢慢旅行，也会偶尔给你寄信。你不用急着好起来，慢慢来就好。',
      fallback: true,
    }
  }

  const response = await client.models.generateContent({
    model: textModel,
    contents: prompt,
  })

  return { text: response.text || '' }
}

export async function editImage(prompt, imageBase64) {
  if (!prompt || !imageBase64) throw new Error('缺少 prompt 或图片')

  if (siliconFlowApiKey) {
    return editImageWithSiliconFlow(prompt, imageBase64)
  }

  if (!client) {
    return { image: imageBase64, fallback: true }
  }

  const { mime, buffer } = normalizeBase64Image(imageBase64)
  const result = await withTimeout(client.models.generateContent({
    model: imageModel,
    contents: [{
      role: 'user',
      parts: [
        { text: prompt },
        { inlineData: { data: bufferToBase64(buffer), mimeType: mime } },
      ],
    }],
    config: { responseModalities: ['IMAGE'] },
  }), 45_000, '图片生成超时，请稍后重试')
  const image = extractImageFromGenerateContent(result)
  if (!image) throw new Error('模型未返回图片')
  return { image }
}

export async function generateImage(prompt) {
  if (!prompt) throw new Error('缺少 prompt')

  if (siliconFlowApiKey) {
    return generateImageWithSiliconFlow(prompt)
  }

  if (!client) {
    return { image: fallbackSvgDataUrl('远方来信'), fallback: true }
  }

  const result = await withTimeout(client.models.generateContent({
    model: imageModel,
    contents: prompt,
    config: { responseModalities: ['IMAGE'] },
  }), 45_000, '图片生成超时，请稍后重试')
  const image = extractImageFromGenerateContent(result)
  if (!image) throw new Error('模型未返回图片')
  return { image }
}
