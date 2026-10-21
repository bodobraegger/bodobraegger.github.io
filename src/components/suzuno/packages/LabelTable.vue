<script setup lang="ts">
// A ruled table of a Japanese food label (一括表示 or 栄養成分表示): a title
// above it, a heading column with the headings spread to one width, and
// the lines of each value. A row of one line is rowHeight high; each further
// line adds the leading. Optional spanning rows across the full width, such
// as 商品名 or 1粒あたり, come first inside the rule.
import type { TableLayout, TableRow } from '~/lib/suzuno/packages/almond-caramel'
import { ALMOND_CARAMEL_FONTS } from '~/lib/suzuno/packages/almond-caramel'
import { useWebFonts } from '~/lib/suzuno/packages/lettering'

const props = withDefaults(defineProps<{
  layout: TableLayout
  title: string
  rows: TableRow[]
  color: string
  /** Rows across the full width above the other rows; centred unless spanAlign is start. */
  spans?: string[]
  spanAlign?: 'start' | 'middle'
}>(), {
  spans: () => [],
  spanAlign: 'middle',
})

const font = ALMOND_CARAMEL_FONTS.gothic
useWebFonts(() => [font])

// The headings fill this part of their column; the values start this far after the rule
const HEADING_FILL = 0.72
const VALUE_INDENT = 0.4

const placedSpans = computed(() => props.spans.map((text, index) => {
  const top = props.layout.y + index * props.layout.rowHeight
  return { text, top, baseline: top + props.layout.rowHeight / 2 + props.layout.size * 0.36 }
}))
const rowsTop = computed(() => props.layout.y + props.spans.length * props.layout.rowHeight)

const placedRows = computed(() => {
  const { rowHeight, leading, size } = props.layout
  let top = rowsTop.value
  return props.rows.map((row) => {
    const height = rowHeight + (row.lines.length - 1) * leading
    const placed = { ...row, top, height, firstBaseline: top + rowHeight / 2 + size * 0.36 }
    top += height
    return placed
  })
})
const tableBottom = computed(() => {
  const last = placedRows.value.at(-1)
  return last ? last.top + last.height : props.layout.y
})
const valueX = computed(() => props.layout.x + props.layout.headingWidth + VALUE_INDENT * props.layout.size)
</script>

<template>
  <g :fill="color" :font-family="font.family" :font-weight="font.weight" :font-size="layout.size">
    <text :x="layout.x" :y="layout.y + layout.title.dy" :font-size="layout.title.size">
      {{ title }}
    </text>
    <g fill="none" :stroke="color" :stroke-width="layout.rule">
      <rect :x="layout.x" :y="layout.y" :width="layout.width" :height="tableBottom - layout.y" />
      <line :x1="layout.x + layout.headingWidth" :x2="layout.x + layout.headingWidth" :y1="rowsTop" :y2="tableBottom" />
      <line v-for="row in [...placedSpans.slice(1), ...placedRows.slice(spans.length ? 0 : 1)]" :key="row.top" :x1="layout.x" :x2="layout.x + layout.width" :y1="row.top" :y2="row.top" />
    </g>
    <g v-for="span in placedSpans" :key="span.top">
      <text
        :x="spanAlign === 'middle' ? layout.x + layout.width / 2 : layout.x + VALUE_INDENT * layout.size"
        :y="span.baseline"
        :text-anchor="spanAlign"
      >
        {{ span.text }}
      </text>
    </g>
    <g v-for="row in placedRows" :key="row.heading">
      <text
        :x="layout.x + layout.headingWidth / 2"
        :y="row.top + row.height / 2 + layout.size * 0.36"
        text-anchor="middle"
        :textLength="layout.headingWidth * HEADING_FILL"
        lengthAdjust="spacing"
      >
        {{ row.heading }}
      </text>
      <text v-for="(line, index) in row.lines" :key="index" :x="valueX" :y="row.firstBaseline + index * layout.leading">
        {{ line }}
      </text>
    </g>
  </g>
</template>
