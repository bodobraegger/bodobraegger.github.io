// The reference images of the difference faces, copies of the files in the
// reference/ folder of the Suzuno project. The pages show WebP copies, which
// vite-imagetools makes in the build.

export interface ReferenceImage {
  /** The largest WebP copy. */
  src: string
  /** All WebP copies, for the srcset attribute. */
  srcset: string
  /** The size of the largest copy, which is the size of the original or less. */
  width: number
  height: number
}

interface Copies {
  src: string
  srcset?: string
  w: number
  h: number
}

const REFERENCE_FOLDER = '/src/assets/suzuno/reference'
// The widths of the markdown images (scripts/markdown-images.ts): the prose
// column at 1x, 1.5x and 2x. An image keeps its width when it is narrower.
// A lower quality shows as noise in the difference.
const COPIES = import.meta.glob<Copies>(
  '/src/assets/suzuno/reference/**/*.png',
  { eager: true, query: { w: '660;990;1320', format: 'webp', quality: '90', as: 'img' }, import: 'default' },
)

export class UnknownReferenceError extends Error {
  constructor(name: string) {
    super(`${REFERENCE_FOLDER}/${name} does not exist`)
    this.name = 'UnknownReferenceError'
  }
}

/** An image in src/assets/suzuno/reference/, for example referenceImage('cover-lit.png'). */
export function referenceImage(name: string): ReferenceImage {
  const copies = COPIES[`${REFERENCE_FOLDER}/${name}`]
  if (!copies)
    throw new UnknownReferenceError(name)
  return { src: copies.src, srcset: copies.srcset ?? copies.src, width: copies.w, height: copies.h }
}
