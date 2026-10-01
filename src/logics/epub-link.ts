/** The query that asks a page for its book, as in /notes/page?epub. */
export const EPUB_QUERY = 'epub'

/** A link to the current page with the book query. */
export const EPUB_LINK = { query: { [EPUB_QUERY]: null } }

/** A page offers its book only when its frontmatter sets `epub: true`. */
export function offersEpub(frontmatter: Record<string, unknown> | undefined) {
  return frontmatter?.epub === true
}
