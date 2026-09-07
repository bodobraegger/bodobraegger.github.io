import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import fs from 'fs-extra'
import Pages from 'vite-plugin-pages'
import Inspect from 'vite-plugin-inspect'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import Markdown from 'unplugin-vue-markdown/vite'
import Vue from '@vitejs/plugin-vue'
import matter from 'gray-matter'
import AutoImport from 'unplugin-auto-import/vite'
import anchor from 'markdown-it-anchor'
import LinkAttributes from 'markdown-it-link-attributes'
import UnoCSS from 'unocss/vite'
import SVG from 'vite-svg-loader'
import Shiki from '@shikijs/markdown-it'
import { transformerRenderWhitespace } from '@shikijs/transformers'

// @ts-expect-error missing types
import TOC from 'markdown-it-table-of-contents'
import { imagetools } from 'vite-imagetools'
import { slugify } from './scripts/slugify'
import { responsiveImages } from './scripts/markdown-images'

// pnpm stores packages as node_modules/.pnpm/<name>@<version>/...
const VENDOR_CHUNK_PATTERN = /node_modules\/\.pnpm\/(?:vue@|vue-router@|vue-demi@|@vue\+|@vueuse\+)/

/** Opens the connection to the page view API early; the first request is sent once the page is idle. */
function preconnectSupabase(supabaseUrl: string | undefined): Plugin {
  return {
    name: 'preconnect-supabase',
    transformIndexHtml() {
      if (!supabaseUrl)
        return []
      return [{ tag: 'link', attrs: { rel: 'preconnect', href: new URL(supabaseUrl).origin, crossorigin: '' }, injectTo: 'head' }]
    },
  }
}

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: [
      { find: '~/', replacement: `${resolve(__dirname, 'src')}/` },
    ],
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@vueuse/core',
    ],
  },
  plugins: [
    UnoCSS(),

    preconnectSupabase(loadEnv(mode, __dirname, 'VITE_').VITE_SUPABASE_URL),

    Vue({
      include: [/\.vue$/, /\.md$/],
      template: {
        transformAssetUrls: {
          video: ['src', 'poster'],
          source: ['src'],
          img: ['src', 'data-full'],
          image: ['xlink:href', 'href'],
          use: ['xlink:href', 'href'],
        },
      },
    }),

    imagetools({
      include: /\.(?:avif|jpe?g|png|webp)\?(?:w|format|as)=/,
    }),

    Pages({
      extensions: ['vue', 'md'],
      dirs: 'pages',
      extendRoute(route) {
        const path = resolve(__dirname, route.component.slice(1))

        if (path.endsWith('.md')) {
          const md = fs.readFileSync(path, 'utf-8')
          const { data } = matter(md)
          route.meta = Object.assign(route.meta || {}, { frontmatter: data })
        }

        return route
      },
    }),

    Markdown({
      wrapperComponent: 'WrapperPost',
      wrapperClasses: (id, code) => code.includes('@layout-full-width')
        ? ''
        : 'prose m-auto',
      headEnabled: true,
      exportFrontmatter: false,
      exposeFrontmatter: false,
      exposeExcerpt: false,
      markdownItOptions: {
        quotes: '""\'\'',
      },
      async markdownItSetup(md) {
        md.use(await Shiki({
          themes: {
            dark: 'vitesse-dark',
            light: 'vitesse-light',
          },
          defaultColor: false,
          cssVariablePrefix: '--s-',
          transformers: [
            transformerRenderWhitespace(),
          ],
        }))

        md.use(responsiveImages)

        md.use(anchor, {
          slugify,
          permalink: anchor.permalink.linkInsideHeader({
            symbol: '#',
            renderAttrs: () => ({ 'aria-hidden': 'true' }),
          }),
        })

        md.use(LinkAttributes, {
          matcher: (link: string) => /^https?:\/\//.test(link),
          attrs: {
            target: '_blank',
            rel: 'noopener',
          },
        })

        md.use(TOC, {
          includeLevel: [1, 2, 3, 4],
          slugify,
          containerHeaderHtml: '<div class="table-of-contents-anchor"><div class="i-ri-menu-2-fill" /></div>',
        })

        // Wrap tables in a scrollable container
        const defaultTableOpen = md.renderer.rules.table_open || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
        md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
          return `<div class="table-wrapper">${defaultTableOpen(tokens, idx, options, env, self)}`
        }
        const defaultTableClose = md.renderer.rules.table_close || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
        md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
          return `${defaultTableClose(tokens, idx, options, env, self)}</div>`
        }
      },
      frontmatterPreprocess(frontmatter, options, id, defaults) {
        const head = defaults(frontmatter, options)
        return { head, frontmatter }
      },
    }),

    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
      ],
    }),

    Components({
      extensions: ['vue', 'md'],
      dts: true,
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      resolvers: [
        IconsResolver({
          componentPrefix: '',
        }),
      ],
    }),

    process.env.NODE_ENV !== 'production' && Inspect(),

    Icons({
      defaultClass: 'inline',
      defaultStyle: 'vertical-align: sub;',
    }),

    SVG({
      svgo: false,
      defaultImport: 'component',
    }),
  ],

  build: {
    rollupOptions: {
      onwarn(warning, next) {
        if (warning.code !== 'UNUSED_EXTERNAL_IMPORT')
          next(warning)
      },
      output: {
        // One long-lived chunk for the framework so content deploys do not
        // invalidate it in the browser cache
        manualChunks(id) {
          if (VENDOR_CHUNK_PATTERN.test(id))
            return 'vue-vendor'
        },
      },
    },
    target: 'es2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  ssgOptions: {
    formatting: 'minify',
    format: 'cjs',
  },
}))
