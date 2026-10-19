<script setup lang="ts">
// A recreation of the Suzuno project on its reference image with the colour
// difference, on black: where the recreation matches the reference, the face
// is black. `texts` replaces texts of the print. src/lib/suzuno/README.md
// lists the items, their faces and their texts. The recreation loads its
// fonts and images, so it mounts only when the face comes near the window.
import type { DifferenceItem, FaceName } from '~/lib/suzuno/faces'
import { differenceFace, mergeTexts } from '~/lib/suzuno/faces'
import { referenceImage } from '~/lib/suzuno/reference-images'

const props = withDefaults(defineProps<{
  item: DifferenceItem
  face?: FaceName
  /** Texts that replace the texts of the print. Objects merge; other values replace the default as a whole. */
  texts?: Record<string, unknown>
  /** Further props of the recreation, such as colours or images. */
  overrides?: Record<string, unknown>
  /** Shows the recreation alone, without the reference and without the difference. */
  recreationOnly?: boolean
}>(), {
  face: 'front',
  recreationOnly: false,
})

// The prose column, as for the markdown images (scripts/markdown-images.ts)
const IMAGE_SIZES = '(min-width: 720px) 660px, 100vw'
// A face is at most as high as the window, less a margin
const MAX_HEIGHT = '(100svh - 2rem)'
// The recreation mounts when the face is one window height away
const NEAR_MARGIN = '100% 0px'

const face = computed(() => differenceFace(props.item, props.face))
const reference = computed(() => referenceImage(face.value.reference))
const recreationProps = computed(() => ({
  ...face.value.props,
  ...face.value.textProps(mergeTexts(face.value.texts, props.texts)),
  ...props.overrides,
}))
const aspectRatio = computed(() => reference.value.width / reference.value.height)
const width = computed(() => `min(100%, ${MAX_HEIGHT} * ${aspectRatio.value})`)

const figure = ref<HTMLElement>()
const near = ref(false)
const { stop } = useIntersectionObserver(figure, ([entry]) => {
  if (entry?.isIntersecting) {
    near.value = true
    stop()
  }
}, { rootMargin: NEAR_MARGIN })
</script>

<template>
  <!-- The aspect ratio of the reference holds the space until the recreation
       mounts; then the recreation alone sets the height. The reference takes
       the exact box of the recreation: a rounded image height leaves a light
       line along the edge in the difference. -->
  <figure ref="figure" class="relative isolate mx-auto" :class="{ 'bg-black': !recreationOnly }" :style="{ width, aspectRatio: near ? undefined : aspectRatio }">
    <img
      v-if="!recreationOnly"
      class="no-preview absolute inset-0 block w-full !m-0 !h-full"
      :src="reference.src"
      :srcset="reference.srcset"
      :sizes="IMAGE_SIZES"
      :width="reference.width"
      :height="reference.height"
      :alt="face.title"
      loading="lazy"
      decoding="async"
    >
    <div class="relative z-1" :class="{ 'mix-blend-difference': !recreationOnly }">
      <component :is="face.component" v-if="near" v-bind="recreationProps" />
    </div>
  </figure>
</template>
