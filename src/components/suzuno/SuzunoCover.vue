<script setup lang="ts">
// The cover as one SVG in the pixel space of reference/cover-unlit.png
// (1414 x 1093, US Letter), so every position is measured directly off the
// reference. Colours are the unlit print; the last layers add the room light
// and the grain. The background patterns (the vine and the grain) come from
// src/lib/suzuno/patterns/, and `pattern` replaces the vine with other layers. The
// vine is in the markup, so the cover needs no script; with `grow` it grows
// from its genome on mount. A `viewBox` shows a detail. `texts` replaces the
// title and the banner line.
import { useHead } from '@unhead/vue'
import { useId } from 'vue'
import bannerPhoto from '~/assets/suzuno/banner-photo.webp'
import lighting from '~/assets/suzuno/lighting.png'
import veil from '~/assets/suzuno/veil.png'
import type { CoverTexts, CoverTypography } from '~/lib/suzuno/cover-typography'
import { COVER_TEXTS, COVER_TYPOGRAPHY, TITLE_TEXT } from '~/lib/suzuno/cover-typography'
import PatternFill from '~/components/suzuno/PatternFill.vue'
import type { PatternFillValue, PatternLayer } from '~/lib/suzuno/patterns'
import { COVER_VINE_BOX } from '~/lib/suzuno/patterns/plum-vine'

const props = withDefaults(defineProps<{
  grow?: boolean
  typography?: CoverTypography
  /** Texts that replace the texts of the print. */
  texts?: Partial<CoverTexts>
  /** The background over the paper and under the print; by default the vine. */
  pattern?: PatternFillValue
  viewBox?: string
}>(), {
  grow: false,
  typography: () => COVER_TYPOGRAPHY,
  pattern: () => ({ name: 'plum-vine', box: COVER_VINE_BOX }),
})

const SHEET = { width: 1414, height: 1093 }
const SHEET_BOX = { x: 0, y: 0, ...SHEET }
// The title ink, and the lighter ink below the rule
const TITLE_INKS = [{ fill: '#62d9f8', belowRule: false }, { fill: '#5bd4ee', belowRule: true }]
// The text frame of the title ends here
const TITLE_FRAME_BOTTOM = 1072
// The strip of the banner photo, turned 90 degrees clockwise from a horizontal banner
const STRIP = { left: 736, right: 1174, length: 1073 }
// The title ink below this line, the descender of the g under the rule, is lighter
const BELOW_RULE = 1048
const GRAIN: PatternLayer = { name: 'paper-grain' }

const DEFINITIONS = ['label', 'title', 'titleFrame', 'stripNormalInk', 'stripInk', 'belowRule', 'printSoft'] as const
type Definition = typeof DEFINITIONS[number]

const id = useId()
const ids = Object.fromEntries(DEFINITIONS.map(name => [name, `${id}-${name}`])) as Record<Definition, string>
const url = (name: Definition) => `url(#${ids[name]})`

const title = computed(() => props.typography.title)
const banner = computed(() => props.typography.banner)
const texts = computed(() => ({ ...COVER_TEXTS, ...props.texts }))
// The offsets are fitted to the glyphs of the printed title, so another title keeps the spacing of the face
const glyphOffsets = computed(() => texts.value.title === TITLE_TEXT ? title.value.glyphOffsets.join(' ') : undefined)

/** The text in runs, with the characters that the face lacks as blank runs. */
function runs(text: string, missing = '') {
  const result: { text: string, blank: boolean }[] = []
  for (const character of text) {
    const blank = missing.includes(character)
    if (result.at(-1)?.blank === blank)
      result.at(-1)!.text += character
    else
      result.push({ text: character, blank })
  }
  return result
}
const titleRuns = computed(() => runs(texts.value.title, title.value.missing))
const bannerRuns = computed(() => runs(texts.value.banner, banner.value.missing))

// The faces of the print (tools/font-fit*.mjs): Adobe Caslon Pro Bold for the
// Latin letters and Ro本明朝Std E for the kana, combined like a 合成フォント
// through unicode-range. They apply only when they are installed; the free
// faces of src/lib/suzuno/cover-typography.ts stand in for them.

/** The sources of a face: the installed font. */
function fontSources(fullName: string, name: string) {
  return [`local('${fullName}')`, `local('${name}')`].join(', ')
}

const FONT_FACES = `
@font-face { font-family: 'Suzuno Latin'; font-weight: 700; src: ${fontSources('Adobe Caslon Pro Bold', 'ACaslonPro-Bold')}; }
@font-face { font-family: 'Suzuno Kana'; font-weight: 700; src: ${fontSources('Ro本明朝Std E', 'RoHMinchoStd-E')}; unicode-range: U+3000-30FF; }`

// A stylesheet with a text parameter loads only the glyphs of that text. It
// gets the texts that its family sets, without the spaces, so that the
// default texts load the subsets that the values were fitted with.
const GLYPHS_PARAMETER = /([?&]text=)[^&]*/
const FAMILY_PARAMETER = /[?&]family=([^:&]+)/
const stylesheets = computed(() => props.typography.stylesheets.map((href) => {
  const family = decodeURIComponent(href.match(FAMILY_PARAMETER)?.[1] ?? '').replaceAll('+', ' ')
  const glyphs = [{ family: title.value.family, text: texts.value.title }, { family: banner.value.family, text: texts.value.banner }]
    .filter(line => line.family.includes(family))
    .map(line => line.text)
    .join('')
    .replace(/\s/g, '')
  return href.replace(GLYPHS_PARAMETER, `$1${encodeURIComponent(glyphs)}`)
}))

useHead({
  link: computed(() => stylesheets.value.map(href => ({ rel: 'stylesheet', href }))),
  // One style element for all covers on a page
  style: [{ key: 'suzuno-font-slots', innerHTML: FONT_FACES }],
})

const background = ref<InstanceType<typeof PatternFill> | null>(null)
defineExpose({ growOrnament: () => background.value?.replay() })
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="viewBox ?? `0 0 ${SHEET.width} ${SHEET.height}`" role="img" :aria-labelledby="ids.label">
    <title :id="ids.label">{{ texts.title }}, {{ texts.banner }}</title>
    <defs>
      <clipPath :id="ids.titleFrame">
        <rect x="0" y="0" :width="SHEET.width" :height="TITLE_FRAME_BOTTOM" />
      </clipPath>
      <!-- Over the photo the title ink is a translucent layer (Normal blend)
           under a Color blend, which takes the hue of the ink and the
           luminance of what lies below. The filters paint the title shape
           in each ink, only over the strip. Fitted by tools/fits/title-strip.mjs. -->
      <filter :id="ids.stripNormalInk" filterUnits="userSpaceOnUse" :x="STRIP.left" y="0" :width="STRIP.right - STRIP.left" :height="TITLE_FRAME_BOTTOM" color-interpolation-filters="sRGB">
        <feFlood flood-color="#009ff5" />
        <feComposite in2="SourceAlpha" operator="in" />
      </filter>
      <filter :id="ids.stripInk" filterUnits="userSpaceOnUse" :x="STRIP.left" y="0" :width="STRIP.right - STRIP.left" :height="TITLE_FRAME_BOTTOM" color-interpolation-filters="sRGB">
        <feFlood flood-color="#0fb5fd" />
        <feComposite in2="SourceAlpha" operator="in" />
      </filter>
      <!-- In the title's own coordinates: baseline at 0, squeezed -->
      <clipPath :id="ids.belowRule">
        <rect x="-100" :y="BELOW_RULE - title.y" width="4000" height="24" />
      </clipPath>
      <filter :id="ids.printSoft" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="0.9" />
      </filter>
    </defs>

    <rect :width="SHEET.width" :height="SHEET.height" fill="#f6f5f2" />

    <PatternFill ref="background" inline :pattern="pattern" :box="SHEET_BOX" :grow="grow" />

    <!-- Squeezed horizontally like the 長体 of the print -->
    <g :clip-path="url('titleFrame')">
      <g
        :id="ids.title"
        :font-family="title.family"
        :font-weight="title.weight"
        :font-size="title.size"
        :letter-spacing="title.tracking"
        :transform="`translate(${title.x} ${title.y}) scale(${title.squeeze} 1)`"
      >
        <!-- A blank run keeps the advance of its fallback glyphs, so that the rest stays in place -->
        <text v-for="ink in TITLE_INKS" :key="ink.fill" :fill="ink.fill" :dx="glyphOffsets" :clip-path="ink.belowRule ? url('belowRule') : undefined">
          <template v-for="(run, index) in titleRuns" :key="index">
            <tspan v-if="run.blank" fill-opacity="0">{{ run.text }}</tspan>
            <template v-else>{{ run.text }}</template>
          </template>
        </text>
      </g>
    </g>

    <g :transform="`translate(${STRIP.right} 0) rotate(90)`">
      <image :href="bannerPhoto" :width="STRIP.length" :height="STRIP.right - STRIP.left" preserveAspectRatio="none" />
      <SuzunoLogo transform="translate(132.5 97.25) rotate(1.5) scale(0.767 0.64)" />
      <text
        :transform="`translate(${banner.x} ${banner.y}) scale(${banner.squeeze} 1)`"
        fill="#ebedee"
        :font-family="banner.family"
        :font-weight="banner.weight"
        :font-size="banner.size"
        :letter-spacing="banner.tracking"
        :filter="url('printSoft')"
      >
        <template v-for="(run, index) in bannerRuns" :key="index">
          <tspan v-if="run.blank" fill-opacity="0">{{ run.text }}</tspan>
          <template v-else>{{ run.text }}</template>
        </template>
      </text>
    </g>

    <use :href="`#${ids.title}`" :filter="url('stripNormalInk')" opacity="0.61" />
    <use :href="`#${ids.title}`" :filter="url('stripInk')" opacity="0.55" style="mix-blend-mode: color" />

    <!-- Multiplied like a translucent ink: the descender of the g and the photo show through it -->
    <rect x="19.25" y="1017.75" width="1376.5" height="29.75" fill="#07a8f1" style="mix-blend-mode: multiply" />

    <image :href="lighting" :width="SHEET.width" :height="SHEET.height" preserveAspectRatio="none" style="mix-blend-mode: multiply" />
    <image :href="veil" :width="SHEET.width" :height="SHEET.height" preserveAspectRatio="none" />

    <PatternFill inline :pattern="GRAIN" :box="SHEET_BOX" />
  </svg>
</template>
