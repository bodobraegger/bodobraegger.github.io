<script setup lang='ts'>
import { useScriptTag } from '@vueuse/core'
import { useHead } from '@unhead/vue'
import { formatDate } from '~/logics'
import { LANGUAGE_DEFINITIONS, findTranslations, resolveLanguage } from '~/logics/languages'
import { usePageViews } from '~/composables/usePageViews'
import { shareOneScreen } from '~/logics/screen-share'

const { frontmatter } = defineProps<{
  frontmatter: Record<string, any>
}>()

const router = useRouter()
const route = useRoute()
const content = ref<HTMLDivElement>()
const fontsLoaded = ref(false)

// View tracking
const { viewCount, trackView } = usePageViews(route.path)

const showViews = frontmatter.showViews ?? true

const ORNAMENT_UNIT = '⋅.˳˳.⋅ॱ˙˙ॱ'
const ORNAMENT_END = 'ᐧ.˳˳.✶'
const ORNAMENT_REPEAT = 40
const ornamentFiller = ORNAMENT_UNIT.repeat(ORNAMENT_REPEAT) + ORNAMENT_END

const language = resolveLanguage(frontmatter.lang, route.path)
const translations = findTranslations(router.getRoutes(), route.path)

useHead({
  htmlAttrs: { lang: language },
})

onMounted(() => {
  // Track view on mount
  trackView()

  document.fonts.ready.then(() => fontsLoaded.value = true)

  // Scroll to the hash target; nav link highlighting lives in NavBar
  const navigate = () => {
    if (!location.hash)
      return true

    const el = document.querySelector(decodeURIComponent(location.hash))
    if (!el)
      return false

    const rect = el.getBoundingClientRect()
    const y = window.scrollY + rect.top - 40
    window.scrollTo({
      top: y,
      behavior: 'smooth',
    })
    return true
  }

  const handleAnchors = (
    event: MouseEvent & { target: HTMLElement },
  ) => {
    const link = event.target.closest('a')

    if (
      !event.defaultPrevented
      && link
      && event.button === 0
      && link.target !== '_blank'
      && link.rel !== 'external'
      && !link.download
      && !event.metaKey
      && !event.ctrlKey
      && !event.shiftKey
      && !event.altKey
    ) {
      const url = new URL(link.href)
      if (url.origin !== window.location.origin)
        return

      event.preventDefault()
      const { pathname, hash } = url
      if (hash && (!pathname || pathname === location.pathname)) {
        window.history.replaceState({}, '', hash)
        navigate()
      }
      else {
        router.push({ path: pathname, hash })
      }
    }
  }

  useEventListener(window, 'hashchange', navigate)
  useEventListener(content.value!, 'click', handleAnchors, { passive: false })

  setTimeout(() => {
    if (!navigate())
      setTimeout(navigate, 1000)
  }, 1)
})

// `a` is hydra's audio object: a.fft, a.show(), a.setBins(), a.onBeat.
const AUDIO_PATTERN = /\ba\.(?:fft|show|hide|setBins|setSmooth|setCutoff|setScale|onBeat)\b/

// hyper-hydra adds the array operators a sketch uses beside the fast, smooth
// and ease that hydra-synth already provides. zfill is one of them. It used to
// be served from glitch.me, which answers 410 since the free hosting closed, so
// the old tag threw on every page that holds a sketch.
const HYDRA_ARRAYS_URL = 'https://cdn.jsdelivr.net/gh/geikha/hyper-hydra@main/hydra-arrays.js'

const LOAD_SCRIPT_PATTERN = /loadScript\(\s*["'`]([^"'`]+)["'`]\s*\)/g
const loadedScripts = new Map<string, Promise<void>>()

function loadScriptOnce(src: string) {
  if (!loadedScripts.has(src)) {
    loadedScripts.set(src, new Promise<void>((resolve, reject) => {
      const el = document.createElement('script')
      el.src = src
      el.async = true
      el.addEventListener('load', () => resolve())
      el.addEventListener('error', () => reject(new Error(`could not load ${src}`)))
      document.head.appendChild(el)
    }))
  }
  return loadedScripts.get(src)!
}

/**
 * A sketch that pulls in an extra shader library calls loadScript, which
 * returns a promise. The line after it runs at once and reaches for a function
 * the library has not defined yet. Loading those up front removes the race.
 */
function loadSketchScripts(source: string) {
  const urls = [...source.matchAll(LOAD_SCRIPT_PATTERN)].map(match => match[1])
  return Promise.all(urls.map(loadScriptOnce)).catch(() => [])
}

// One screen choice serves every hydra instance on the page, so this is set up
// for the code blocks and for the background alike. A reader who refuses the
// screen gets the first picture of the page in its place, which keeps the
// sketch fed with something that belongs to what they are reading.
if (frontmatter.hydra || frontmatter.hydraBackground) {
  let stopSharingScreen: (() => void) | null = null
  onMounted(() => {
    const firstImage = content.value?.querySelector('img')
    stopSharingScreen = shareOneScreen(firstImage?.currentSrc || firstImage?.src)
  })
  onUnmounted(() => stopSharingScreen?.())
}

if (frontmatter.hydra) {
  useScriptTag(HYDRA_ARRAYS_URL, () => {}, { async: true })

  const hydraObservers: IntersectionObserver[] = []
  const hydraListeners: [Element, string, EventListener][] = []

  onUnmounted(() => {
    hydraObservers.forEach(observer => observer.disconnect())
    hydraListeners.forEach(([el, event, listener]) => el.removeEventListener(event, listener))
  })

  useScriptTag('https://unpkg.com/hydra-synth', () => {
    console.log('hydra-synth loaded')
    const hydraCanvas = document.createElement('canvas')
    const width = 512
    const height = width
    hydraCanvas.width = width
    hydraCanvas.height = height
    hydraCanvas.id = 'hydraCanvas'
    hydraCanvas.classList.add('rounded-md')

    // @ts-ignore - hydra global
    let hydra = new Hydra({
      canvas: hydraCanvas,
      detectAudio: false,
      enableStreamCapture: false,
      width,
      height,
    })

    const codeBlocks = document.querySelectorAll('pre:has(.language-javascript)')

    // A sketch reads the room through the audio object `a`, which hydra only
    // builds when detectAudio is on. Reading the page once tells us whether any
    // sketch here needs it, so a page without one never asks for a microphone.
    const pageNeedsAudio = [...codeBlocks].some(preEl => AUDIO_PATTERN.test(preEl.textContent!))

    // Scrolling a block into view starts it, and so does clicking it. Both
    // arrive together when the reader clicks a block that has just come into
    // view, which started the sketch twice and asked for the screen twice. One
    // sketch runs at a time on the one canvas, so the block that holds it is
    // the whole state needed to tell a restart from a repeat.
    let runningBlock: Element | null = null

    codeBlocks.forEach((preEl) => {
      // const parentEl = preEl.parentElement
      preEl.classList.add('grid', 'grid-cols-1', 'grid-rows-1', 'relative', 'aspect-square', 'children:rounded-md')
      const codeEl = preEl.firstChild as HTMLElement
      codeEl.classList.add('row-start-1', 'col-start-1', 'z-1', 'hover:cursor-pointer')

      const placeholder = document.createElement('div')
      placeholder.classList.add('hydracontainer', 'row-start-1', 'col-start-1', 'z-0', 'sticky', 'top-0')
      preEl.insertAdjacentElement('beforeend', placeholder)

      const linkEl = document.createElement('a')
      linkEl.href = `https://hydra.ojack.xyz/?code=${btoa(encodeURIComponent(codeEl.textContent!))}`
      linkEl.target = '_blank'
      linkEl.textContent = 'open in hydra'
      linkEl.classList.add('artwork-link', 'z-2', 'text-right', 'color-white!', 'rounded-tl-0', 'rounded-tr-0')
      preEl.children[1].insertAdjacentElement('afterend', linkEl)

      const handleFocus = () => {
        if (runningBlock === preEl)
          return
        runningBlock = preEl

        // Calculate square size based on container
        const containerRect = placeholder.getBoundingClientRect()
        const size = containerRect.width;
        (preEl.children[0] as HTMLElement).style.height = `${size}px`

        // Update canvas dimensions
        hydraCanvas.width = size
        hydraCanvas.height = size

        // The canvas goes in first. With detectAudio on, hydra hangs its
        // frequency display on canvas.parentNode, and a canvas that is still
        // detached has none, so building the synth first throws there.
        placeholder.appendChild(hydraCanvas)

        // @ts-ignore - hydra global, Reinitialize hydra with new size
        hydra = new Hydra({
          canvas: hydraCanvas,
          detectAudio: pageNeedsAudio,
          enableStreamCapture: false,
          width: size,
          height: size,
        })

        // @ts-ignore - hydra global
        hush()
        void loadSketchScripts(codeEl.textContent!).then(() => {
          setTimeout(() => {
            // Indirect eval runs the sketch in global, non-strict scope. A direct eval
            // would inherit this module's strict mode, where a Hydra sketch that opens
            // with a bare assignment such as `bpm = 120` throws instead of running.
            const runSketch = eval
            runSketch(codeEl.textContent!)
          }, 20)
        })
        // make text semi transparent
        codeEl.classList.add('op-80')
        // add black background
        placeholder.classList.add('bg-black!')
      }
      const handleFocusOut = () => {
        codeEl.classList.remove('op-80')
        placeholder.classList.remove('bg-black!')
      }
      preEl.addEventListener('focus', handleFocus)
      preEl.addEventListener('focusout', handleFocusOut)
      hydraListeners.push([preEl, 'focus', handleFocus], [preEl, 'focusout', handleFocusOut])

      // A sketch that captures the screen has to start from a real click. The
      // event below is synthetic, it carries no user activation, and the
      // browser rejects getDisplayMedia without one. Starting such a sketch
      // here would only spend its first run on a rejection. A sketch that
      // listens to the room waits for the same click, so the microphone is
      // asked for at the moment the reader starts it, not while scrolling by.
      const needsUserGesture = codeEl.textContent!.includes('initScreen')
        || AUDIO_PATTERN.test(codeEl.textContent!)

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting === true) {
          if (!needsUserGesture)
            preEl.dispatchEvent(new Event('focus'))
        }
        else {
          preEl.dispatchEvent(new Event('focusout'))
        }
      }, { threshold: [1], rootMargin: '0% 100% 0% 100%' })
      observer.observe(preEl)
      hydraObservers.push(observer)
    })
  }, { async: true, defer: true })
}
</script>

<template>
  <!-- Both backgrounds sit at the same depth as the page background, so the
       order here decides which draws on top. Plum is a few faint lines on a
       clear canvas, so it goes last and reads over the hydra wash. -->
  <ClientOnly v-if="frontmatter.hydraBackground">
    <HydraBackground />
  </ClientOnly>
  <ClientOnly v-if="frontmatter.plum">
    <Plum />
  </ClientOnly>
  <!-- The home page opens with its own hero, which already carries the name,
       so the title block is left to every other page. -->
  <div
    v-if="(frontmatter.display ?? frontmatter.title) && route.path !== '/'"
    class="prose m-auto mb-8"
  >
    <h1 class="font-serif font-normal mb-0">
      {{ frontmatter.display ?? frontmatter.title }}
      <span
        v-if="frontmatter.phonetic"
        class="opacity-30 font-phonetics"
        :style="{ visibility: fontsLoaded ? 'visible' : 'hidden' }"
      >({{ frontmatter.phonetic }})
      </span>
    </h1>
    <p
      v-if="frontmatter.date || frontmatter.place || translations.length"
      class="!-mt-6 font-serif-extra font-italic flex flex-wrap gap-x-2 items-baseline"
    >
      <span v-if="frontmatter.date" class="op50">
        ✹ {{ formatDate(frontmatter.date, false, undefined, language) }}<span v-if="frontmatter.duration"> · {{ frontmatter.duration }}</span>
      </span>
      <span v-if="frontmatter.place">
        <span class="op50">✬ </span>
        <span class="op-75 font-light">
          <a class="font-serif-extra!" :href="`https://www.google.com/maps/search/${frontmatter.place}`" target="_blank" rel="noopener noreferrer">{{ frontmatter.place }}</a>
        </span>
      </span>
      <span v-if="translations.length" class="text-sm">
        <template v-for="translation in translations" :key="translation.lang">
          <span class="op50">✧ {{ LANGUAGE_DEFINITIONS[translation.lang].readIn }} </span>
          <RouterLink class="font-almendra!" :to="translation.path" :lang="translation.lang" :hreflang="translation.lang">
            {{ LANGUAGE_DEFINITIONS[translation.lang].name }}
          </RouterLink>
        </template>
      </span>
      <span
        v-if="showViews"
        class="flex-1 flex justify-end items-baseline gap-x-2 tabular-nums transition-opacity duration-500"
        :class="viewCount === null ? 'op0' : 'op50'"
      >
        <span class="relative flex-1 min-w-0 self-stretch overflow-hidden" aria-hidden="true">
          <span class="absolute right-0 bottom-0 ws-nowrap">{{ ornamentFiller }}</span>
        </span>
        <span class="flex-none">{{ (viewCount ?? 0).toString().padStart(3, '0') }} view(s)</span>
      </span>
    </p>
    <p
      v-if="frontmatter.draft"
      bg-orange-4:10 text-orange-4 border="l-3 orange-4" px4 py2
    >
      This is a draft, the content may be incomplete. Please check back later.
    </p>
  </div>
  <article ref="content">
    <slot />
  </article>
  <div v-if="route.path !== '/'" class="prose m-auto mt-8 mb-8 animate-delay-500 print:hidden font-mono op50">
    <br>
    <span>> </span>
    <RouterLink
      :to="route.path.split('/').slice(0, -1).join('/') || '/'"
      v-text="'cd ..'"
    />
  </div>
</template>
