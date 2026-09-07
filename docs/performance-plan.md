# Performance plan for bbo.do

Goal: page view speed above everything else. Build speed is not a goal.

All numbers in this document come from the local `dist` build of 2026-09-05
and from the live site headers on 2026-09-07. Estimates are marked as
estimates.

## 1. Baseline

### 1.1 Bytes on every page

| Asset                                                 | Raw    | Gzip   |
| ----------------------------------------------------- | ------ | ------ |
| `app-*.js` (entry, Supabase, dayjs)                   | 299 KB | 78 KB  |
| `vue-vendor-*.js` (Vue, router, vueuse, floating-vue) | 178 KB | 64 KB  |
| `app-*.css`                                           | 44 KB  | 9.6 KB |
| `vue-vendor-*.css` (floating-vue)                     | 4.3 KB | 1.5 KB |
| 6 preloaded woff2 fonts                               | 481 KB | 481 KB |

The browser downloads about 142 KB of gzip JavaScript before it can hydrate
the home page. The home page HTML is 5.9 KB.

### 1.2 Bytes on content pages

| Page                                   | HTML   | Route chunk raw | Route chunk gzip |
| -------------------------------------- | ------ | --------------- | ---------------- |
| `notes/2025-04-26_livecoding_examples` | 205 KB | 233 KB          | 6.8 KB           |
| `notes/misc/agents`                    | 96 KB  | 104 KB          | 5.4 KB           |
| `notes/2024-02-27_livecoding_docs`     | 84 KB  | 92 KB           | (similar)        |

The route chunk contains one `createVNode` call per Shiki token. The
livecoding page creates thousands of vnodes and 739 whitespace spans at
hydration. The compressed size is small, but the parse and hydration cost is
paid on the main thread.

### 1.3 Images

The project screenshots are PNG files between 0.2 MB and 1.7 MB. The build
copies them as they are. No image has `width`, `height`, `loading="lazy"`,
`srcset`, or an AVIF or WebP variant. The `compress` script exists but no
hook runs it. `public/images/maxi` (9.9 MB) and `public/uploads` (2.2 MB)
are not referenced by any page and are deployed on every push.

### 1.4 Delivery

| Item                             | Observed                                  |
| -------------------------------- | ----------------------------------------- |
| CDN                              | Cloudflare in front of GitHub Pages       |
| Compression                      | Brotli, HTTP/3                            |
| `cache-control` on HTML          | `max-age=600`                             |
| `cache-control` on hashed assets | `max-age=14400` (4 hours, not immutable)  |
| Third-party scripts              | Chatango on `load` on every page          |
| Route chunk preload              | Present (`modulepreload` per page). Good. |

Hashed assets expire after 4 hours. A returning visitor downloads the fonts
and the JavaScript again the next day.

### 1.5 Rendering

| Item                                           | Cost                                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `html { filter: contrast(110%) }`              | Filter pass over the full viewport on every frame. Also makes `html` the containing block for all `position: fixed` elements.              |
| `backdrop-filter: blur` on the sticky header   | Blur recomputed on every scroll frame.                                                                                                     |
| `backdrop-filter: blur` on the footer          | The footer is in flow. The blur only covers the page gradient. No visible effect.                                                          |
| Plum canvas (`useRafFn` at 40 fps)             | Runs on the home, notes, projects and every project page while the page hydrates.                                                          |
| List pages hidden until `document.fonts.ready` | Text stays at opacity 0 until all preloaded fonts arrive. This delays LCP.                                                                 |
| `slide-enter` stagger                          | Each list item fades in 60 ms after the previous one.                                                                                      |

### 1.6 Data requests

`usePageViews` opens Supabase per component. The projects page sends about
25 requests and the notes page about 20 requests at mount, one per item.
Every article page sends one RPC at mount. The full `@supabase/supabase-js`
client (auth, realtime, storage, functions, 200 KB minified) is in the entry
chunk because `WrapperPost` imports it.

### 1.7 Dead weight

| Item                                                                                          | Effect                                              |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `floating-vue` registered, never used                                                         | ~10 KB gzip JS, 80 CSS rules, one extra CSS request |
| `dayjs` plus `pt-br` locale; `ListProjects` already uses `Intl`                               | ~4 KB gzip, two date systems                        |
| 8 `ModernGothic` `@font-face` rules; `font-sans` is never used                                | Dead CSS                                            |
| Fonts not in `fonts.css` (`Black`, `Book`, `ExtraBold`, `ModernGothicMono`, `ReformGrotesk`) | 600 KB in the repo, not deployed                    |
| `X-UA-Compatible` and `revisit-after` meta tags                                               | Ignored by browsers                                 |
| `Footer :key="route.path"`                                                                    | Footer remounts on every navigation                 |
| `--webkit-mask-image` in `Plum.vue`                                                           | Typo, should be `-webkit-mask-image`                |

## 2. Priorities

The table orders the work by expected effect on page view speed.

| Rank | Change                                                        | Expected effect (estimate)                                                | Effort |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------------------------- | ------ |
| 1    | Immutable cache for `/assets/*` at Cloudflare                 | Repeat visits skip 1 MB of downloads                                      | 15 min |
| 2    | Replace `supabase-js` with `fetch` for view counts            | Entry JS from 78 KB to about 25 KB gzip                                   | 3 h    |
| 3    | Subset fonts, preload only 2 faces                            | 481 KB to about 120 KB before first paint                                 | 2 h    |
| 4    | Image pipeline (resize, AVIF, lazy, dimensions)               | Project pages from 1.7 MB to about 150 KB                                 | 3 h    |
| 5    | Shiki classes instead of inline styles, drop whitespace spans | Code pages: HTML halves, hydration becomes one static node                | 2 h    |
| 6    | Remove `html` filter and header backdrop blur                 | Smooth scroll on mobile                                                   | 1 h    |
| 7    | Stop hiding lists until fonts load                            | LCP on list pages moves to first paint                                    | 15 min |
| 8    | Batch view count requests                                     | 25 requests to 1 on list pages                                            | 1 h    |
| 9    | Remove `floating-vue`, `dayjs`                                | About 14 KB gzip                                                          | 1 h    |
| 10   | Chatango on first interaction                                 | No third-party work at load                                               | 30 min |
| 11   | Plum after idle, respect reduced motion                       | Main thread free during hydration                                         | 30 min |
| 12   | Prefetch routes on intent                                     | No 600 KB bulk download on `/notes`                                       | 1 h    |

## 3. Phase 1: Delivery

No application code changes. Do this first.

### 3.1 Cache rule at Cloudflare

Add a Cache Rule: URI path starts with `/assets/` then Edge TTL 1 year,
Browser TTL 1 year, and cache everything. Vite hashes every file under
`/assets/`, so a stale file is impossible. Keep the HTML at `max-age=600`.

Check with:

```sh
curl -sI https://bbo.do/assets/<any hashed file> | grep -i cache
```

Expect `cache-control: max-age=31536000` and `cf-cache-status: HIT` on the
second request.

### 3.2 Fonts

1. Subset every deployed face with `pyftsubset` to Latin, Latin-1 and
   Latin Extended-A. The current files carry 480 to 660 code points and only
   about 330 are Latin. Keep `kern`, `liga`, `calt` and the `ss` features in
   use. Write the subset step into `scripts/convert-fonts.py` so a new font
   goes through it. Estimate: 35 to 45 percent smaller files.
2. Preload only the faces that paint above the fold on every page:
   `BradfordLL-Regular` (body) and `BradfordMonoLL-Regular` (nav, h1). The
   fallbacks are metric matched, so the other faces can swap in without a
   layout shift. Remove the four other `<link rel="preload">` tags.
3. Delete the eight `ModernGothic` `@font-face` rules and the `--fonts-sans`
   stack. Nothing uses `font-sans`.
4. Delete the `Ogg` faces that no rule uses. `font-serif-extra` appears five
   times, always italic, at weights 300 and 400. Check `prose.css` for any
   other use before you delete.
5. Move the unused font files out of `src/assets/fonts` or delete them.

### 3.3 Images

1. Add a `markdown-it` image rule in `vite.config.ts` that reads the image
   size with `sharp` at build time and emits `width`, `height`,
   `loading="lazy"` and `decoding="async"`. Fixed dimensions remove layout
   shift. Lazy loading keeps the flyer off the critical path.
2. Add `vite-imagetools` and rewrite the same rule to emit
   `<img srcset>` with AVIF at 640, 1024 and 1440 pixels. Fall back to the
   original when the source is external.
3. Run the existing compress script with `convert2avif` over
   `src/assets/images/projects`, and rename the `Screenshot From ...` files
   to slugs without spaces.
4. Add the compress script to `lint-staged` for `*.{png,jpg,jpeg}` so a
   large image never lands in a commit.
5. Delete `public/images/maxi` and `public/uploads`, or move them to a
   branch. They are 12 MB per deploy and no page links to them.
6. `sharp` is pinned to `0.32.6` and CI runs Node 26. Upgrade `sharp`
   before you rely on it in CI.

### 3.4 Chatango

Keep the widget, but load it on the first `pointerdown`, `keydown` or
`scroll` event, with a `requestIdleCallback` fallback after 10 seconds. Move
the loader out of `index.html` into a small module so it is minified with
the app. Remove the `style.width` and `style.height` assignments on the
script element. They have no effect on a script tag.

## 4. Phase 2: JavaScript

### 4.1 Remove `floating-vue`

Delete the `app.use(FloatingVue)` call, the CSS import in `main.ts`, the
`.v-popper` overrides in `main.css` and the dependency. No component uses a
tooltip directive.

### 4.2 Replace `supabase-js` for page views

Write `src/lib/page-views.ts` with two functions that call PostgREST with
`fetch`:

```text
POST {VITE_SUPABASE_URL}/rest/v1/rpc/increment_page_view   body {"path": ...}
GET  {VITE_SUPABASE_URL}/rest/v1/page_views?select=page_path,view_count&page_path=in.(...)
```

Send `apikey`, `Authorization: Bearer <anon key>` and `x-user-id`. Use
`keepalive: true` on the RPC so navigation does not cancel it. Move
`getUserId` into this file.

Keep `@supabase/supabase-js` only for `DrawablePen.vue` and
`StrokeAdmin.vue`, which use realtime channels. Load it with a dynamic
`import()` inside the component when `cloudStorage` is true, so the client
lands in a separate chunk that only pen pages download.

Add `<link rel="preconnect" href="https://<project>.supabase.co">` to
`index.html`. Read the host from `VITE_SUPABASE_URL` at build time with a
small `transformIndexHtml` hook.

### 4.3 Shiki output

The dual theme writes `style="--s-dark:#...;--s-light:#..."` on every token.
Vue cannot stringify an element with a `style` object, so it emits one
`createVNode` per token and hydrates each one.

1. Write a Shiki transformer that maps every distinct colour pair to a
   class name (`t0`, `t1`, ...) and collects the pairs. Emit one stylesheet
   with `.t0 { --s-dark: ...; --s-light: ... }` rules. The Vitesse palette
   has about 20 colours, so the stylesheet is tiny.
2. With only `class` attributes left, the Vue compiler hoists each
   `<pre>` block into a single `createStaticVNode` string. Hydration then
   skips the whole block in one step.
3. Remove `transformerRenderWhitespace`. It adds a `<span class="space">`
   per space character and no style targets those spans. If you need
   visible whitespace, use `position: 'boundary'` so only leading whitespace
   gets a span.

Estimate for the livecoding page: HTML from 205 KB to about 90 KB, route
chunk from 233 KB to about 60 KB raw, and hydration of the article body from
thousands of vnodes to about 40.

### 4.4 Do not hide lists until fonts load

Remove the `fontsLoaded` gate in `ListPosts.vue` and `ListProjects.vue`. The
fallback fonts are metric matched, so the swap does not move text. The gate
makes the largest text on the page invisible until every preloaded font has
arrived, which is the LCP element on those pages. Keep the gate only for the
phonetic span in `WrapperPost.vue`, which uses a Google font with no
fallback metrics.

### 4.5 Prefetch on intent

`preloadRoutes` on `/notes` imports every note chunk at idle. That is about
20 requests and 600 KB raw. Replace it with prefetch on intent:

1. On `mouseenter` or `touchstart` of a `RouterLink`, or when the link
   enters the viewport, insert `<link rel="prefetch" href="/assets/<chunk>">`
   for that route. Resolve the chunk file from the route component import
   with `router.resolve` as the current code does, but do not execute it.
2. Keep the home page idle preload of `/projects` and `/notes`. Those two
   chunks are small.

### 4.6 Replace `dayjs` with `Intl`

`ListProjects.vue` already formats years with `Intl.DateTimeFormat`. Move
`formatDate` in `logics/index.ts` to `Intl` with the `pt-BR` and `en`
locales, and delete `dayjs` and the locale import. Check the Portuguese
output (`7 de set.`) against the current `D [de] MMM` format and decide if
the abbreviation dot is acceptable.

### 4.7 Build settings

1. Set `build.target: 'es2022'`. The default target keeps helpers for
   syntax every current browser supports.
2. Rewrite `manualChunks` to match package names exactly. The current
   `id.includes('vue')` test puts `@vueuse`, `@unhead/vue` and `floating-vue`
   into the vendor chunk and the `@vueuse` branch never runs. Keep one vendor
   chunk for `vue`, `vue-router` and `@vueuse/core` so content deploys do not
   invalidate it.
3. Keep `terser`. It produces a smaller bundle than `esbuild` and build time
   does not matter here.
4. Delete `ssgOptions.includedRoutes`. No route path contains `draft` or
   `temp`, so the filter never removes anything.

## 5. Phase 3: Rendering

### 5.1 Remove the root filter

Delete `filter: contrast(110%) brightness(100%)` from `html` in `main.css`.
Bake the contrast into the colour tokens instead: darken `--fg` and
`--fg-deep` a step in light mode, and lighten them in dark mode. The filter
forces a full-viewport filter pass on every frame and changes the containing
block of every `position: fixed` element on the site.

### 5.2 Backdrop blur

Replace `backdrop-blur-sm` on the header with a solid background that uses
`var(--c-bg)` under the existing mask gradient. Remove `backdrop-blur-sm`
from the footer. Keep the blur on the lightbox, which is not on the scroll
path.

### 5.3 Plum

1. Start the animation from `requestIdleCallback`, not from `onMounted`.
2. Skip it when `prefers-reduced-motion: reduce` matches.
3. Pause the `useRafFn` loop on `visibilitychange` when the tab is hidden.
4. Fix `--webkit-mask-image` to `-webkit-mask-image`.

### 5.4 Stagger

No change. The `slide-enter` delay is negative
(`--enter-initial - stage * step`), so later items start further into the
one second fade rather than later. Nothing waits on the stagger, and the
first item is visible on the next frame.

## 6. Phase 4: Data requests

1. Give `page-views.ts` one module level cache: `getCounts(paths[])` sends
   one request with `page_path=in.(...)` and resolves each item from the
   shared result. `ListPosts` and `ListProjects` call it once with all
   paths, and the items read from the result.
2. Delay `trackView` to `requestIdleCallback` so the RPC does not compete
   with hydration.
3. Send the RPC with `keepalive: true`.

## 7. Cleanup

These changes do not change speed. Do them in the same pass because they
touch the same files.

1. Remove `X-UA-Compatible` and `revisit-after` from `index.html`.
2. Remove `:key="route.path"` from `<Footer>` in `App.vue`.
3. Upgrade `vue-router` from the pinned `4.2.5` to the current 4.x release.
4. Delete `.DS_Store` from `src/assets/fonts`.

## 8. Measurement

Do this before phase 1 and after each phase.

1. Run PageSpeed Insights on `/`, `/projects`, `/notes` and
   `/notes/2025-04-26_livecoding_examples`. Record LCP, TBT, CLS and total
   transfer size for mobile in `docs/performance-log.md`.
2. Add a `pnpm perf` script that builds, serves `dist` with `vite preview`
   and runs Lighthouse through Playwright's bundled Chromium. Chrome is not
   installed on this machine, so Playwright is the shortest path.
3. Add a size check to CI: fail the build when `app-*.js` exceeds 40 KB
   gzip or any image in `dist/assets` exceeds 300 KB. A small script over
   `dist/assets` with `gzip -9` is enough.

## 9. Results after implementation (2026-09-07)

Measured from the local `dist` build on branch `worktree-perf-plan`.

| Measure                                     | Before   | After    |
| ------------------------------------------- | -------- | -------- |
| JavaScript gzip on every page (entry + vendor) | 142 KB | 72 KB    |
| Entry chunk gzip                            | 78 KB    | 30 KB    |
| Fonts preloaded before first paint          | 481 KB   | 60 KB    |
| Font files served                           | 27       | 11       |
| Largest code page HTML                      | 205 KB   | 166 KB   |
| Largest code page vnodes hydrated per token | thousands | 0 (one static string per block) |
| Largest screenshot at the 660px column width | 2.1 MB PNG | 47 KB AVIF |
| Requests for view counts on the projects page | 25     | 1        |
| Supabase client in the entry chunk          | yes      | no, on demand for the pen |

Not implemented, needs the Cloudflare dashboard: the immutable cache rule
for `/assets/*` (section 3.1). Not implemented: the Lighthouse script
(section 8, item 2). Not deleted: `public/images/maxi` and
`public/uploads`. No page links to them, but the URLs may be linked from
outside the site, so that is the owner's decision.

## 10. Considered and not recommended now

1. Migration to an islands framework such as Astro. After phases 1 to 3 the
   entry JavaScript is about 90 KB gzip, almost all Vue runtime and router.
   Only islands remove that. The pen, lightbox, category filters and theme
   toggle would each become an island. This is a rewrite. Measure after
   phase 3 and decide then.
2. A service worker. The Cloudflare cache rule gives the same repeat visit
   benefit without a stale content risk.
3. Inlining critical CSS. The CSS is 9.6 KB gzip in one file on the same
   origin over HTTP/3. Inlining would save one round trip and cost cache
   reuse across pages.
