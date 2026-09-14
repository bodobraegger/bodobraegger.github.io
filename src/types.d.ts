import type { Language } from '~/logics/languages'

export interface Post {
  path: string
  title: string
  place?: string
  date: string
  lang?: Language
  duration?: string
  recording?: string
  redirect?: string
}
