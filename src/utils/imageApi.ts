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

export async function generateImageFromReference(
  prompt: string,
  imageBase64: string,
  extraImages: string[] = []
): Promise<string> {
  let res: Response
  try {
    res = await fetch('/api/image/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64, imageBase64List: extraImages }),
      signal: timeoutSignal(70_000),
    })
  } catch (error) {
    throw normalizeFetchError(error)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.image) {
    throw new Error(data?.error || '图片生成失败')
  }

  return data.image
}

export async function generateImage(prompt: string): Promise<string> {
  let res: Response
  try {
    res = await fetch('/api/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: timeoutSignal(70_000),
    })
  } catch (error) {
    throw normalizeFetchError(error)
  }

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.image) {
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
