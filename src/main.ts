import '@unocss/reset/tailwind.css'
import 'floating-vue/dist/style.css'
import 'markdown-it-github-alerts/styles/github-colors-light.css'
import 'markdown-it-github-alerts/styles/github-colors-dark-class.css'
import 'markdown-it-github-alerts/styles/github-base.css'
import 'shikiji-twoslash/style-rich.css'
import './styles/fonts.css'
import './styles/main.css'
import './styles/prose.css'
import './styles/markdown.css'

import 'uno.css'

import autoRoutes from 'pages-generated'
// import NProgress from 'nprogress'
import { ViteSSG } from 'vite-ssg'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat.js'
import { setupRouterScroller } from 'vue-router-better-scroller'
import FloatingVue from 'floating-vue'
import App from './App.vue'

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

export const createApp = ViteSSG(
  App,
  {
    routes,
  },
  ({ router, app, isClient }) => {
    dayjs.extend(LocalizedFormat)

    app.use(FloatingVue)

    if (isClient) {
      const html = document.querySelector('html')!
      setupRouterScroller(router, {
        selectors: {
          html(ctx) {
            // Check if user has visited before
            const hasVisited = sessionStorage.getItem('visited-notes')

            // only do the sliding transition when the scroll position is not 0
            if (ctx.savedPosition?.top || hasVisited)
              html.classList.add('no-sliding')
            else
              html.classList.remove('no-sliding')
            return true
          },
        },
        behavior: 'auto',
      })

      // Preload routes when navigating to home
      router.afterEach((to) => {
        if (to.path === '/') {
          // Wait until the browser is idle before preloading
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              preloadRoutes(['/projects', '/notes'])
            })
          }
          else {
            // Fallback for browsers that don't support requestIdleCallback
            setTimeout(() => {
              preloadRoutes(['/projects', '/notes'])
            }, 1000)
          }
        }
        if (to.path === '/notes') {
          sessionStorage.setItem('visited-notes', new Date().toISOString())
          // preload all notes
          const notePaths = routes
            .filter(i => i.path.startsWith('/notes/') && !i.path.includes('://') && !i.path.includes('.html'))
            .map(i => i.path)
          preloadRoutes(notePaths)
        }
      })

      // Helper function to preload routes
      function preloadRoutes(paths: string[]) {
        paths.forEach(async (routePath) => {
          const resolved = router.resolve(routePath)
          const component = resolved.matched[0]?.components?.default

          if (component && typeof component === 'function') {
            await component()
          }

          console.log(`Preloaded route: ${routePath}`)
        })
      }

      // router.beforeEach(() => {
      // NProgress.start()
      // })
      router.afterEach((to, from) => {
        // reload the page once when navigating to /der-wahre-walter
        // to fix the issue with vue 404 showing
        if (to.redirectedFrom?.path.includes('/walter')) {
          console.log(`going to der-wahre-walter from ${to.redirectedFrom?.path}! reloading`)
          document.location.reload()
        }
        // NProgress.done()
      })
    }
  },
)
