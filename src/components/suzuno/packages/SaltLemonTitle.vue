<script setup lang="ts">
// The vertical title panel of the salt lemon candy bag: a dark panel with a
// thin frame, the kanji 塩 in the top field, its reading beside the panel, the
// name レモン and the kind キャンディ written downwards. It fills the box x, y,
// width, height of its parent. Its own coordinates are the face pixels of the
// panel of the front, TITLE_PANEL wide and high, with the origin at its top left.
import { useId } from 'vue'
import type { SaltLemonFont, SaltLemonTitleTexts, TitleLayout } from '~/lib/suzuno/packages/salt-lemon'
import { FRONT_COLORS, FRONT_PARTS, SALT_LEMON_FONTS, SALT_LEMON_TITLE, TITLE_PANEL, useSaltLemonFonts } from '~/lib/suzuno/packages/salt-lemon'

const props = withDefaults(defineProps<{
  x: number
  y: number
  width?: number
  height?: number
  texts?: SaltLemonTitleTexts
  /** The colours of the panel at its top and at its foot. */
  panel?: [string, string]
  ink?: string
  /** The edge round the reading. */
  rubyOutline?: string
  font?: SaltLemonFont
  layout?: TitleLayout
}>(), {
  width: TITLE_PANEL.width,
  height: TITLE_PANEL.height,
  texts: () => SALT_LEMON_TITLE,
  panel: () => FRONT_COLORS.panel,
  ink: FRONT_COLORS.ink,
  rubyOutline: FRONT_COLORS.edge,
  font: () => SALT_LEMON_FONTS.title,
  layout: () => FRONT_PARTS.title,
})

useSaltLemonFonts()

const gradientId = `${useId()}-panel`
const transform = computed(() => `translate(${props.x} ${props.y}) scale(${props.width / TITLE_PANEL.width} ${props.height / TITLE_PANEL.height})`)
const frame = computed(() => {
  const inset = props.layout.frameInset
  return { x: inset, y: inset, width: TITLE_PANEL.width - 2 * inset, height: TITLE_PANEL.height - 2 * inset }
})
const columns = computed(() => [
  { key: 'name', text: props.texts.name, place: props.layout.name },
  { key: 'kind', text: props.texts.kind, place: props.layout.kind },
])
</script>

<template>
  <g :transform="transform" :font-family="font.family" :font-weight="font.weight">
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="panel[0]" />
        <stop offset="1" :stop-color="panel[1]" />
      </linearGradient>
    </defs>
    <rect :width="TITLE_PANEL.width" :height="TITLE_PANEL.height" :fill="`url(#${gradientId})`" data-ink="title-panel" />
    <g fill="none" :stroke="ink" :stroke-width="layout.frameWidth" data-ink="title-frame">
      <rect v-bind="frame" />
      <line :x1="frame.x" :x2="frame.x + frame.width" :y1="layout.divider" :y2="layout.divider" />
    </g>
    <g :fill="ink" data-ink="title-lettering">
      <text :x="layout.kanji.x" :y="layout.kanji.y" :font-size="layout.kanji.size" text-anchor="middle" dominant-baseline="central">
        {{ texts.kanji }}
      </text>
      <text
        v-for="column in columns"
        :key="column.key"
        :x="column.place.x"
        :y="column.place.y"
        :font-size="column.place.size"
        :letter-spacing="column.place.spacing"
        writing-mode="vertical-rl"
      >
        {{ column.text }}
      </text>
    </g>
    <text
      :x="layout.ruby.x"
      :y="layout.ruby.y"
      :font-size="layout.ruby.size"
      :letter-spacing="layout.ruby.spacing"
      writing-mode="vertical-rl"
      :fill="ink"
      :stroke="rubyOutline"
      :stroke-width="layout.ruby.outline"
      stroke-linejoin="round"
      paint-order="stroke"
      data-ink="title-ruby"
    >
      {{ texts.ruby }}
    </text>
  </g>
</template>
