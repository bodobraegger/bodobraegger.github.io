<script setup lang="ts">
// The print of the back of the RIBON milk candy bag (HokkaidoMilkBag.vue).
// Each block has its own origin and is laid out in face pixels from it:
// the small title with its map and claims, the calcium note, the nutrition
// table, the notice and the address on the left; the best-before date, the
// product label, the barcode, the homepage and the recycling mark on the right.
import milkCan from '~/assets/suzuno/packages/hokkaido-milk-can.webp'
import mascot from '~/assets/suzuno/packages/hokkaido-milk-mascot.webp'
import Ean13Barcode from '~/components/suzuno/packages/Ean13Barcode.vue'
import HokkaidoBadge from '~/components/suzuno/packages/HokkaidoBadge.vue'
import HokkaidoMap from '~/components/suzuno/packages/HokkaidoMap.vue'
import HokkaidoTitle from '~/components/suzuno/packages/HokkaidoTitle.vue'
import LabelTable from '~/components/suzuno/packages/LabelTable.vue'
import RecyclingMark from '~/components/suzuno/packages/RecyclingMark.vue'
import type { TableLayout } from '~/lib/suzuno/packages/almond-caramel'
import type { FaceLayout, HokkaidoMilkBagTexts } from '~/lib/suzuno/packages/hokkaido-milk'
import { HOKKAIDO_MILK_FONTS, placePart } from '~/lib/suzuno/packages/hokkaido-milk'

const props = defineProps<{
  texts: HokkaidoMilkBagTexts
  layout: FaceLayout
}>()

const TIMES_SIZE = 100 / 0.66
const MINCHO_SIZE = 100 / 0.88
const SMALL_BADGES = [{ x: 30, scale: 0.075 }, { x: 105, scale: 0.065 }, { x: 180, scale: 0.065 }]
const SMALL_CAN = { width: 24, height: 47, y: -5 }
const BADGES = ['badgeLeft', 'badgeMiddle', 'badgeRight'] as const
const CALCIUM = { width: 120, height: 18, lineHeight: 13, fontSize: 10.5 }
const NO_TITLE = { dy: 0, size: 0 }
const NUTRITION: TableLayout = { x: 0, y: 0, width: 176, headingWidth: 72, rowHeight: 16, leading: 13, rule: 0.9, size: 10.5, title: NO_TITLE }
const NOTE_SIZE = 9.5
const NOTICE = { lineHeight: 10.1, fontSize: 9.2 }
const LABEL: TableLayout = { x: 0, y: 0, width: 240, headingWidth: 54, rowHeight: 16, leading: 13, rule: 0.9, size: 10.2, title: NO_TITLE }
const BARCODE = { x: 0, y: 0, width: 130, height: 68, size: 11 }
const RECYCLING_MARK = { x: 0, y: 0, width: 26, height: 22 }

const parts = computed(() => props.layout.parts)
const inks = computed(() => props.layout.inks)
const spacings = computed(() => props.layout.spacings ?? {})
const back = computed(() => props.texts.back)

// Two spanning rows, the heading and the serving, come before the rows
const nutritionBottom = computed(() => (back.value.nutrition.rows.length + 2) * NUTRITION.rowHeight)
const labelRows = computed(() => {
  const { rows, weightRow, rowsAfterWeight } = back.value.label
  return [...rows, { heading: weightRow[0], lines: [`${props.texts.weight}${weightRow[1]}`] }, ...rowsAfterWeight]
})
</script>

<template>
  <g :font-family="HOKKAIDO_MILK_FONTS.gothic" :fill="inks.text">
    <g :transform="placePart(parts.opening)" :font-size="8.6" data-part="opening">
      <text v-for="(line, index) in back.opening" :key="line" :x="index ? 9 : 0" :y="index * 15">
        {{ line }}
      </text>
    </g>

    <HokkaidoMap :transform="placePart(parts.map)" :color="inks.map" :strokes="inks['map-strokes']" data-part="map" />
    <text
      :transform="placePart(parts.tagline)"
      text-anchor="middle"
      :font-family="HOKKAIDO_MILK_FONTS.times"
      font-weight="700"
      :font-size="TIMES_SIZE"
      :letter-spacing="spacings.tagline"
      :fill="inks.tagline"
      data-part="tagline"
    >
      {{ texts.tagline }}
    </text>
    <HokkaidoTitle :transform="placePart(parts.title)" :text="texts.title" :color="inks.title" :shine="inks['title-shine']" data-part="title" />
    <text
      :transform="placePart(parts.subtitle)"
      text-anchor="middle"
      :font-family="HOKKAIDO_MILK_FONTS.mincho"
      font-weight="900"
      :font-size="MINCHO_SIZE"
      :letter-spacing="spacings.subtitle"
      :fill="inks.subtitle"
      data-part="subtitle"
    >
      {{ texts.subtitle }}
    </text>

    <g :transform="placePart(parts.badges)" data-part="badges">
      <g v-for="(badge, index) in SMALL_BADGES" :key="badge.x">
        <image :href="milkCan" :x="badge.x - SMALL_CAN.width / 2" :y="SMALL_CAN.y" :width="SMALL_CAN.width" :height="SMALL_CAN.height" />
        <HokkaidoBadge :transform="`translate(${badge.x} 16) scale(${badge.scale})`" :lines="texts.badges[index] ?? []" :color="inks[`${BADGES[index]}:badge`]" :edge="inks['badge-edge']" :shadow="inks['badge-shadow']" />
      </g>
    </g>

    <g :transform="placePart(parts.calcium)" data-part="calcium">
      <rect :width="CALCIUM.width" :height="CALCIUM.height" :rx="CALCIUM.height / 2" :fill="inks.blue" />
      <text :x="CALCIUM.width / 2" :y="CALCIUM.height - 4.5" text-anchor="middle" font-weight="700" :font-size="11" fill="#fff">
        {{ back.calciumHeading }}
      </text>
      <text
        v-for="(line, index) in back.calciumText"
        :key="line"
        :x="2"
        :y="CALCIUM.height + (index + 1) * CALCIUM.lineHeight"
        :font-size="CALCIUM.fontSize"
      >
        {{ line }}
      </text>
    </g>

    <g :transform="placePart(parts.nutrition)" data-part="nutrition">
      <LabelTable :layout="NUTRITION" title="" :spans="[back.nutrition.heading, back.nutrition.serving]" :rows="back.nutrition.rows" :color="inks.text" />
      <text :x="NUTRITION.width / 2 + 10" :y="nutritionBottom + 12" text-anchor="middle" :font-size="NOTE_SIZE">
        {{ back.nutrition.note }}
      </text>
    </g>

    <g :transform="placePart(parts.notice)" :font-size="NOTICE.fontSize" data-part="notice">
      <text v-for="(line, index) in back.notice" :key="line" :y="(index + 1) * NOTICE.lineHeight">
        {{ line }}
      </text>
    </g>

    <g :transform="placePart(parts.address)" data-part="address">
      <text :y="9" :font-size="9.4">
        {{ back.address[0] }}
      </text>
      <text :y="20" :font-size="9.4" font-weight="700">
        {{ back.address[1] }}
      </text>
      <rect :y="23.5" width="13" height="8" rx="1.5" />
      <text :x="16" :y="31.5" :font-size="10.5">
        {{ back.address[2] }}
      </text>
      <text :y="40" :font-size="6">
        {{ back.address[3] }}
      </text>
      <text :y="49" :font-size="7.2">
        {{ back.address[4] }}
      </text>
    </g>

    <g :transform="placePart(parts.bestBefore)" :fill="inks.date" data-part="bestBefore">
      <text :y="10" :font-size="10">
        {{ back.bestBefore.label }}
      </text>
      <text :y="39" :font-size="18.5" letter-spacing="0.5">
        {{ back.bestBefore.date }}
      </text>
    </g>

    <text :transform="placePart(parts.afterOpening)" text-anchor="end" :font-size="9.5" data-part="afterOpening">
      {{ back.afterOpening }}
    </text>

    <LabelTable
      :transform="placePart(parts.label)"
      :layout="LABEL"
      title=""
      :spans="[back.label.heading]"
      span-align="start"
      :rows="labelRows"
      :color="inks.text"
      data-part="label"
    />

    <text :transform="placePart(parts.illustrationNote)" :font-size="11" data-part="illustrationNote">
      {{ back.illustration }}
    </text>

    <Ean13Barcode :transform="placePart(parts.barcode)" :layout="BARCODE" :digits="back.barcode" :color="inks.text" data-part="barcode" />

    <g :transform="placePart(parts.homepage)" data-part="homepage">
      <rect x="22" y="3" width="140" height="23" rx="7" :fill="inks.blue" fill-opacity="0.35" />
      <image :href="mascot" width="37" height="32" />
      <text x="38" y="13" :font-size="7.8">
        {{ back.homepage[0] }}
      </text>
      <text x="44" y="23" :font-size="7.8">
        {{ back.homepage[1] }}
      </text>
    </g>

    <g :transform="placePart(parts.recycling)" data-part="recycling">
      <RecyclingMark :box="RECYCLING_MARK" :material="back.recycling.mark" :color="inks.text" />
      <text v-for="(part, index) in back.recycling.parts" :key="part" x="31" :y="8 + index * 10" :font-size="7.6">
        {{ part }}
      </text>
      <text v-for="(line, index) in back.recycling.text" :key="line" x="68" :y="8 + index * 10" :font-size="7.6">
        {{ line }}
      </text>
    </g>
  </g>
</template>
