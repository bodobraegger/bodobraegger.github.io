import type { Language } from '~/logics/languages'
import { resolveLanguage } from '~/logics/languages'

/** The language of the page that renders the calling component. */
export function usePageLanguage(): Language {
  const route = useRoute()
  return resolveLanguage(route.meta.frontmatter?.lang, route.path)
}
