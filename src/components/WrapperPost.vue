<script setup lang='ts'>
import { useScriptTag } from '@vueuse/core'
import { formatDate } from '~/logics'
import { usePageViews } from '~/composables/usePageViews'

const { frontmatter } = defineProps<{
  frontmatter: Record<string, any>
}>()

const router = useRouter()
const route = useRoute()
const content = ref<HTMLDivElement>()
const fontsLoaded = ref(false)

// View tracking
const { viewCount, trackView } = usePageViews(route.path)

const isTrackedPage = computed(() => frontmatter.showViews)

onMounted(() => {
  // Track view on mount
  trackView()

  // Check if font is already loaded or wait for it
  if (document.fonts) {
    document.fonts.ready.then(() => {
      fontsLoaded.value = true
    })
  }
  else {
    // Fallback for browsers without Font Loading API
    fontsLoaded.value = true
  }

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

if (frontmatter.hydra) {
  useScriptTag('https://hyper-hydra.glitch.me/hydra-arrays.js', () => {
    console.log('hydra-arrays loaded')
  }, {
    async: true,
  })

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
        // Calculate square size based on container
        const containerRect = placeholder.getBoundingClientRect()
        const size = containerRect.width;
        (preEl.children[0] as HTMLElement).style.height = `${size}px`

        // Update canvas dimensions
        hydraCanvas.width = size
        hydraCanvas.height = size

        // @ts-ignore - hydra global, Reinitialize hydra with new size
        hydra = new Hydra({
          canvas: hydraCanvas,
          detectAudio: false,
          enableStreamCapture: false,
          width: size,
          height: size,
        })

        // @ts-ignore - hydra global
        hush()
        setTimeout(() => {
          eval(codeEl.textContent!)
        }, 20)
        placeholder.appendChild(hydraCanvas)
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

      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting === true)
          preEl.dispatchEvent(new Event('focus'))
        else
          preEl.dispatchEvent(new Event('focusout'))
      }, { threshold: [1], rootMargin: '0% 100% 0% 100%' })
      observer.observe(preEl)
      hydraObservers.push(observer)
    })
  }, { async: true, defer: true })
}
</script>

<template>
  <ClientOnly v-if="frontmatter.plum">
    <Plum />
  </ClientOnly>
  <div
    v-if="frontmatter.display ?? frontmatter.title"
    class="prose m-auto mb-8"
    :class="[frontmatter.wrapperClass]"
  >
    <h1 class="font-mono mb-0">
      {{ frontmatter.display ?? frontmatter.title }}
      <span
        v-if="frontmatter.phonetic"
        class="opacity-30 font-phonetics"
        :style="{ visibility: fontsLoaded ? 'visible' : 'hidden' }"
      >({{ frontmatter.phonetic }})
      </span>
    </h1>
    <p
      v-if="frontmatter.date"
      class="opacity-50 !-mt-6 font-serif-extra font-italic"
    >
      {{ formatDate(frontmatter.date, false) }} <span v-if="frontmatter.duration">· {{ frontmatter.duration }}</span>
    </p>
    <p v-if="frontmatter.place" class="font-serif-extra font-italic mt--4!">
      <span class="op50">at </span>
      <a v-if="frontmatter.placeLink" :href="frontmatter.placeLink" target="_blank">
        {{ frontmatter.place }}
      </a>
      <span v-else class="op-75 font-light">
        <a :href="`https://www.google.com/maps/search/${frontmatter.place}`" target="_blank" rel="noopener noreferrer">{{ frontmatter.place }}</a>
      </span>
      <span v-if="isTrackedPage" class="op-50 ml-2">
        ⋅.˳˳.⋅ॱ˙˙ॱ⋅.˳˳.⋅ॱ˙˙ॱᐧ.˳˳.⋅ {{ (viewCount ?? 0).toString().padStart(3, '0') }} view(s)
      </span>
    </p>
    <p v-else-if="isTrackedPage" class="font-serif-extra font-italic mt--4! op-50">
      {{ (viewCount ?? 0).toString().padStart(3, '0') }} view(s)
    </p>
    <p
      v-if="frontmatter.subtitle"
      class="opacity-50 !-mt-6 italic"
    >
      {{ frontmatter.subtitle }}
    </p>
    <p
      v-if="frontmatter.draft"
      bg-orange-4:10 text-orange-4 border="l-3 orange-4" px4 py2
    >
      This is a draft, the content may be incomplete. Please check back later.
    </p>
  </div>
  <article ref="content" :class="[frontmatter.tocAlwaysOn ? 'toc-always-on' : '', frontmatter.class]">
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
