import fs from 'node:fs/promises'
import sharp from 'sharp'
import c from 'picocolors'

export const IMAGE_PATTERN = /\.(png|jpe?g|webp|avif)$/i

const maxSize = 1440

export async function compressImages(files: string[], convert2avif: boolean) {
  await Promise.all(files.map(async (file) => {
    try {
      await compressImage(file, convert2avif)
    }
    catch (error) {
      console.error(c.red(`[FAIL] ${file}:`), error instanceof Error ? error.message : error)
    }
  }))
}

async function compressImage(file: string, convert2avif: boolean) {
  const buffer = await fs.readFile(file)
  let image = sharp(buffer)
  const { format, width, height } = await image.metadata()
  if (!format)
    throw new Error(`Could not determine format of ${file}`)
  if (!width || !height)
    throw new Error(`Could not determine size of ${file}`)
  if (format !== 'jpeg' && format !== 'png' && format !== 'webp' && format !== 'avif')
    throw new Error(`Unsupported format ${format} of ${file}`)

  if (width > maxSize || height > maxSize)
    image = image.resize(maxSize)

  if (convert2avif) {
    image = image.avif({ quality: 85 })
    file = file.replace(/\.(jpe?g|png|webp)$/, '.avif')
  }
  else if (format === 'png') {
    image = image.png({ compressionLevel: 9 })
  }
  else {
    image = image[format]({ quality: 80 })
  }

  const outBuffer = await image.withMetadata().toBuffer()
  const size = buffer.byteLength
  const outSize = outBuffer.byteLength

  const percent = (outSize - size) / size
  if (percent > -0.10) {
    console.log(c.dim(`[SKIP] ${bytesToHuman(size)} -> ${bytesToHuman(outSize)} ${(percent * 100).toFixed(1).padStart(5, ' ')}%  ${file}`))
  }
  else {
    await fs.writeFile(file, outBuffer)
    console.log(`[COMP] ${bytesToHuman(size)} -> ${bytesToHuman(outSize)} ${c.green(`${(percent * 100).toFixed(1).padStart(5, ' ')}%`)}  ${file}`)
  }
}

function bytesToHuman(size: number) {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return `${(size / 1024 ** i).toFixed(2)} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`.padStart(10, ' ')
}
