const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_DIMENSION = 720
const JPEG_QUALITY = 0.72

export class ImageValidationError extends Error {}

export function validateImageFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new ImageValidationError('이미지 파일만 업로드할 수 있어요')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError('이미지는 5MB 이하만 가능해요')
  }
}

/** Validate + downscale/compress an image file into a small base64 data URL for local storage. */
export async function compressImageToDataUrl(file: File): Promise<string> {
  validateImageFile(file)

  const bitmap = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageValidationError('이미지를 처리할 수 없어요')
  ctx.drawImage(bitmap, 0, 0, w, h)

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ImageValidationError('이미지를 불러올 수 없어요'))
    }
    img.src = url
  })
}
