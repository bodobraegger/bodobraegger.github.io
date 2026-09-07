export const LANGUAGES = ['en', 'pt'] as const
export type Language = typeof LANGUAGES[number]
export const DEFAULT_LANGUAGE: Language = 'en'

interface LanguageDefinition {
  name: string
  readIn: string
  locale: string
}

export const LANGUAGE_DEFINITIONS: Record<Language, LanguageDefinition> = {
  en: {
    name: 'English',
    readIn: 'read in',
    locale: 'en-US',
  },
  pt: {
    name: 'Português',
    readIn: 'ler em',
    locale: 'pt-BR',
  },
}

export interface Translation {
  lang: Language
  path: string
}

interface RouteLike {
  path: string
  aliasOf?: unknown
  meta?: { frontmatter?: Record<string, any> }
}

const languageSuffixPattern = new RegExp(`\\.(${LANGUAGES.join('|')})$`)

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}

/**
 * A translated page is a sibling file with a language suffix:
 * `foo.md` (default language) and `foo.pt.md` share the base path `foo`.
 */
export function splitLanguageSuffix(path: string): { basePath: string, lang?: Language } {
  const match = path.match(languageSuffixPattern)
  if (!match)
    return { basePath: path }
  return { basePath: path.slice(0, -match[0].length), lang: match[1] as Language }
}

export function resolveLanguage(frontmatterLang: unknown, path: string): Language {
  if (isLanguage(frontmatterLang))
    return frontmatterLang
  return splitLanguageSuffix(path).lang ?? DEFAULT_LANGUAGE
}

function routeLanguage(route: RouteLike): Language {
  return resolveLanguage(route.meta?.frontmatter?.lang, route.path)
}

/**
 * Returns the other language versions of the page at `path`, derived from
 * sibling routes with the same base path. `override` is the optional
 * frontmatter `translations` map (language code to path) for exceptions.
 */
export function findTranslations(routes: RouteLike[], path: string, override?: Record<string, string>): Translation[] {
  const { basePath } = splitLanguageSuffix(path)
  const currentLanguage = resolveLanguage(undefined, path)
  const byLanguage = new Map<Language, string>()

  for (const route of routes) {
    if (route.aliasOf || route.path === path)
      continue
    if (splitLanguageSuffix(route.path).basePath === basePath)
      byLanguage.set(routeLanguage(route), route.path)
  }

  for (const [lang, translationPath] of Object.entries(override ?? {})) {
    if (isLanguage(lang))
      byLanguage.set(lang, translationPath)
  }

  byLanguage.delete(currentLanguage)

  return LANGUAGES
    .filter(lang => byLanguage.has(lang))
    .map(lang => ({ lang, path: byLanguage.get(lang)! }))
}

/**
 * Collapses translated pages into one entry per base path. The entry in the
 * default language wins.
 */
export function groupTranslations<T extends { path: string, lang?: Language }>(items: T[]): T[] {
  const groups = new Map<string, T[]>()

  for (const item of items) {
    const { basePath } = splitLanguageSuffix(item.path)
    const group = groups.get(basePath)
    if (group)
      group.push(item)
    else
      groups.set(basePath, [item])
  }

  return [...groups.values()].map(group =>
    group.find(item => (item.lang ?? DEFAULT_LANGUAGE) === DEFAULT_LANGUAGE) ?? group[0],
  )
}
