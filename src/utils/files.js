// Convert a File/Blob to a base64 data URL.
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read the selected file.'))
    reader.readAsDataURL(file)
  })
}

// Basic image compression for enquiry reference images.
// Returns a data URL (JPEG) capped roughly at maxBytes.
export async function compressImage(file, { maxWidth = 900, maxBytes = 180 * 1024, quality = 0.8 } = {}) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file.')
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width))
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      let q = quality
      let dataUrl = canvas.toDataURL('image/jpeg', q)

      // Rough byte size estimate from base64 length.
      const estimateBytes = (str) => Math.round((str.length - 'data:image/jpeg;base64,'.length) * 0.75)
      while (estimateBytes(dataUrl) > maxBytes && q > 0.3) {
        q -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', q)
      }

      resolve(dataUrl)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load the selected image.'))
    }

    img.src = url
  })
}
