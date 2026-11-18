import type MarkdownIt from 'markdown-it'

const CHECKLIST_LANGUAGE = 'checklist'

/**
 * Renders a ```checklist fence as a plain code block that carries its place
 * among the checklists of the page. src/lib/checklist.ts saves the block's
 * text under that place, so the ticks and edits survive a reload.
 */
export function taskLists(md: MarkdownIt) {
  const renderFence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, index, options, env, self) => {
    const token = tokens[index]
    if (token.info.trim() !== CHECKLIST_LANGUAGE)
      return renderFence(tokens, index, options, env, self)

    const checklistIndex = tokens.slice(0, index).filter(other => other.type === 'fence' && other.info.trim() === CHECKLIST_LANGUAGE).length
    token.info = 'md'
    const html = renderFence(tokens, index, options, env, self)
    token.info = CHECKLIST_LANGUAGE
    return html.replace('<pre', `<pre data-checklist="${checklistIndex}"`)
  }
}
