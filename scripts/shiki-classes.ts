import { getSingletonHighlighter } from 'shiki'
import type { ShikiTransformer } from 'shiki'

/**
 * Shiki's dual-theme output puts `style="--s-dark:#...;--s-light:#..."` on
 * every token. Vue cannot turn an element with a style object into a static
 * string, so each token becomes a createVNode call that is parsed and
 * hydrated one by one. This module replaces every such declaration with a
 * class whose rule sets the same custom property, and builds the stylesheet
 * for all classes a theme can produce. With only class attributes left, the
 * Vue compiler hoists whole code blocks as static HTML strings.
 */

export interface ShikiClasses {
  transformer: ShikiTransformer
  css: string
}

const FONT_STYLE_DECLARATIONS: Record<string, string[]> = {
  'font-style': ['italic'],
  'font-weight': ['bold'],
  'text-decoration': ['underline'],
}

function classNameFor(property: string, value: string) {
  return `${property.slice(2)}-${value.replace(/[^a-z0-9]/gi, '').toLowerCase()}`
}

function themeColours(theme: { settings?: Array<{ settings?: { foreground?: string } }>, fg: string, bg: string }) {
  const colours = new Set<string>([theme.fg, theme.bg])
  for (const entry of theme.settings ?? []) {
    if (entry.settings?.foreground)
      colours.add(entry.settings.foreground)
  }
  return [...colours].map(colour => colour.toLowerCase())
}

export async function buildShikiClasses(themes: Record<string, string>, cssVariablePrefix: string): Promise<ShikiClasses> {
  const highlighter = await getSingletonHighlighter({ themes: Object.values(themes), langs: [] })
  const rules = new Map<string, string>()

  for (const [themeKey, themeName] of Object.entries(themes)) {
    const theme = highlighter.getTheme(themeName)
    const colourProperty = `${cssVariablePrefix}${themeKey}`
    const backgroundProperty = `${cssVariablePrefix}${themeKey}-bg`
    for (const colour of themeColours(theme)) {
      rules.set(classNameFor(colourProperty, colour), `${colourProperty}:${colour}`)
      rules.set(classNameFor(backgroundProperty, colour), `${backgroundProperty}:${colour}`)
    }
    for (const [property, values] of Object.entries(FONT_STYLE_DECLARATIONS)) {
      const themedProperty = `${cssVariablePrefix}${themeKey}-${property}`
      for (const value of values)
        rules.set(classNameFor(themedProperty, value), `${themedProperty}:${value}`)
    }
  }

  const css = [...rules.entries()].map(([className, declaration]) => `.${className}{${declaration}}`).join('\n')

  function stylesToClasses(node: { properties: Record<string, unknown> }) {
    const style = node.properties.style
    if (typeof style !== 'string' || !style)
      return
    const keptDeclarations: string[] = []
    const classes: string[] = []
    for (const declaration of style.split(';')) {
      const [property, value] = declaration.split(':').map(part => part.trim())
      if (!property)
        continue
      const className = property.startsWith(cssVariablePrefix) ? classNameFor(property, value) : undefined
      if (className && rules.has(className))
        classes.push(className)
      else
        keptDeclarations.push(declaration)
    }
    if (!classes.length)
      return
    const existing = node.properties.class
    const existingClasses = Array.isArray(existing) ? existing : (typeof existing === 'string' ? [existing] : [])
    node.properties.class = [...existingClasses, ...classes].join(' ')
    if (keptDeclarations.length)
      node.properties.style = keptDeclarations.join(';')
    else
      delete node.properties.style
  }

  const transformer: ShikiTransformer = {
    name: 'shiki-classes',
    pre(node) {
      stylesToClasses(node)
    },
    span(node) {
      stylesToClasses(node)
    },
  }

  return { transformer, css }
}
