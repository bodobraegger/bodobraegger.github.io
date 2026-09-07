import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { imageSize } from 'image-size'
import type MarkdownIt from 'markdown-it'

/**
 * Widths generated for every local raster image. The prose column is at most
 * 70ch (about 660px), so 660 covers 1x, 990 covers 1.5x and 1320 covers 2x.
 */
export const IMAGE_WIDTHS = [660, 990, 1320]
export const IMAGE_FALLBACK_WIDTH = 1320
const IMAGE_SIZES = '(min-width: 720px) 660px, 100vw'

const LOCAL_SOURCE_PATTERN = /^\.{1,2}\//
const RASTER_PATTERN = /\.(?:png|jpe?g|webp|avif)$/i

interface RenderEnv {
  id: string
  hasRenderedImage?: boolean
}

/**
 * Renders markdown images with intrinsic dimensions, lazy loading and AVIF
 * and WebP variants served through vite-imagetools. Vue's asset transform
 * turns the relative `src`, `srcset` and `data-full` values into imports, and
 * imagetools resolves the query strings into generated files.
 *
 * The first image of a page loads eagerly with high priority because it is
 * the most likely largest contentful paint candidate.
 */
export function responsiveImages(md: MarkdownIt) {
  const escape = md.utils.escapeHtml

  md.renderer.rules.image = (tokens, idx, options, env: RenderEnv, self) => {
    const token = tokens[idx]
    const src = token.attrGet('src') ?? ''
    const alt = escape(self.renderInlineAsText(token.children ?? [], options, env))
    const title = token.attrGet('title')
    const titleAttribute = title ? ` title="${escape(title)}"` : ''

    const isFirstImage = !env.hasRenderedImage
    env.hasRenderedImage = true
    const loadingAttributes = isFirstImage
      ? 'loading="eager" fetchpriority="high" decoding="async"'
      : 'loading="lazy" decoding="async"'

    if (!LOCAL_SOURCE_PATTERN.test(src) || !RASTER_PATTERN.test(src))
      return `<img src="${escape(src)}" alt="${alt}"${titleAttribute} ${loadingAttributes}>`

    const file = resolve(dirname(env.id), src)
    const { width, height } = imageSize(readFileSync(file))
    if (!width || !height)
      throw new Error(`Cannot read the dimensions of ${file}`)

    // Attributes describe the largest generated variant, so the aspect ratio
    // reserves the right space before the image arrives
    const renderedWidth = Math.min(width, IMAGE_FALLBACK_WIDTH)
    const renderedHeight = Math.round(height * renderedWidth / width)

    const srcsetQuery = `?w=${IMAGE_WIDTHS.join(';')}&as=srcset`
    const avifSrcset = `${src}${srcsetQuery}&format=avif`
    const webpSrcset = `${src}${srcsetQuery}&format=webp`
    const webpFallback = `${src}?w=${IMAGE_FALLBACK_WIDTH}&format=webp`
    const avifFull = `${src}?w=${IMAGE_FALLBACK_WIDTH}&format=avif`

    return `<picture>`
      + `<source type="image/avif" srcset="${avifSrcset}" sizes="${IMAGE_SIZES}">`
      + `<img src="${webpFallback}" srcset="${webpSrcset}" sizes="${IMAGE_SIZES}"`
      + ` width="${renderedWidth}" height="${renderedHeight}" alt="${alt}"${titleAttribute}`
      + ` data-full="${avifFull}" ${loadingAttributes}>`
      + `</picture>`
  }
}
