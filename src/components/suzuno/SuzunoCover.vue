<script setup lang="ts">
// The cover as one SVG in the pixel space of its reference screenshot
// (1414 x 1093, US Letter), so every position is measured directly off the
// reference. Colours are the unlit print; the last layers add the room light
// and the grain.
import { useHead } from '@unhead/vue'
import { useId } from 'vue'
import bannerPhoto from '~/assets/suzuno/banner-photo.webp'
import lighting from '~/assets/suzuno/lighting.png'
import veil from '~/assets/suzuno/veil.png'
import type { CoverTexts } from '~/lib/suzuno/cover-typography'
import { BANNER_TYPE, COVER_TEXTS, TITLE_TYPE } from '~/lib/suzuno/cover-typography'
import PatternFill from '~/components/suzuno/PatternFill.vue'
import { COVER_VINE_BOX } from '~/lib/suzuno/patterns/plum-vine'

const props = defineProps<{
  texts: CoverTexts
}>()

const SHEET = { width: 1414, height: 1093 }
// The title ink, and the lighter ink below the rule
const TITLE_INKS = [{ fill: '#62d9f8', belowRule: false }, { fill: '#5bd4ee', belowRule: true }]
// The text frame of the title ends here
const TITLE_FRAME_BOTTOM = 1072
// The strip of the banner photo, turned 90 degrees clockwise from a horizontal banner
const STRIP = { left: 736, right: 1174, length: 1073 }
// The title ink below this line, the descender of the g under the rule, is lighter
const BELOW_RULE = 1048
const SHEET_BOX = { x: 0, y: 0, ...SHEET }
const VINE = { name: 'plum-vine', box: COVER_VINE_BOX }
const GRAIN = { name: 'paper-grain' }

const DEFINITIONS = ['label', 'title', 'titleFrame', 'stripNormalInk', 'stripInk', 'belowRule', 'printSoft'] as const
type Definition = typeof DEFINITIONS[number]

const id = useId()
const ids = Object.fromEntries(DEFINITIONS.map(name => [name, `${id}-${name}`])) as Record<Definition, string>
const url = (name: Definition) => `url(#${ids[name]})`

// The offsets are fitted to the glyphs of the printed title, so another title keeps the spacing of the face
const glyphOffsets = computed(() => props.texts.title === COVER_TEXTS.title ? TITLE_TYPE.glyphOffsets.join(' ') : undefined)

// The faces of the print (tools/font-fit*.mjs in the Suzuno project): Adobe
// Caslon Pro Bold for the Latin letters and Ro本明朝Std E for the kana,
// combined like a 合成フォント through unicode-range. They apply only when
// they are installed; the free faces of cover-typography.ts stand in for them.
const FONT_FACES = `
@font-face { font-family: 'Suzuno Latin'; font-weight: 700; src: local('Adobe Caslon Pro Bold'), local('ACaslonPro-Bold'); }
@font-face { font-family: 'Suzuno Kana'; font-weight: 700; src: local('Ro本明朝Std E'), local('RoHMinchoStd-E'); unicode-range: U+3000-30FF; }`

// A stylesheet with a text parameter loads only the glyphs of that text,
// without the spaces, so that the default texts load the subsets that the
// values were fitted with
function stylesheet(family: string, text: string) {
  return `https://fonts.googleapis.com/css2?family=${family}:wght@700&text=${encodeURIComponent(text.replace(/\s/g, ''))}&display=block`
}

useHead({
  link: computed(() => [
    { rel: 'stylesheet', href: stylesheet('BIZ+UDPMincho', props.texts.banner) },
    { rel: 'stylesheet', href: stylesheet('Libre+Caslon+Condensed', props.texts.title) },
  ]),
  // One style element for all covers on a page
  style: [{ key: 'suzuno-font-slots', innerHTML: FONT_FACES }],
})
</script>

<template>
  <svg class="block h-auto w-full" :viewBox="`0 0 ${SHEET.width} ${SHEET.height}`" role="img" :aria-labelledby="ids.label">
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
        <rect x="-100" :y="BELOW_RULE - TITLE_TYPE.y" width="4000" height="24" />
      </clipPath>
      <filter :id="ids.printSoft" x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation="0.9" />
      </filter>
    </defs>

    <rect :width="SHEET.width" :height="SHEET.height" fill="#f6f5f2" />

    <PatternFill inline :pattern="VINE" :box="SHEET_BOX" />

    <!-- Squeezed horizontally like the 長体 of the print -->
    <g :clip-path="url('titleFrame')">
      <g
        :id="ids.title"
        :font-family="TITLE_TYPE.family"
        :font-weight="TITLE_TYPE.weight"
        :font-size="TITLE_TYPE.size"
        :letter-spacing="TITLE_TYPE.tracking"
        :transform="`translate(${TITLE_TYPE.x} ${TITLE_TYPE.y}) scale(${TITLE_TYPE.squeeze} 1)`"
      >
        <text v-for="ink in TITLE_INKS" :key="ink.fill" :fill="ink.fill" :dx="glyphOffsets" :clip-path="ink.belowRule ? url('belowRule') : undefined">{{ texts.title }}</text>
      </g>
    </g>

    <g :transform="`translate(${STRIP.right} 0) rotate(90)`">
      <image :href="bannerPhoto" :width="STRIP.length" :height="STRIP.right - STRIP.left" preserveAspectRatio="none" />
      <SuzunoLogo transform="translate(132.5 97.25) rotate(1.5) scale(0.767 0.64)" />
      <text
        :transform="`translate(${BANNER_TYPE.x} ${BANNER_TYPE.y}) scale(${BANNER_TYPE.squeeze} 1)`"
        fill="#ebedee"
        :font-family="BANNER_TYPE.family"
        :font-weight="BANNER_TYPE.weight"
        :font-size="BANNER_TYPE.size"
        :letter-spacing="BANNER_TYPE.tracking"
        :filter="url('printSoft')"
      >{{ texts.banner }}</text>
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
