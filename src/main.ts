import '@unocss/reset/tailwind.css'
import './styles/fonts.css'
import './styles/main.css'
import './styles/prose.css'
import 'virtual:shiki-theme.css'

import 'uno.css'

import autoRoutes from 'pages-generated'
import { ViteSSG } from 'vite-ssg'
import { setupRouterScroller } from 'vue-router-better-scroller'
import App from './App.vue'
import { loadChatWidgetOnInteraction } from './lib/chat-widget'
import { whenIdle } from './logics/idle'

const routes = autoRoutes.map((i) => {
  return {
    ...i,
    alias: i.path.endsWith('/')
      ? `${i.path}index.html`
      : `${i.path}.html`,
  }
})

// @ts-ignore
routes.push({
  path: '/walter',
  redirect: '/der-wahre-walter/',
})

const SECTION_INDEX_PATHS = ['/projects', '/notes']
const INTENT_EVENTS = ['mouseover', 'touchstart', 'focusin'] as const

function prefersReducedData() {
  return Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData)
}

export const createApp = ViteSSG(
  App,
  {
    routes,
  },
  ({ router, isClient }) => {
    if (isClient) {
      const html = document.querySelector('html')!
      setupRouterScroller(router, {
        selectors: {
          html(ctx) {
            // only do the sliding transition when the scroll position is not 0
            if (ctx.savedPosition?.top)
              html.classList.add('no-sliding')
            return true
          },
        },
        behavior: 'auto',
      })

      router.afterEach((to) => {
        // reload the page once when navigating to /der-wahre-walter
        // to fix the issue with vue 404 showing
        if (to.redirectedFrom?.path.includes('/walter')) {
          document.location.reload()
          return
        }

        // The two section indexes are small and the likely next step from home
        if (to.path === '/' && !prefersReducedData())
          whenIdle(() => SECTION_INDEX_PATHS.forEach(prefetchRoute))
      })

      const prefetchedPaths = new Set<string>()

      // Runs the route's lazy import so the chunk is cached before the click.
      // Route components are import() thunks; objects with a .then are
      // already-loaded components and need nothing.
      function prefetchRoute(routePath: string) {
        if (prefetchedPaths.has(routePath))
          return
        prefetchedPaths.add(routePath)
        const component = router.resolve(routePath).matched[0]?.components?.default
        if (typeof component === 'function')
          void (component as () => Promise<unknown>)()
      }

      // Prefetch on intent: hover, touch or keyboard focus on an internal link
      // signals a navigation a few hundred milliseconds before the click
      function prefetchOnIntent(event: Event) {
        const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
        if (!link || link.target === '_blank')
          return
        const url = new URL(link.href, location.href)
        if (url.origin === location.origin)
          prefetchRoute(url.pathname)
      }

      for (const eventName of INTENT_EVENTS)
        document.addEventListener(eventName, prefetchOnIntent, { passive: true })

      // Add double-click to select code blocks
      document.addEventListener('dblclick', (e) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'CODE' || target.tagName === 'PRE') {
          const selection = window.getSelection()
          if (selection) {
            selection.selectAllChildren(target)
          }
        }
      })

      loadChatWidgetOnInteraction()
    }
  },
)
