import { buildHeaders, getSupabaseConfig } from '~/lib/page-views'
import { getSupabase } from '~/lib/supabase'

// Saves the ```checklist blocks that scripts/task-lists.ts renders: one row
// per page and block, holding the block's whole text. Everyone who opens the
// page sees and changes the same text. A save only lands on the version it
// was based on, so two open pages cannot write over each other's ticks.
const REST_CHECKLIST_BLOCKS_PATH = '/rest/v1/checklist_blocks'
// The list dash is optional: `- [ ] item` and `[ ] item` both get a box.
const BOX_PATTERN = /^(\s*- )?(\[[ x]\])/i
const SAVE_DELAY_MS = 800
const BLOCK_SAVED_EVENT = 'block_saved'
// The green of the Shiki themes (vitesse keywords), from the colour classes
// that scripts/shiki-classes.ts writes for every colour of the themes.
const TICKED_LINE_CLASS = 's-dark-4d9375 s-light-1e754f'

interface ChecklistRow {
  block_index: number
  body: string
  version: number
}

export class ChecklistError extends Error {
  constructor(action: string, status: number) {
    super(`checklist ${action} failed with HTTP ${status}`)
  }
}

/** The row changed since this page read it; the page must reload it. */
export class ChecklistConflict extends Error {}

function requireConfig() {
  const config = getSupabaseConfig()
  if (!config)
    throw new ChecklistError('setup', 0)
  return config
}

async function loadChecklistBlocks(pagePath: string): Promise<Map<number, ChecklistRow>> {
  const config = requireConfig()
  const query = `select=block_index,body,version&page_path=eq.${encodeURIComponent(pagePath)}`
  const response = await fetch(`${config.url}${REST_CHECKLIST_BLOCKS_PATH}?${query}`, { headers: buildHeaders(config) })
  if (!response.ok)
    throw new ChecklistError('load', response.status)

  const rows: ChecklistRow[] = await response.json()
  return new Map(rows.map(row => [row.block_index, row]))
}

/** Writes the text over the given version and returns the new version. */
async function saveChecklistBlock(pagePath: string, blockIndex: number, body: string, version: number): Promise<number> {
  const config = requireConfig()
  const headers = { ...buildHeaders(config), Prefer: 'return=representation' }
  const nextVersion = version + 1

  const response = version === 0
    ? await fetch(`${config.url}${REST_CHECKLIST_BLOCKS_PATH}`, {
      body: JSON.stringify({ block_index: blockIndex, body, page_path: pagePath, version: nextVersion }),
      headers,
      method: 'POST',
    })
    : await fetch(`${config.url}${REST_CHECKLIST_BLOCKS_PATH}?page_path=eq.${encodeURIComponent(pagePath)}&block_index=eq.${blockIndex}&version=eq.${version}`, {
      body: JSON.stringify({ body, version: nextVersion }),
      headers,
      method: 'PATCH',
    })

  // A first save that finds a row, or a later save that matches none, means
  // someone else saved in between.
  if (response.status === 409)
    throw new ChecklistConflict()
  if (!response.ok)
    throw new ChecklistError('save', response.status)
  const rows: ChecklistRow[] = await response.json()
  if (!rows.length)
    throw new ChecklistConflict()
  return nextVersion
}

/**
 * Marks the spaces at the start and end of a line, which VS Code draws as
 * dots; prose.css draws them the same way. The spaces between words stay plain.
 */
function withMarkedWhitespace(text: string): Node[] {
  const middle = text.trim()
  const leading = middle ? text.slice(0, text.length - text.trimStart().length) : text
  const trailing = middle ? text.slice(text.trimEnd().length) : ''
  return [leading, middle, trailing].flatMap((part, partIndex) => {
    if (!part)
      return []
    if (partIndex === 1)
      return [document.createTextNode(part)]
    const whitespace = document.createElement('span')
    whitespace.dataset.whitespace = ''
    whitespace.textContent = part
    return [whitespace]
  })
}

/**
 * Shows the text, with each line-start [ ] or [x] as a box that a tap ticks.
 * The dash keeps the class Shiki gave it when the page was built, so the block
 * stays coloured as Markdown after every redraw. A ticked line is green from
 * the dash to its end.
 */
function renderBlock(code: HTMLElement, body: string, dashClass: string) {
  code.replaceChildren(...body.split('\n').flatMap((line, lineIndex) => {
    const nodes: Node[] = lineIndex ? [document.createTextNode('\n')] : []
    const match = line.match(BOX_PATTERN)
    if (!match)
      return [...nodes, ...withMarkedWhitespace(line)]

    const [prefix, dash = '', box] = match
    const ticked = box[1] !== ' '
    const lineElement = document.createElement('span')
    if (ticked)
      lineElement.className = TICKED_LINE_CLASS
    if (dash) {
      const [indent, marker, space] = dash.match(/^(\s*)(-)( )$/)!.slice(1)
      const dashElement = document.createElement('span')
      dashElement.className = ticked ? TICKED_LINE_CLASS : dashClass
      dashElement.textContent = marker
      lineElement.append(...withMarkedWhitespace(indent), dashElement, space)
    }
    const boxElement = document.createElement('span')
    boxElement.dataset.box = String(lineIndex)
    boxElement.contentEditable = 'false'
    boxElement.textContent = box
    // The item text keeps its own first space plain: it separates the box
    // from the words, as the space after the dash does.
    const rest = line.slice(prefix.length)
    const separator = rest.match(/^ /)?.[0] ?? ''
    lineElement.append(boxElement, separator, ...withMarkedWhitespace(rest.slice(separator.length)))
    return [...nodes, lineElement]
  }))
}

interface ConnectedBlock {
  /** Shows a row that another page saved, unless this page has newer text. */
  apply: (row: ChecklistRow) => void
  disconnect: () => void
}

function connectBlock(pagePath: string, pre: HTMLElement, saved: ChecklistRow | undefined, announce: (row: ChecklistRow) => void): ConnectedBlock {
  const code = pre.querySelector('code') ?? pre
  const blockIndex = Number(pre.dataset.checklist)
  let body = saved?.body ?? code.textContent!.replace(/\n$/, '')
  let version = saved?.version ?? 0
  let savedBody = saved?.body
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let saving: Promise<void> = Promise.resolve()
  // Set when a newer row arrives while someone types here; see apply.
  let missedUpdate = false
  const dashClass = [...code.querySelectorAll('.line > span')].find(span => span.textContent === '-')?.className ?? ''

  function show(row: ChecklistRow) {
    ({ body, version } = row)
    savedBody = body
    renderBlock(code, body, dashClass)
  }

  async function reload() {
    const row = (await loadChecklistBlocks(pagePath)).get(blockIndex)
    if (row)
      show(row)
  }

  // Saves run one after another, so each one builds on the version before.
  // A failed save keeps the typed text; the next edit or blur tries again.
  function save() {
    clearTimeout(saveTimer)
    const text = body
    saving = saving.then(async () => {
      if (text === savedBody)
        return
      try {
        version = await saveChecklistBlock(pagePath, blockIndex, text, version)
        savedBody = text
        announce({ block_index: blockIndex, body: text, version })
      }
      catch (error) {
        if (error instanceof ChecklistConflict)
          await reload()
        else
          console.error(error)
      }
    })
  }

  renderBlock(code, body, dashClass)
  code.contentEditable = 'plaintext-only'
  code.spellcheck = false

  // pointerdown, not click: the box ticks without moving the caret into the
  // text, so a phone does not open its keyboard.
  code.addEventListener('pointerdown', (event) => {
    const box = (event.target as HTMLElement).closest<HTMLElement>('[data-box]')
    if (!box)
      return
    event.preventDefault()
    const lines = body.split('\n')
    const lineIndex = Number(box.dataset.box)
    const line = lines[lineIndex]
    const start = line.indexOf('[')
    lines[lineIndex] = line.slice(0, start) + (line[start + 1] === ' ' ? '[x]' : '[ ]') + line.slice(start + 3)
    body = lines.join('\n')
    renderBlock(code, body, dashClass)
    save()
  })

  code.addEventListener('input', () => {
    body = code.textContent!
    clearTimeout(saveTimer)
    saveTimer = setTimeout(save, SAVE_DELAY_MS)
  })

  // Boxes typed as text become boxes once the writing stops.
  // The browser keeps a line break after the last line for the caret.
  code.addEventListener('blur', () => {
    body = body.replace(/\n+$/, '')
    // Typed text saves and, when another page saved meanwhile, conflicts and
    // reloads; untouched text simply catches up.
    if (missedUpdate && body === savedBody)
      reload().catch(console.error)
    missedUpdate = false
    save()
    renderBlock(code, body, dashClass)
  })

  const onVisible = () => {
    if (document.visibilityState === 'visible' && document.activeElement !== code)
      reload().catch(console.error)
  }
  document.addEventListener('visibilitychange', onVisible)

  return {
    apply(row) {
      if (row.version <= version)
        return
      // Redrawing under the caret would lose what is being typed.
      if (document.activeElement === code)
        missedUpdate = true
      else
        show(row)
    },
    disconnect: () => document.removeEventListener('visibilitychange', onVisible),
  }
}

/**
 * Loads the saved text of the page's checklists, makes them editable, and
 * keeps them live: each save is broadcast to the other open pages over
 * Supabase Realtime, as DrawablePen does for strokes. Returns the cleanup.
 */
export async function connectChecklist(pagePath: string, root: HTMLElement): Promise<() => void> {
  const blocks = [...root.querySelectorAll<HTMLElement>('pre[data-checklist]')]
  if (!blocks.length)
    return () => {}

  const [saved, supabase] = await Promise.all([loadChecklistBlocks(pagePath), getSupabase()])
  const channel = supabase?.channel(`checklist:${pagePath}`, { config: { broadcast: { self: false } } })
  const announce = (row: ChecklistRow) => channel?.send({ type: 'broadcast', event: BLOCK_SAVED_EVENT, payload: row })

  const connected = new Map(blocks.map((pre) => {
    const blockIndex = Number(pre.dataset.checklist)
    return [blockIndex, connectBlock(pagePath, pre, saved.get(blockIndex), announce)]
  }))

  channel
    ?.on('broadcast', { event: BLOCK_SAVED_EVENT }, ({ payload }) => connected.get(payload.block_index)?.apply(payload))
    .subscribe()

  return () => {
    connected.forEach(block => block.disconnect())
    if (channel)
      supabase!.removeChannel(channel)
  }
}
