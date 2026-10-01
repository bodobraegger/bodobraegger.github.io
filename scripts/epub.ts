import { readFile, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { LANGUAGE_DEFINITIONS } from '../src/logics/languages'
import type { Language } from '../src/logics/languages'
import { createZip } from './zip'
import type { ZipEntry } from './zip'

/**
 * Builds an EPUB 3 book from the rendered article of a page, at build time.
 * The book is one content document, a navigation document built from the h2
 * and h3 headings, a small stylesheet and the images of the page that come
 * from this site. It is written next to the page, as <route>.epub, so a
 * reader that runs no script can fetch it.
 */

export interface EpubPage {
  title: string
  language: Language
  date?: string | Date
  /** The absolute URL of the page. Relative links in the page are resolved against it. */
  url: string
  /** The time of the last change. The commit date keeps a rebuild byte for byte the same. */
  modified: Date
}

const EPUB_MEDIA_TYPE = 'application/epub+zip'
const EPUB_EXTENSION = '.epub'
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

const ARTICLE_SELECTOR = 'article'
const AUTHOR_SELECTOR = 'meta[name="author"]'

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

/** The image types of the EPUB 3 core media types, by file extension. Any other image is left out. */
const IMAGE_MEDIA_TYPES: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

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
  data: Uint8Array
}

interface NavEntry {
  id: string
  text: string
  children: NavEntry[]
}

function collapseWhitespace(text: string) {
  return text.replace(WHITESPACE_RUN, ' ').trim()
}

/** Link schemes a reader can open from a book. */
const BOOK_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

/**
 * Where a link points in the book: a fragment for a heading in this page, an
 * absolute URL for any other page, or null for a link the book cannot follow.
 */
function bookHref(href: string, ids: Set<string>, pageUrl: URL) {
  let url: URL
  let fragmentId: string
  try {
    url = new URL(href, pageUrl)
    fragmentId = decodeURIComponent(url.hash.slice(1))
  }
  catch {
    return null
  }
  if (url.origin === pageUrl.origin && url.pathname === pageUrl.pathname)
    return url.hash && ids.has(fragmentId) ? url.hash : null
  return BOOK_LINK_PROTOCOLS.has(url.protocol) ? url.href : null
}

function removeComments(root: Element) {
  const { NodeFilter } = root.ownerDocument.defaultView!
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_COMMENT)
  const comments: Node[] = []
  while (walker.nextNode())
    comments.push(walker.currentNode)
  comments.forEach(comment => comment.parentNode?.removeChild(comment))
}

function removeInvalidCharacters(root: Element) {
  const { NodeFilter } = root.ownerDocument.defaultView!
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT)
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
 * parts, links that leave the page as absolute URLs, headings and code as
 * plain text.
 */
function cleanArticle(article: HTMLElement, pageUrl: URL) {
  const document = article.ownerDocument
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
    const href = bookHref(link.getAttribute('href') ?? '', ids, pageUrl)
    if (href)
      link.setAttribute('href', href)
    else
      unwrap(link)
  }

  removeInvalidCharacters(content)
  cleanAttributes(content)
  return content
}

/** The built file of an image of this site, or null if the book cannot hold it. */
async function readImage(url: URL, distDir: string, name: string): Promise<BookImage | null> {
  const extension = extname(url.pathname).toLowerCase()
  const mediaType = IMAGE_MEDIA_TYPES[extension]
  if (!mediaType)
    return null
  try {
    return {
      path: `${IMAGE_DIRECTORY}/${name}${extension}`,
      mediaType,
      data: await readFile(join(distDir, decodeURIComponent(url.pathname))),
    }
  }
  catch (error) {
    if ((error as { code?: string }).code === 'ENOENT')
      return null
    throw error
  }
}

/**
 * Points every image of this site at its copy in the book, and removes the
 * images of other sites and the ones the book cannot hold.
 */
async function embedImages(content: HTMLElement, pageUrl: URL, distDir: string) {
  const imagesByUrl = new Map<string, HTMLImageElement[]>()
  for (const image of content.querySelectorAll('img')) {
    const url = new URL(image.getAttribute('src') ?? '', pageUrl)
    if (url.origin !== pageUrl.origin) {
      image.remove()
      continue
    }
    imagesByUrl.set(url.href, [...imagesByUrl.get(url.href) ?? [], image])
  }

  const urls = [...imagesByUrl.keys()]
  const read = await Promise.all(urls.map((url, index) => readImage(new URL(url), distDir, `image-${index + 1}`)))

  const bookImages: BookImage[] = []
  urls.forEach((url, index) => {
    const bookImage = read[index]
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

function createXhtmlDocument(document: Document, title: string, language: Language) {
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
  const { XMLSerializer } = document.defaultView!
  const serialize = () => XML_DECLARATION + new XMLSerializer().serializeToString(xhtml)
  return { xhtml, body, create, serialize }
}

/** The date of a page in the language of the page. A calendar day is read in UTC, so it stays the same day everywhere. */
function formatBylineDate(date: string | Date, language: Language) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime()))
    return String(date)
  const isDateOnly = typeof date === 'string' && DATE_ONLY_PATTERN.test(date)
  const { locale } = LANGUAGE_DEFINITIONS[language]
  return new Intl.DateTimeFormat(locale, { ...BYLINE_DATE, timeZone: isDateOnly ? 'UTC' : undefined }).format(parsed)
}

function buildContentDocument(content: HTMLElement, page: EpubPage, author: string | undefined) {
  const { xhtml, body, create, serialize } = createXhtmlDocument(content.ownerDocument, page.title, page.language)
  const title = create('h1', page.title)
  title.setAttribute('id', TITLE_ID)
  body.append(title)

  const byline = [author, page.date && formatBylineDate(page.date, page.language)]
    .filter(Boolean)
    .join(', ')
  if (byline)
    body.append(create('p', byline))

  body.append(...xhtml.importNode(content, true).childNodes)
  return serialize()
}

function buildNavDocument(document: Document, entries: NavEntry[], page: EpubPage) {
  const { body, create, serialize } = createXhtmlDocument(document, page.title, page.language)

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
  return serialize()
}

/** A W3C date as dc:date and dcterms:modified take it: a calendar day, or a time in UTC to the second. */
function w3cDate(date: string | Date) {
  if (typeof date === 'string' && DATE_ONLY_PATTERN.test(date))
    return date
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().replace(MILLISECONDS_PATTERN, 'Z')
}

function buildPackageDocument(page: EpubPage, options: {
  author: string | undefined
  modified: Date
  images: BookImage[]
  hasSvg: boolean
}) {
  const date = page.date && w3cDate(page.date)
  const metadata = [
    `<dc:identifier id="book-id">${escapeXml(page.url)}</dc:identifier>`,
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

/** The EPUB file of a page, built from its rendered HTML and the built files in distDir. */
export async function createEpub(html: string, page: EpubPage, distDir: string) {
  // jsdom is loaded here and not at the top, so a dev server start does not pay for it.
  const { JSDOM } = await import('jsdom')
  const { document } = new JSDOM(html).window
  const article = document.querySelector<HTMLElement>(ARTICLE_SELECTOR)
  if (!article)
    throw new Error(`The page ${page.url} has no ${ARTICLE_SELECTOR} element`)

  const pageUrl = new URL(page.url)
  const content = cleanArticle(article, pageUrl)
  const images = await embedImages(content, pageUrl, distDir)
  const navEntries = collectNavEntries(content)
  const author = document.querySelector(AUTHOR_SELECTOR)?.getAttribute('content') ?? undefined

  const encoder = new TextEncoder()
  const packageFile = (name: string) => `${PACKAGE_DIRECTORY}/${name}`
  const entries: ZipEntry[] = [
    // The mimetype has to be the first entry, stored as it is, for a reader to recognise the book.
    { name: 'mimetype', data: encoder.encode(EPUB_MEDIA_TYPE) },
    { name: 'META-INF/container.xml', data: encoder.encode(CONTAINER_DOCUMENT) },
    {
      name: packageFile(PACKAGE_FILE),
      data: encoder.encode(buildPackageDocument(page, {
        author,
        modified: page.modified,
        images,
        hasSvg: !!content.querySelector('svg'),
      })),
    },
    { name: packageFile(NAV_FILE), data: encoder.encode(buildNavDocument(document, navEntries, page)) },
    { name: packageFile(CONTENT_FILE), data: encoder.encode(buildContentDocument(content, page, author)) },
    { name: packageFile(STYLESHEET_FILE), data: encoder.encode(STYLESHEET) },
    ...images.map(image => ({ name: packageFile(image.path), data: image.data })),
  ]

  return createZip(entries, page.modified)
}

/** Writes the book of a page as <route>.epub into distDir, and returns that path. */
export async function writeEpub(html: string, page: EpubPage, distDir: string) {
  const file = join(distDir, `${new URL(page.url).pathname}${EPUB_EXTENSION}`)
  await writeFile(file, await createEpub(html, page, distDir))
  return file
}
