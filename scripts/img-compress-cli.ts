import process from 'node:process'
import { IMAGE_PATTERN, compressImages } from './img-compress'

const files = process.argv.slice(2).filter(i => i.match(IMAGE_PATTERN))
if (files.length === 0) {
  console.error('No files specified')
  process.exit(1)
}
compressImages(files, process.argv.includes('--convert2avif'))
