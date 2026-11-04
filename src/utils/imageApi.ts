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

// 编辑模型不支持 image_size；用横向参考画布引导比例，不拉伸宠物。
export async function generatePostcardImage(prompt: string, reference: string): Promise<string> {
  const load = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('明信片图片加载失败，请重试'))
    img.src = src
  })
  const pet = await load(reference)
  const canvas = document.createElement('canvas')
  canvas.width = 1152
  canvas.height = 864
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('无法准备横版明信片画布')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const scale = Math.min(400 / pet.width, 400 / pet.height)
  ctx.drawImage(pet, 48, canvas.height - pet.height * scale - 48, pet.width * scale, pet.height * scale)
  const instructions = `只输出一幅横向4:3的无字风景插画（宽大于高），保持输入画布比例。输入的白色画布只是布局参考，必须全部重新绘制为自然场景，不保留白底或宠物贴纸边。画面中绝对不出现任何中文、英文、数字、伪文字、标题、标语、字幕、标签、签名、水印或装饰符号；不是海报、封面、宣传图或排版设计。下面的描述都是绘画指令，不能作为文字画进图中。${prompt} 再次确认：只画风景与宠物，全图无文字，横向4:3。`
  const result = await cropDarkFrame(await generateImageFromReference(instructions, canvas.toDataURL('image/jpeg', 0.94)))
  const image = await load(result)
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
