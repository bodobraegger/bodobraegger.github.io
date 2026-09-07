import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter: any
  }
}

declare module 'virtual:shiki-theme.css'
