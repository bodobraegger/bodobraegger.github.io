import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter: any
  }
}

declare module 'virtual:shiki-theme.css'

/** ISO date of the commit the site was built from, set in vite.config.ts. */
declare const __LAST_UPDATE__: string
