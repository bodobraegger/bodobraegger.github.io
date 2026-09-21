import { DEFAULT_LANGUAGE, LANGUAGE_DEFINITIONS } from './languages'
import type { Language } from './languages'

const isDark = useDark()

export function toggleDark() {
  isDark.value = !isDark.value
}

/**
 * The slide-in animation plays only on the first visit of a list page in a
 * session. Each list page passes its own key.
 */
export function disableSlidingIfVisited(key: string) {
  if (sessionStorage.getItem(key))
    document.documentElement.classList.add('no-sliding')
  else
    sessionStorage.setItem(key, new Date().toISOString())
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const SHORT_DATE: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
const LONG_DATE: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }

const formatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`
  let formatter = formatterCache.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    formatterCache.set(key, formatter)
  }
  return formatter
}

/**
 * Formats a date in the language's locale. A date-only string such as
 * `2026-07-19` is a calendar day, not an instant, so it is rendered in UTC to
 * keep the same day in every timezone. Abbreviated month names lose their
 * trailing period (`set.` becomes `set`) to match the previous output.
 */
export function formatDate(d: string | Date, onlyDate = true, options?: Intl.DateTimeFormatOptions, lang: Language = DEFAULT_LANGUAGE) {
  const { locale } = LANGUAGE_DEFINITIONS[lang]
  const date = new Date(d)
  if (Number.isNaN(date.getTime()))
    return String(d)
  const isDateOnly = typeof d === 'string' && DATE_ONLY_PATTERN.test(d)
  // A caller that names a zone means it. Otherwise a calendar day is read in
  // UTC, so it falls on the same day in every timezone.
  const timeZone = options?.timeZone ?? (isDateOnly ? 'UTC' : undefined)

  let resolved = options
  if (!resolved) {
    const sameYear = date.getUTCFullYear() === new Date().getFullYear()
    resolved = (onlyDate || sameYear) ? SHORT_DATE : LONG_DATE
  }

  return getFormatter(locale, { ...resolved, timeZone })
    .formatToParts(date)
    .map(part => part.type === 'month' ? part.value.replace(/\.$/, '') : part.value)
    .join('')
}
