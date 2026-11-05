function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController()
  window.setTimeout(() => controller.abort(new DOMException('图片生成等待超时，请重试', 'TimeoutError')), ms)
  return controller.signal
}

function normalizeFetchError(error: unknown): Error {
  if (error instanceof DOMException && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
    return new Error('图片生成等待超时，请重试')
  }
  if (error instanceof Error && error.message.includes('aborted')) {
    return new Error('图片生成等待超时，请重试')
  }
  return error instanceof Error ? error : new Error('图片生成请求失败')
}

function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  return `${base}${path}`
}

export async function generateImageFromReference(
  prompt: string,
  imageBase64: string,
  extraImages: string[] = []
): Promise<string> {
  let res: Response
  try {
    res = await fetch(apiUrl('/api/image/edit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64, imageBase64List: extraImages }),
      signal: timeoutSignal(70_000),
    })
  } catch (error) {
    throw normalizeFetchError(error)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.image || data?.fallback) {
    throw new Error(data?.error || '图片生成失败')
  }

  return data.image
}

export async function generateImage(prompt: string): Promise<string> {
  let res: Response
  try {
    res = await fetch(apiUrl('/api/image/generate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: timeoutSignal(70_000),
    })
  } catch (error) {
    throw normalizeFetchError(error)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.image || data?.fallback) {
    throw new Error(data?.error || '图片生成失败')
  }

  return data.image
}

// Backward-compatible wrappers for the original Tusi async task API.
// The old code expects: taskId = imageGenImage(...); result = pollImageGenImage(taskId).
// Here the "taskId" is already the final data URL, because our own API returns synchronously.
export async function imageGenImage(prompt: string, imageBase64: string, extraImages: string[] = []): Promise<string> {
  return generateImageFromReference(prompt, imageBase64, extraImages)
}

export async function pollImageGenImage(taskIdOrDataUrl: string): Promise<string> {
  return taskIdOrDataUrl
}

// 使用原始身份参考，不把宠物预先拼在空画布上，避免模型照搬贴图布局。
export async function generatePostcardImage(prompt: string, reference: string): Promise<string> {
  const load = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('明信片图片加载失败，请重试'))
    img.src = src
  })
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 48
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法检查明信片画面')
  const instructions = `重新绘制完整的横向4:3风景插画，宽大于高。参考图仅用于识别宠物身份，不要保留参考图背景、边框、布局。背景必须是明亮丰富的旅行场景，铺满全部画面，不能是黑色、纯色或空白底。宠物完整且自然地融入一角，面积约8%，不是贴纸或画中画，不带矩形框。画面绝对不出现中文、英文、数字、标题、标语、字幕或签名；不是海报或封面。${prompt} 最终只输出无字横向风景插画，宠物在一角，背景完整明亮。`
  const result = await generateImageFromReference(instructions, reference)
  const image = await load(result)
  ctx.drawImage(image, 0, 0, 64, 48)
  const pixels = ctx.getImageData(0, 0, 64, 48).data
  let dark = 0
  for (let i = 0; i < pixels.length; i += 4) {
    if (Math.max(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!) < 40) dark++
  }
  if (dark / (64 * 48) > 0.65) {
    throw new Error('这次没有生成完整的旅行背景，未保存，请重新生成')
  }
  const ratio = image.width / image.height
  if (ratio < 1.2 || ratio > 1.5) {
    throw new Error('这次生成的画面不是横版明信片，未保存，请重试')
  }
  return result
}

export async function imageGeneration(prompt: string): Promise<string> {
  return generateImage(prompt)
}

export async function pollImageGeneration(taskIdOrDataUrl: string): Promise<string> {
  return taskIdOrDataUrl
}

export function cropDarkFrame(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = img.width
      sourceCanvas.height = img.height
      const sourceCtx = sourceCanvas.getContext('2d')
      if (!sourceCtx) { resolve(dataUrl); return }
      sourceCtx.drawImage(img, 0, 0)
      const pixels = sourceCtx.getImageData(0, 0, img.width, img.height).data

      const isDarkColumn = (x: number) => {
        let dark = 0
        for (let y = 0; y < img.height; y++) {
          const i = (y * img.width + x) * 4
          if ((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 < 34) dark++
        }
        return dark / img.height > 0.82
      }
      const isDarkRow = (y: number) => {
        let dark = 0
        for (let x = 0; x < img.width; x++) {
          const i = (y * img.width + x) * 4
          if ((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3 < 34) dark++
        }
        return dark / img.width > 0.82
      }

      let left = 0
      let right = img.width - 1
      let top = 0
      let bottom = img.height - 1
      while (left < right && isDarkColumn(left)) left++
      while (right > left && isDarkColumn(right)) right--
      while (top < bottom && isDarkRow(top)) top++
      while (bottom > top && isDarkRow(bottom)) bottom--

      left = Math.max(0, left - 2)
      top = Math.max(0, top - 2)
      right = Math.min(img.width - 1, right + 2)
      bottom = Math.min(img.height - 1, bottom + 2)
      const width = right - left + 1
      const height = bottom - top + 1
      const changedEnough = width < img.width - 12 || height < img.height - 12
      if (!changedEnough || width < img.width * 0.35 || height < img.height * 0.35) {
        resolve(dataUrl)
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(dataUrl); return }
      ctx.drawImage(img, left, top, width, height, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.94))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}
