export async function generateImageFromReference(prompt: string, imageBase64: string): Promise<string> {
  const res = await fetch('/api/image/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64 }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.image) {
    throw new Error(data?.error || '图片生成失败')
  }

  return data.image
}

export async function generateImage(prompt: string): Promise<string> {
  const res = await fetch('/api/image/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.image) {
    throw new Error(data?.error || '图片生成失败')
  }

  return data.image
}

// Backward-compatible wrappers for the original Tusi async task API.
// The old code expects: taskId = imageGenImage(...); result = pollImageGenImage(taskId).
// Here the "taskId" is already the final data URL, because our own API returns synchronously.
export async function imageGenImage(prompt: string, imageBase64: string): Promise<string> {
  return generateImageFromReference(prompt, imageBase64)
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
