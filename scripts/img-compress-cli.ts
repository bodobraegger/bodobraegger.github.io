import process from 'node:process'
import { compressImages } from './img-compress'

const files = process.argv.slice(2).filter(i => i.match(/\.(png|jpe?g|webp|avif)$/i))
if (files.length === 0) {
  console.error('No files specified')
  process.exit(1)
}
compressImages(files, process.argv.includes('--convert2avif'))
