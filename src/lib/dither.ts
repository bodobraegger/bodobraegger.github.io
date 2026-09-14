const MAX_SIDE = 320

// Bayer 4x4: the threshold pattern that gives the crosshatch look.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/**
 * Shrinks an image to at most 320px a side and reduces it to black and white
 * with an ordered dither. The result is a PNG of a few kilobytes; drawing
 * through a canvas also drops any metadata the file carried.
 */
export async function ditherToPng(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const image = context.getImageData(0, 0, width, height)
  const pixels = image.data
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const alpha = pixels[i + 3] / 255
      // Luminance, composited on white so transparent parts come out white
      const luma = ((0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255) * alpha + (1 - alpha)
      const white = luma > (BAYER[y & 3][x & 3] + 0.5) / 16
      pixels[i] = pixels[i + 1] = pixels[i + 2] = white ? 255 : 0
      pixels[i + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('image_encode_failed')), 'image/png')
  })
}
