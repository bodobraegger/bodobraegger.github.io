import { createZip } from '../utils/zip'
import type { ZipEntry } from '../utils/zip'
import type { Language } from './languages'
import { formatDate } from '.'

/**
 * Builds an EPUB 3 book from the rendered article of a page, in the browser.
 * The book is one content document, a navigation document built from the h2
 * and h3 headings, a small stylesheet and the images of the page that come
 * from this site.
 */

export interface EpubPage {
  title: string
  language: Language
  date?: string | Date
  /** The file name of the book, without the extension. */
  slug: string
}

const EPUB_MEDIA_TYPE = 'application/epub+zip'
const PACKAGE_DIRECTORY = 'EPUB'
const CONTENT_FILE = 'content.xhtml'
const NAV_FILE = 'nav.xhtml'
const STYLESHEET_FILE = 'style.css'
const PACKAGE_FILE = 'package.opf'
const IMAGE_DIRECTORY = 'images'

const XHTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
const OPS_NAMESPACE = 'http://www.idpf.org/2007/ops'
const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8"?>\n'

/** The browser keeps the object URL this long, so a slow download can still read it. */
const OBJECT_URL_LIFETIME_MS = 60_000

const REMOVED_SELECTOR = [
  '[data-no-epub]',
  // DrawablePen: the pen, its canvas, its controls and the touch toolbar
  '.drawing-canvas',
  '.pen-inline-container',
  '.pen-controls-container',
  '.pen-touch-layer',
  '.pen-toolbar',
  'canvas',
  'script',
  'style',
  'noscript',
  'template',
  'button',
  'form',
  'input',
  'select',
  'textarea',
  'iframe',
  'video',
  'audio',
  'object',
  'embed',
  'source',
  '.header-anchor',
  '.table-of-contents-anchor',
].join(',')

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6'
const NAV_HEADING_SELECTOR = 'h2, h3'
const NAV_SUBHEADING_TAG = 'H3'
const TITLE_ID = 'book-title'

/** The attributes an HTML element keeps. Classes and styles belong to the site, not to the book. */
const KEPT_ATTRIBUTES = new Set([
  'alt',
  'cite',
  'colspan',
  'datetime',
  'dir',
  'href',
  'id',
  'lang',
  'reversed',
  'rowspan',
  'scope',
  'src',
  'start',
  'title',
])

/** The attributes an inline SVG element loses. Every other one draws the picture. */
const REMOVED_SVG_ATTRIBUTE_PATTERN = /^(?:class|style|focusable|data-.*|on.*)$/

/** Characters that XML 1.0 does not allow, which XMLSerializer writes out all the same. */
// eslint-disable-next-line no-control-regex
const INVALID_XML_CHARACTERS = /[\u0000-\u0008\v\f\u000E-\u001F\uFFFE\uFFFF]/g

const BYLINE_DATE: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }

const WHITESPACE_RUN = /\s+/g
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MILLISECONDS_PATTERN = /\.\d{3}Z$/

/** The image types of the EPUB 3 core media types. A different type is redrawn as PNG. */
const CORE_IMAGE_EXTENSIONS: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
}
const FALLBACK_IMAGE_TYPE = 'image/png'

const STYLESHEET = `body { line-height: 1.5; }
h1, h2, h3, h4 { line-height: 1.25; }
table { border-collapse: collapse; margin: 1em 0; }
th, td { border: 1px solid #888; padding: 0.25em 0.5em; text-align: left; vertical-align: top; }
pre, code, kbd, samp { font-family: monospace; }
pre { white-space: pre-wrap; overflow-wrap: break-word; padding: 0.5em; border: 1px solid #ccc; }
blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid #888; }
img { max-width: 100%; height: auto; }
nav ol { list-style: none; }
`

const CONTAINER_DOCUMENT = `${XML_DECLARATION}<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="${PACKAGE_DIRECTORY}/${PACKAGE_FILE}" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&apos;',
}

function escapeXml(text: string) {
  return text.replace(/[&<>"']/g, character => XML_ESCAPES[character])
}

interface BookImage {
  /** The path from the content document, which is also the path in the manifest. */
  path: string
  mediaType: string
  data: Uint8Array<ArrayBuffer>
}

interface NavEntry {
  id: string
  text: string
  children: NavEntry[]
}

function collapseWhitespace(text: string) {
  return text.replace(WHITESPACE_RUN, ' ').trim()
}

/** The fragment of a link that points into this page, or null for a link that leaves it. */
function pageFragment(href: string) {
  if (href.startsWith('#'))
    return href.length > 1 ? href : null
  try {
    const url = new URL(href, location.href)
    return url.origin === location.origin && url.pathname === location.pathname && url.hash
      ? url.hash
      : null
  }
  catch (error) {
    if (error instanceof TypeError)
      return null
    throw error
  }
}

function removeComments(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT)
  const comments: Node[] = []
  while (walker.nextNode())
    comments.push(walker.currentNode)
  comments.forEach(comment => comment.parentNode?.removeChild(comment))
}

function removeInvalidCharacters(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    node.data = node.data.replace(INVALID_XML_CHARACTERS, '')
  }
}

function unwrap(element: Element) {
  element.replaceWith(...element.childNodes)
}

function cleanAttributes(root: Element) {
  for (const element of root.querySelectorAll('*')) {
    const isSvg = element.namespaceURI === SVG_NAMESPACE
    for (const { name } of [...element.attributes]) {
      const kept = isSvg ? !REMOVED_SVG_ATTRIBUTE_PATTERN.test(name) : KEPT_ATTRIBUTES.has(name)
      if (!kept)
        element.removeAttribute(name)
    }
  }
}

/**
 * A copy of the article with only what a book can hold: no interactive
 * parts, no links out of the page, headings and code as plain text.
 */
function cleanArticle(article: HTMLElement) {
  const content = article.cloneNode(true) as HTMLElement

  removeComments(content)
  content.querySelectorAll(REMOVED_SELECTOR).forEach(element => element.remove())

  // A heading is one span per letter, see scripts/slant-headings.ts.
  for (const heading of content.querySelectorAll(HEADING_SELECTOR))
    heading.textContent = collapseWhitespace(heading.textContent ?? '')

  for (const pre of content.querySelectorAll('pre')) {
    const code = document.createElement('code')
    code.textContent = (pre.querySelector('code') ?? pre).textContent
    pre.replaceChildren(code)
  }

  for (const picture of content.querySelectorAll('picture')) {
    const image = picture.querySelector('img')
    if (image)
      picture.replaceWith(image)
    else
      picture.remove()
  }

  const ids = new Set([...content.querySelectorAll('[id]')].map(element => element.id))
  for (const link of content.querySelectorAll('a')) {
    const fragment = pageFragment(link.getAttribute('href') ?? '')
    if (fragment && ids.has(decodeURIComponent(fragment.slice(1))))
      link.setAttribute('href', fragment)
    else
      unwrap(link)
  }

  removeInvalidCharacters(content)
  cleanAttributes(content)
  return content
}

async function redrawAsPng(blob: Blob) {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
  bitmap.close()
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(
    png => png ? resolve(png) : reject(new DOMException('The image cannot be encoded as PNG', 'EncodingError')),
    FALLBACK_IMAGE_TYPE,
  ))
}

/** The image at the URL in a type that every EPUB reader shows, or null if it cannot be fetched. */
async function fetchImage(url: string, name: string): Promise<BookImage | null> {
  try {
    const response = await fetch(url)
    if (!response.ok)
      return null
    let blob = await response.blob()
    let mediaType = blob.type.split(';')[0].trim()
    if (!(mediaType in CORE_IMAGE_EXTENSIONS)) {
      blob = await redrawAsPng(blob)
      mediaType = FALLBACK_IMAGE_TYPE
    }
    return {
      path: `${IMAGE_DIRECTORY}/${name}.${CORE_IMAGE_EXTENSIONS[mediaType]}`,
      mediaType,
      data: new Uint8Array(await blob.arrayBuffer()),
    }
  }
  catch (error) {
    // A network failure is a TypeError, an image the browser cannot decode a DOMException.
    if (error instanceof TypeError || error instanceof DOMException)
      return null
    throw error
  }
}

/**
 * Points every image of this site at its copy in the book, and removes the
 * images of other sites and the ones that cannot be fetched.
 */
async function embedImages(content: HTMLElement) {
  const imagesByUrl = new Map<string, HTMLImageElement[]>()
  for (const image of content.querySelectorAll('img')) {
    const url = new URL(image.getAttribute('src') ?? '', location.href)
    if (url.origin !== location.origin) {
      image.remove()
      continue
    }
    imagesByUrl.set(url.href, [...imagesByUrl.get(url.href) ?? [], image])
  }

  const urls = [...imagesByUrl.keys()]
  const fetched = await Promise.all(urls.map((url, index) => fetchImage(url, `image-${index + 1}`)))

  const bookImages: BookImage[] = []
  urls.forEach((url, index) => {
    const bookImage = fetched[index]
    for (const image of imagesByUrl.get(url)!) {
      if (!bookImage) {
        image.remove()
        continue
      }
      image.setAttribute('src', bookImage.path)
      if (!image.hasAttribute('alt'))
        image.setAttribute('alt', '')
    }
    if (bookImage)
      bookImages.push(bookImage)
  })
  return bookImages
}

/** The h2 headings, each with the h3 headings that follow it. */
function collectNavEntries(content: HTMLElement) {
  const entries: NavEntry[] = []
  content.querySelectorAll(NAV_HEADING_SELECTOR).forEach((heading, index) => {
    heading.id ||= `section-${index + 1}`
    const entry: NavEntry = { id: heading.id, text: heading.textContent ?? '', children: [] }
    const parent = entries.at(-1)
    if (heading.tagName === NAV_SUBHEADING_TAG && parent)
      parent.children.push(entry)
    else
      entries.push(entry)
  })
  return entries
}

function createXhtmlDocument(title: string, language: Language) {
  const doctype = document.implementation.createDocumentType('html', '', '')
  const xhtml = document.implementation.createDocument(XHTML_NAMESPACE, 'html', doctype)
  const html = xhtml.documentElement
  html.setAttribute('lang', language)
  html.setAttributeNS(XML_NAMESPACE, 'xml:lang', language)

  const create = (tag: string, text?: string) => {
    const element = xhtml.createElementNS(XHTML_NAMESPACE, tag)
    if (text !== undefined)
      element.textContent = text
    return element
  }

  const head = create('head')
  const charset = create('meta')
  charset.setAttribute('charset', 'utf-8')
  const stylesheet = create('link')
  stylesheet.setAttribute('rel', 'stylesheet')
  stylesheet.setAttribute('type', 'text/css')
  stylesheet.setAttribute('href', STYLESHEET_FILE)
  head.append(charset, create('title', title), stylesheet)

  const body = create('body')
  html.append(head, body)
  return { xhtml, body, create }
}

function serializeXml(xml: Document) {
  return XML_DECLARATION + new XMLSerializer().serializeToString(xml)
}

function buildContentDocument(content: HTMLElement, page: EpubPage, author: string | undefined) {
  const { xhtml, body, create } = createXhtmlDocument(page.title, page.language)
  const title = create('h1', page.title)
  title.setAttribute('id', TITLE_ID)
  body.append(title)

  const byline = [author, page.date && formatDate(page.date, false, BYLINE_DATE, page.language)]
    .filter(Boolean)
    .join(', ')
  if (byline)
    body.append(create('p', byline))

  body.append(...xhtml.importNode(content, true).childNodes)
  return serializeXml(xhtml)
}

function buildNavDocument(entries: NavEntry[], page: EpubPage) {
  const { xhtml, body, create } = createXhtmlDocument(page.title, page.language)

  const buildList = (items: NavEntry[]) => {
    const list = create('ol')
    for (const item of items) {
      const listItem = create('li')
      const link = create('a', item.text)
      link.setAttribute('href', `${CONTENT_FILE}#${item.id}`)
      listItem.append(link)
      if (item.children.length)
        listItem.append(buildList(item.children))
      list.append(listItem)
    }
    return list
  }

  const nav = create('nav')
  nav.setAttributeNS(OPS_NAMESPACE, 'epub:type', 'toc')
  nav.setAttribute('id', 'toc')
  // A nav document needs one entry at least, and a page without headings has only its title.
  const listed = entries.length ? entries : [{ id: TITLE_ID, text: page.title, children: [] }]
  nav.append(create('h1', page.title), buildList(listed))
  body.append(nav)
  return serializeXml(xhtml)
}

/** A W3C date as dc:date and dcterms:modified take it: a calendar day, or a time in UTC to the second. */
function w3cDate(date: string | Date) {
  if (typeof date === 'string' && DATE_ONLY_PATTERN.test(date))
    return date
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().replace(MILLISECONDS_PATTERN, 'Z')
}

function buildPackageDocument(page: EpubPage, options: {
  identifier: string
  author: string | undefined
  modified: Date
  images: BookImage[]
  hasSvg: boolean
}) {
  const date = page.date && w3cDate(page.date)
  const metadata = [
    `<dc:identifier id="book-id">${escapeXml(options.identifier)}</dc:identifier>`,
    `<dc:title>${escapeXml(page.title)}</dc:title>`,
    `<dc:language>${page.language}</dc:language>`,
    options.author && `<dc:creator>${escapeXml(options.author)}</dc:creator>`,
    date && `<dc:date>${date}</dc:date>`,
    `<meta property="dcterms:modified">${w3cDate(options.modified)}</meta>`,
  ]
  const manifest = [
    `<item id="nav" href="${NAV_FILE}" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="content" href="${CONTENT_FILE}" media-type="application/xhtml+xml"${options.hasSvg ? ' properties="svg"' : ''}/>`,
    `<item id="style" href="${STYLESHEET_FILE}" media-type="text/css"/>`,
    ...options.images.map((image, index) =>
      `<item id="image-${index + 1}" href="${image.path}" media-type="${image.mediaType}"/>`),
  ]
  const indent = (lines: (string | false | undefined)[]) =>
    lines.filter(Boolean).map(line => `    ${line}`).join('\n')

  return `${XML_DECLARATION}<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id" xml:lang="${page.language}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
${indent(metadata)}
  </metadata>
  <manifest>
${indent(manifest)}
  </manifest>
  <spine>
    <itemref idref="content"/>
  </spine>
</package>
`
}

/** The EPUB file of a page, built from its rendered article. */
export async function createEpub(article: HTMLElement, page: EpubPage) {
  const content = cleanArticle(article)
  const images = await embedImages(content)
  const navEntries = collectNavEntries(content)
  const author = document.querySelector('meta[name="author"]')?.getAttribute('content') ?? undefined
  const modified = new Date()

  const encoder = new TextEncoder()
  const packageFile = (name: string) => `${PACKAGE_DIRECTORY}/${name}`
  const entries: ZipEntry[] = [
    // The mimetype has to be the first entry, stored as it is, for a reader to recognise the book.
    { name: 'mimetype', data: encoder.encode(EPUB_MEDIA_TYPE) },
    { name: 'META-INF/container.xml', data: encoder.encode(CONTAINER_DOCUMENT) },
    {
      name: packageFile(PACKAGE_FILE),
      data: encoder.encode(buildPackageDocument(page, {
        identifier: location.origin + location.pathname,
        author,
        modified,
        images,
        hasSvg: !!content.querySelector('svg'),
      })),
    },
    { name: packageFile(NAV_FILE), data: encoder.encode(buildNavDocument(navEntries, page)) },
    { name: packageFile(CONTENT_FILE), data: encoder.encode(buildContentDocument(content, page, author)) },
    { name: packageFile(STYLESHEET_FILE), data: encoder.encode(STYLESHEET) },
    ...images.map(image => ({ name: packageFile(image.path), data: image.data })),
  ]

  return new Blob([createZip(entries, modified)], { type: EPUB_MEDIA_TYPE })
}

function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_LIFETIME_MS)
}

export async function downloadEpub(article: HTMLElement, page: EpubPage) {
  saveFile(await createEpub(article, page), `${page.slug}.epub`)
}
