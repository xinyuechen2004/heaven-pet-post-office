export async function generateAiText(prompt: string): Promise<string> {
  const res = await fetch('/api/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok || !data?.text) {
    throw new Error(data?.error || '文字生成失败')
  }

  return data.text
}
