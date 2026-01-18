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

const resizeImageToDataUrl = async (
  file: File,
  options: ImageOptions = {}
) => {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82, mimeType = 'image/webp' } =
    options
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
    return dataUrl
  }
  ctx.drawImage(img, 0, 0, width, height)
  return canvas.toDataURL(mimeType, quality)
}

export const readFilesAsDataUrls = async (
  files: FileList | null,
  limit = 12,
  options: ImageOptions = {}
) => {
  if (!files) return []
  const list = Array.from(files).slice(0, limit)
  const urls = await Promise.all(list.map((file) => resizeImageToDataUrl(file, options)))
  return urls
}

export const moveItem = <T,>(items: T[], from: number, to: number) => {
  if (from === to) return items
  const next = [...items]
  const [item] = next.splice(from, 1)
  if (item === undefined) return items
  next.splice(to, 0, item)
  return next
}
