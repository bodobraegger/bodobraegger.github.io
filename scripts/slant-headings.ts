import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import { letterClasses } from '../src/logics/hand-set'

/**
 * Gives every letter of a heading its own place on each axis of ABC Areal, so
 * a heading leans, widens and weighs the way a hand-set line of type does.
 *
 * The split happens here rather than in the browser for two reasons. The page
 * arrives already leaning, with no reflow once a script runs, and each letter
 * carries a class instead of a style attribute, which is what lets the Vue
 * compiler keep the whole heading as one static string (see shiki-classes.ts).
 */

const SPACE_PATTERN = /(\s+)/

function handSetSpans(text: string, md: MarkdownIt, offset: number) {
  // A space is left outside the spans, so a heading still breaks between words.
  let position = offset

  return text
    .split(SPACE_PATTERN)
    .map((part) => {
      if (!part || SPACE_PATTERN.test(part)) {
        position += part.length
        return md.utils.escapeHtml(part)
      }
      return [...part]
        .map((letter) => {
          const className = letterClasses(text, position++)
          return `<span class="${className}">${md.utils.escapeHtml(letter)}</span>`
        })
        .join('')
    })
    .join('')
}

export function slantHeadings(md: MarkdownIt) {
  md.core.ruler.push('slant-headings', (state) => {
    let insideHeading = false

    for (const token of state.tokens) {
      // The title of a page is set in Bradford, which carries no axis at all,
      // so the treatment starts at the second level.
      if (token.type === 'heading_open')
        insideHeading = token.tag !== 'h1'
      else if (token.type === 'heading_close')
        insideHeading = false
      else if (insideHeading && token.type === 'inline')
        handSetInline(md, token)
    }
  })
}

/** Replaces the plain text of a heading with one span per letter. */
function handSetInline(md: MarkdownIt, inline: Token) {
  let offset = 0

  for (const child of inline.children ?? []) {
    if (child.type !== 'text' || !child.content)
      continue
    const html = handSetSpans(child.content, md, offset)
    offset += child.content.length
    child.type = 'html_inline'
    child.content = html
  }
}
