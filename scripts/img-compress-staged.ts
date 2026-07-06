import process from 'node:process'
import Git from 'simple-git'
import prompts from 'prompts'
import { IMAGE_PATTERN, compressImages } from './img-compress'

const git = Git()
const stagedFiles = (await git.diff(['--cached', '--name-only']))
  .split('\n')
  .map(i => i.trim())
  .filter(Boolean)

const images = stagedFiles.filter(i => i.match(IMAGE_PATTERN))
if (images.length > 0) {
  console.log('Images to compress:\n', images)
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `Compress ${images.length} images?`,
  })

  if (!confirm)
    process.exit(0)

  compressImages(images, process.argv.includes('--convert2avif'))
}
else {
  console.log('No images to compress')
  process.exit(0)
}
