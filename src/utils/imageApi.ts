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
