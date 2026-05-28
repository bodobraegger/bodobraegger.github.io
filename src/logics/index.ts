import dayjs from 'dayjs'

export const isDark = useDark()
export const englishOnly = useStorage('bodobraegger-english-only', false)

/**
 * Credit to [@hooray](https://github.com/hooray)
 * @see https://github.com/vuejs/vitepress/pull/2347
 */
export function toggleDark(event: MouseEvent) {
  isDark.value = !isDark.value
}

export function formatDate(d: string | Date, onlyDate = true, format?: string) {
  const date = dayjs(d)
  if (format)
    return date.format(format)
  if (onlyDate || date.year() === dayjs().year())
    return date.format('MMM D')
  return date.format('MMM D, YYYY')
}
