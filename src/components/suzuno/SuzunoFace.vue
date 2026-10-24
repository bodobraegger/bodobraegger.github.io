<script setup lang="ts">
// The common part of SuzunoBag, SuzunoWrapper, SuzunoMarukawa,
// SuzunoFinancial, SuzunoRamune and SuzunoRamuneStrip: a recreation in a
// DifferenceFrame on its reference image, or alone for a face without one. Those components pass texts, difference and opacity
// on to this one, and so do a class and a style, which set the size and the
// place. src/lib/suzuno/README.md describes the options.
import { mergeTexts, textsOption } from '~/lib/difference'
import type { DifferenceFace } from '~/lib/suzuno/faces'
import { SMALL_FACE_WIDTH, textGlyphs } from '~/lib/suzuno/faces'
import { FACE_GLYPHS } from '~/lib/suzuno/packages/lettering'

const props = withDefaults(defineProps<{
  face: DifferenceFace
  texts?: object | string
  difference?: boolean | string
  opacity?: number | string
}>(), {
  difference: true,
})

const texts = computed(() => textsOption(props.texts))
const shownTexts = computed(() => mergeTexts(props.face.texts, texts.value.blank ? props.face.blank : texts.value.given))
// The recreation mounts only in the browser, so the build reads the texts
// here: the build output then shows an unknown text
void shownTexts.value
// The fonts load only the glyphs of the texts; blank texts show none
provide(FACE_GLYPHS, computed(() => textGlyphs(texts.value.blank ? '' : shownTexts.value)))
</script>

<template>
  <!-- A span, so that a face can stand in a paragraph -->
  <span class="suzuno-face" :style="{ '--aspect-ratio': face.reference.width / face.reference.height }" :data-blank="texts.blank || undefined">
    <DifferenceFrame v-if="'src' in face.reference" v-slot="{ width }" :image="face.reference" :alt="face.title" :difference="difference" :opacity="opacity" :copy="false">
      <component :is="face.component" v-bind="{ ...face.props, ...(width < SMALL_FACE_WIDTH ? face.small : undefined) }" :texts="shownTexts" />
    </DifferenceFrame>
    <component :is="face.component" v-else v-bind="face.props" :texts="shownTexts" />
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
:where(.suzuno-face[data-blank]) text {
  display: none;
}
</style>
