function apiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  return `${base}${path}`
}

export async function generateAiText(prompt: string): Promise<string> {
  const res = await fetch(apiUrl('/api/text'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.text || data?.fallback) {
    throw new Error(data?.error || '文字生成失败')
  }

  return data.text
}
