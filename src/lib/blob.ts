'use client'

type ImageOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: 'image/jpeg' | 'image/webp'
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('파일을 읽지 못했어요.'))
    reader.readAsDataURL(file)
  })

const loadImage = (dataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('이미지를 불러오지 못했어요.'))
    img.src = dataUrl
  })

const resizeToBlob = async (
  file: File,
  options: ImageOptions = {}
): Promise<Blob> => {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82, mimeType = 'image/webp' } = options

  const dataUrl = await readFileAsDataUrl(file)
  const img = await loadImage(dataUrl)

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    // 리사이즈 실패 시 원본 파일 반환
    return file
  }

  ctx.drawImage(img, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('이미지 변환에 실패했어요.'))
      },
      mimeType,
      quality
    )
  })
}

const sanitizeFilename = (name: string) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60)

/**
 * 파일을 리사이즈한 뒤 /api/upload를 통해 Vercel Blob에 업로드하고 공개 URL 배열을 반환합니다.
 */
export const uploadImagesToBlob = async (
  files: FileList | null,
  limit = 12,
  options: ImageOptions = {}
): Promise<string[]> => {
  if (!files || files.length === 0) return []

  const list = Array.from(files).slice(0, limit)
  const mimeType = options.mimeType ?? 'image/webp'
  const ext = mimeType.split('/')[1]

  const urls = await Promise.all(
    list.map(async (file) => {
      const resized = await resizeToBlob(file, options)
      const filename = `${Date.now()}-${sanitizeFilename(file.name)}.${ext}`

      const formData = new FormData()
      formData.append('file', new File([resized], filename, { type: mimeType }))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? `업로드 실패 (${response.status})`)
      }

      const { url } = await response.json() as { url: string }
      return url
    })
  )

  return urls
}
