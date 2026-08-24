export interface PickedMediaFile {
  file: File
  previewUrl: string
}

export function pickImages(maxCount = 1): Promise<PickedMediaFile[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = maxCount > 1
    input.style.position = 'fixed'
    input.style.left = '-9999px'
    input.style.opacity = '0'

    const cleanup = () => {
      input.remove()
    }

    input.onchange = () => {
      const selected = Array.from(input.files || []).slice(0, maxCount)
      cleanup()
      resolve(selected.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })))
    }

    input.oncancel = () => {
      cleanup()
      resolve([])
    }

    input.onerror = () => {
      cleanup()
      reject(new Error('无法打开图片选择器'))
    }

    document.body.appendChild(input)
    input.click()
  })
}
