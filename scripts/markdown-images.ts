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
/**
 * The first image of a page is also its link preview in messengers and social
 * sites. JPEG is the one format that all of them show, and WhatsApp skips
 * images above about 300 KB.
 */
const PREVIEW_WIDTH = 1200
const PREVIEW_QUALITY = 75

const LOCAL_SOURCE_PATTERN = /^\.{1,2}\//
const RASTER_PATTERN = /\.(?:png|jpe?g|webp|avif)$/i
/**
 * `invertable` or `invertable-dark` in the title of an image marks an image
 * made for the dark theme, and `invertable-white` one made for the light
 * theme. The other theme shows it inverted (main.css). The keyword is not
 * part of the title that the reader sees.
 */
const INVERTABLE_PATTERN = /(?:^|\s)invertable(?:-(dark|white))?(?=\s|$)/

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
    const fullTitle = token.attrGet('title') ?? ''
    const invertable = fullTitle.match(INVERTABLE_PATTERN)
    const title = fullTitle.replace(INVERTABLE_PATTERN, ' ').trim()
    const titleAttribute = title ? ` title="${escape(title)}"` : ''
    const classAttribute = invertable ? ` class="invertable-${invertable[1] === 'white' ? 'white' : 'dark'}"` : ''

    const isFirstImage = !env.hasRenderedImage
    env.hasRenderedImage = true
    const loadingAttributes = isFirstImage
      ? 'loading="eager" fetchpriority="high" decoding="async"'
      : 'loading="lazy" decoding="async"'

    if (!LOCAL_SOURCE_PATTERN.test(src) || !RASTER_PATTERN.test(src)) {
      const previewAttribute = isFirstImage ? ` data-preview="${escape(src)}"` : ''
      return `<img src="${escape(src)}" alt="${alt}"${titleAttribute}${classAttribute}${previewAttribute} ${loadingAttributes}>`
    }

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
    const previewAttribute = isFirstImage
      ? ` data-preview="${src}?w=${Math.min(width, PREVIEW_WIDTH)}&format=jpeg&quality=${PREVIEW_QUALITY}"`
      : ''

    return `<picture>`
      + `<source type="image/avif" srcset="${avifSrcset}" sizes="${IMAGE_SIZES}">`
      + `<img src="${webpFallback}" srcset="${webpSrcset}" sizes="${IMAGE_SIZES}"`
      + ` width="${renderedWidth}" height="${renderedHeight}" alt="${alt}"${titleAttribute}${classAttribute}`
      + ` data-full="${avifFull}"${previewAttribute} ${loadingAttributes}>`
      + `</picture>`
  }
}

const PREVIEW_PATTERN = /\sdata-preview="([^"]+)"/

/**
 * Adds the link preview tags for the first image of a rendered page, which
 * `responsiveImages` marks with `data-preview`. A page without an image, or
 * with its own og:image, stays as it is.
 */
export function addPreviewTags(html: string, pageUrl: string, siteUrl: string) {
  const preview = html.match(PREVIEW_PATTERN)?.[1]
  if (!preview || html.includes('property="og:image"'))
    return html
  const imageUrl = new URL(preview, siteUrl).href
  const tags = `<meta property="og:image" content="${imageUrl}">`
    + `<meta name="twitter:image" content="${imageUrl}">`
    + `<meta name="twitter:card" content="summary_large_image">`
    + `<meta property="og:url" content="${pageUrl}">`
  return html.replace('</head>', `${tags}</head>`)
}
