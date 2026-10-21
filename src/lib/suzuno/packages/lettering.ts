// Loads the Google Fonts stylesheets of the lettering of the packages.
import { useHead } from '@unhead/vue'
import type { InjectionKey, Ref } from 'vue'
import { computed, inject } from 'vue'

/**
 * The characters that a face shows. A face of bbo.do provides them, so that
 * the Google Fonts stylesheets of its parts load only these glyphs.
 */
export const FACE_GLYPHS: InjectionKey<Ref<string>> = Symbol('face glyphs')

/** Loads stylesheets, once for each address on a page, with only the glyphs of the face when the face gives them. */
export function useStylesheets(...hrefs: string[]) {
  const glyphs = inject(FACE_GLYPHS, undefined)
  const links = computed(() => [...new Set(hrefs)].map((stylesheet) => {
    const href = glyphs?.value ? `${stylesheet}&text=${encodeURIComponent(glyphs.value)}` : stylesheet
    return { key: href, rel: 'stylesheet', href }
  }))
  useHead({ link: links })
}

/** Loads the stylesheets of fonts. */
export function useWebFonts(...fonts: { stylesheet: string }[]) {
  useStylesheets(...fonts.map(font => font.stylesheet))
}
