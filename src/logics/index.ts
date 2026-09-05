import dayjs from 'dayjs'
import { DEFAULT_LANGUAGE, LANGUAGE_DEFINITIONS } from './languages'
import type { Language } from './languages'

export const isDark = useDark()

export function toggleDark() {
  isDark.value = !isDark.value
}

export function formatDate(d: string | Date, onlyDate = true, format?: string, lang: Language = DEFAULT_LANGUAGE) {
  const definition = LANGUAGE_DEFINITIONS[lang]
  const date = dayjs(d).locale(definition.dayjsLocale)
  if (format)
    return date.format(format)
  if (onlyDate || date.year() === dayjs().year())
    return date.format(definition.dateFormatShort)
  return date.format(definition.dateFormatLong)
}
