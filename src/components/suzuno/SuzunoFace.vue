<script setup lang="ts">
// The common part of SuzunoBag, SuzunoWrapper, SuzunoMarukawa and
// SuzunoFinancial: a recreation of the Suzuno project on its reference image,
// with the colour difference on black, or as an overlay. Those components
// pass texts, difference and opacity on to this one, and so do a class and a
// style, which set the size and the place. src/lib/suzuno/README.md describes
// the options. The recreation and the reference load fonts and images, so
// they mount only when the face comes near the window.
import type { DifferenceFace } from '~/lib/suzuno/faces'
import { SMALL_FACE_WIDTH, differenceOption, mergeTexts, opacityOption, textGlyphs, textsOption } from '~/lib/suzuno/faces'
import { FACE_GLYPHS } from '~/lib/suzuno/packages/lettering'
import { referenceImage } from '~/lib/suzuno/reference-images'

const props = withDefaults(defineProps<{
  face: DifferenceFace
  texts?: Record<string, unknown> | string
  difference?: boolean | string
  opacity?: number | string
}>(), {
  difference: true,
})

// The face mounts when it is one window height away
const NEAR_MARGIN = '100% 0px'

const root = ref<HTMLElement>()
const near = ref(false)
const { stop } = useIntersectionObserver(root, ([entry]) => {
  if (entry?.isIntersecting) {
    near.value = true
    stop()
  }
}, { rootMargin: NEAR_MARGIN })
// The reference and the images of the recreation load for the width of the face, also for a small candy
const { width } = useElementSize(root)
const mounted = computed(() => near.value && width.value > 0)

const reference = computed(() => referenceImage(props.face.reference))
const aspectRatio = computed(() => reference.value.width / reference.value.height)
const differenceMode = computed(() => differenceOption(props.difference))
const opacity = computed(() => opacityOption(props.opacity, differenceMode.value))
const texts = computed(() => textsOption(props.texts))
const shownTexts = computed(() => mergeTexts(props.face.texts, texts.value.blank ? props.face.blank : texts.value.given))
const recreationProps = computed(() => ({
  ...props.face.props,
  ...(width.value < SMALL_FACE_WIDTH ? props.face.small : undefined),
  texts: shownTexts.value,
}))
// The fonts load only the glyphs of the texts; blank texts show none
provide(FACE_GLYPHS, computed(() => textGlyphs(texts.value.blank ? '' : shownTexts.value)))
// The recreation mounts only in the browser, so the build reads the props
// here: the build output then shows an unknown text
if (import.meta.env.SSR)
  void recreationProps.value
</script>

<template>
  <!-- Phrasing elements only, so that a face can stand in a paragraph. The
       aspect ratio of the reference holds the space until the recreation
       mounts; then the recreation alone sets the height. The reference takes
       the exact box of the recreation: a rounded image height leaves a light
       line along the edge in the difference. -->
  <span ref="root" class="suzuno-face relative isolate" :class="{ 'bg-black': differenceMode }" :style="{ '--aspect-ratio': aspectRatio, 'aspectRatio': mounted ? undefined : aspectRatio }">
    <img
      v-if="mounted"
      class="no-preview absolute inset-0 block w-full !m-0 !h-full"
      :src="reference.src"
      :srcset="reference.srcset"
      :sizes="`${Math.ceil(width)}px`"
      :width="reference.width"
      :height="reference.height"
      :alt="face.title"
      decoding="async"
    >
    <span class="relative z-1 block" :class="{ 'mix-blend-difference': differenceMode }" :style="{ opacity }" :data-blank="texts.blank || undefined">
      <component :is="face.component" v-if="mounted" v-bind="recreationProps" />
    </span>
  </span>
</template>

<!-- Not scoped: the selectors have no specificity, so that a class or a style
     on the tag of a face wins over them. -->
<style>
:where(.suzuno-face) {
  display: block;
  width: min(100%, (100svh - 2rem) * var(--aspect-ratio));
  margin: 2em auto;
}

/* In a line of text, a face is a small candy among the words */
:where(p, li, td) :where(.suzuno-face) {
  display: inline-block;
  margin: 0;
  vertical-align: middle;
}

/* Blank texts hide the lettering of the recreation; its shapes and images stay */
:where(.suzuno-face [data-blank]) text {
  display: none;
}
</style>
