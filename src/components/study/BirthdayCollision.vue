<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { LANGUAGE_DEFINITIONS } from '~/logics/languages'
import { usePageLanguage } from '~/composables/usePageLanguage'

type Space = 'iv' | 'birthday'

interface SpaceDefinition {
  size: number
  /** The right end of the chart, where the probability is close to 100%. */
  maximum: number
  initial: number
}

/** 24 bit IV (section 4.8) and the 365 days of the birthday example. */
const SPACES: Record<Space, SpaceDefinition> = {
  iv: { size: 2 ** 24, maximum: 15000, initial: 1000 },
  birthday: { size: 365, maximum: 70, initial: 23 },
}
const SPACE_ORDER: Space[] = ['iv', 'birthday']
/** The frame rate of IEEE 802.11b given in section 4.8. */
const FRAMES_PER_SECOND = 500
const HALF = 0.5
const PERCENT = 100
const CURVE_SAMPLES = 240
const DEFAULT_CHART_WIDTH = 600
const CHART_HEIGHT = 220
const MARGIN = { top: 14, right: 16, bottom: 34, left: 40 }
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1]
const X_TICK_COUNT = 4
const LABEL_OFFSET = 6

interface Text {
  title: string
  spaces: Record<Space, string>
  count: Record<Space, string>
  axis: Record<Space, string>
  probability: (count: string, percent: string) => string
  pairs: (pairs: string) => string
  half: Record<Space, (count: string) => string>
  seconds: (count: string, seconds: string) => string
  intuition: Record<Space, string>
  chartLabel: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'Birthday paradox: when does the first IV repeat?',
    spaces: { iv: 'WEP IVs (24 bits)', birthday: 'Birthdays (365 days)' },
    count: { iv: 'Frames sent with a random IV', birthday: 'People in the room' },
    axis: { iv: 'frames', birthday: 'people' },
    probability: (count, percent) => `With ${count}, the probability of at least one repetition is ${percent}%.`,
    pairs: pairs => `Every pair can collide, and there are n(n − 1)/2 = ${pairs} pairs.`,
    half: {
      iv: count => `The probability passes 50% at ${count} frames.`,
      birthday: count => `The probability passes 50% at ${count} people.`,
    },
    seconds: (count, seconds) => `At ${count} frames per second (IEEE 802.11b), that takes about ${seconds} seconds.`,
    intuition: {
      iv: 'There are 16,777,216 IV values, but a repetition is likely after only a few thousand frames, because the number of pairs grows with the square of n.',
      birthday: 'With 23 people there are 253 pairs, so a shared birthday is more likely than not.',
    },
    chartLabel: 'Probability of at least one repetition versus the count',
  },
  pt: {
    title: 'Paradoxo do aniversário: quando o primeiro IV se repete?',
    spaces: { iv: 'IVs do WEP (24 bits)', birthday: 'Aniversários (365 dias)' },
    count: { iv: 'Quadros enviados com IV aleatório', birthday: 'Pessoas na sala' },
    axis: { iv: 'quadros', birthday: 'pessoas' },
    probability: (count, percent) => `Com ${count}, a probabilidade de pelo menos uma repetição é ${percent}%.`,
    pairs: pairs => `Cada par pode colidir, e existem n(n − 1)/2 = ${pairs} pares.`,
    half: {
      iv: count => `A probabilidade passa de 50% com ${count} quadros.`,
      birthday: count => `A probabilidade passa de 50% com ${count} pessoas.`,
    },
    seconds: (count, seconds) => `A ${count} quadros por segundo (IEEE 802.11b), isso leva cerca de ${seconds} segundos.`,
    intuition: {
      iv: 'Existem 16.777.216 valores de IV, mas uma repetição é provável depois de apenas alguns milhares de quadros, porque o número de pares cresce com o quadrado de n.',
      birthday: 'Com 23 pessoas existem 253 pares, então um aniversário em comum é mais provável do que não.',
    },
    chartLabel: 'Probabilidade de pelo menos uma repetição em função da contagem',
  },
}

const language = usePageLanguage()
const text = TEXT[language]
const locale = LANGUAGE_DEFINITIONS[language].locale
const integerFormat = new Intl.NumberFormat(locale)
const percentFormat = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const secondsFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })

const space = ref<Space>('iv')
const count = ref(SPACES.iv.initial)
const definition = computed(() => SPACES[space.value])

/**
 * P(n) = 1 - (1 - 1/N)(1 - 2/N)...(1 - (n-1)/N), the exact probability that n
 * random values out of N hold at least one repetition. Index n of the result is P(n).
 */
const probabilities = computed(() => {
  const { size, maximum } = definition.value
  const result = [0]
  let logNoRepetition = 0
  for (let n = 1; n <= maximum; n++) {
    logNoRepetition += Math.log1p(-(n - 1) / size)
    result.push(-Math.expm1(logNoRepetition))
  }
  return result
})

const halfPoint = computed(() => probabilities.value.findIndex(probability => probability >= HALF))
const probability = computed(() => probabilities.value[count.value] ?? 0)
const pairs = computed(() => count.value * (count.value - 1) / 2)

function selectSpace(next: Space) {
  space.value = next
  count.value = SPACES[next].initial
}

const chart = ref<SVGSVGElement>()
const { width: measuredWidth } = useElementSize(chart)
const chartWidth = computed(() => Math.round(measuredWidth.value) || DEFAULT_CHART_WIDTH)
const plotWidth = computed(() => chartWidth.value - MARGIN.left - MARGIN.right)
const plotHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom

function x(n: number): number {
  return MARGIN.left + n / definition.value.maximum * plotWidth.value
}

function y(value: number): number {
  return MARGIN.top + (1 - value) * plotHeight
}

const curve = computed(() => {
  const { maximum } = definition.value
  const points: string[] = []
  for (let sample = 0; sample <= CURVE_SAMPLES; sample++) {
    const n = Math.round(sample / CURVE_SAMPLES * maximum)
    points.push(`${x(n).toFixed(1)},${y(probabilities.value[n]).toFixed(1)}`)
  }
  return points.join(' ')
})

const xTicks = computed(() => Array.from({ length: X_TICK_COUNT + 1 }, (_, index) => Math.round(index / X_TICK_COUNT * definition.value.maximum)))

/** Keeps the label of the current point inside the plot at both ends. */
const cursorLabelAnchor = computed(() => x(count.value) > MARGIN.left + plotWidth.value / 2 ? 'end' : 'start')

function setCountFromPointer(event: PointerEvent) {
  const box = chart.value?.getBoundingClientRect()
  if (!box)
    return
  const fraction = (event.clientX - box.left - MARGIN.left) / plotWidth.value
  count.value = Math.round(Math.min(1, Math.max(0, fraction)) * definition.value.maximum)
}

function onPointerMove(event: PointerEvent) {
  if (event.buttons > 0)
    setCountFromPointer(event)
}

function formatPercent(value: number): string {
  return percentFormat.format(value * PERCENT)
}

/** Starts with a space: it follows the bold sentence, and the template compiler drops whitespace between the two. */
const timing = computed(() => space.value === 'iv'
  ? ` ${text.seconds(integerFormat.format(FRAMES_PER_SECOND), secondsFormat.format(halfPoint.value / FRAMES_PER_SECOND))}`
  : '')

const countLabel = computed(() => `${integerFormat.format(count.value)} ${text.axis[space.value]}`)
</script>

<template>
  <CipherFigure :title="text.title">
    <div class="study-controls">
      <button
        v-for="option in SPACE_ORDER"
        :key="option"
        type="button"
        class="study-button"
        :aria-pressed="space === option"
        @click="selectSpace(option)"
      >
        {{ text.spaces[option] }}
      </button>
    </div>
    <p class="study-mono">
      N = {{ integerFormat.format(definition.size) }}
    </p>

    <label class="cipher-field">
      <span>{{ text.count[space] }}: <strong class="study-mono">n = {{ integerFormat.format(count) }}</strong></span>
      <input v-model.number="count" type="range" min="0" :max="definition.maximum" step="1">
    </label>

    <svg
      ref="chart"
      class="birthday-chart"
      :viewBox="`0 0 ${chartWidth} ${CHART_HEIGHT}`"
      :height="CHART_HEIGHT"
      role="img"
      :aria-label="`${text.chartLabel}. ${text.half[space](integerFormat.format(halfPoint))}`"
      @pointerdown="setCountFromPointer"
      @pointermove="onPointerMove"
    >
      <g class="birthday-grid">
        <template v-for="tick in Y_TICKS" :key="tick">
          <line :x1="MARGIN.left" :x2="MARGIN.left + plotWidth" :y1="y(tick)" :y2="y(tick)" />
          <text :x="MARGIN.left - LABEL_OFFSET" :y="y(tick)" text-anchor="end" dominant-baseline="middle">{{ tick * PERCENT }}%</text>
        </template>
        <template v-for="tick in xTicks" :key="tick">
          <text :x="x(tick)" :y="MARGIN.top + plotHeight + 16" text-anchor="middle">{{ integerFormat.format(tick) }}</text>
        </template>
        <text :x="MARGIN.left + plotWidth" :y="CHART_HEIGHT - 2" text-anchor="end">{{ text.axis[space] }}</text>
      </g>

      <line class="birthday-half" :x1="MARGIN.left" :x2="x(halfPoint)" :y1="y(HALF)" :y2="y(HALF)" />
      <line class="birthday-half" :x1="x(halfPoint)" :x2="x(halfPoint)" :y1="y(HALF)" :y2="y(0)" />
      <polyline class="birthday-curve" :points="curve" />
      <circle class="birthday-half-point" :cx="x(halfPoint)" :cy="y(HALF)" r="4" />
      <text class="birthday-half-label" :x="x(halfPoint) + LABEL_OFFSET" :y="y(HALF) + 16">50%: n = {{ integerFormat.format(halfPoint) }}</text>

      <line class="birthday-cursor" :x1="x(count)" :x2="x(count)" :y1="y(0)" :y2="y(1)" />
      <circle class="birthday-point" :cx="x(count)" :cy="y(probability)" r="5" />
      <text
        class="birthday-point-label"
        :x="x(count) + (cursorLabelAnchor === 'start' ? LABEL_OFFSET : -LABEL_OFFSET)"
        :y="Math.max(MARGIN.top + 10, y(probability) - 10)"
        :text-anchor="cursorLabelAnchor"
      >{{ formatPercent(probability) }}%</text>
    </svg>

    <p>
      {{ text.probability(countLabel, formatPercent(probability)) }}
      {{ text.pairs(integerFormat.format(pairs)) }}
    </p>
    <p>
      <strong>{{ text.half[space](integerFormat.format(halfPoint)) }}</strong>
      {{ timing }}
    </p>
    <p class="cipher-muted">
      {{ text.intuition[space] }}
    </p>
  </CipherFigure>
</template>

<style scoped>
.birthday-chart {
  display: block;
  width: 100%;
  touch-action: pan-y;
  cursor: crosshair;
  font-size: 11px;
  user-select: none;
}

.birthday-grid {
  line {
    stroke: var(--c-border-soft);
    stroke-width: 1;
  }

  text {
    fill: var(--fg-muted);
  }
}

.birthday-curve {
  fill: none;
  stroke: var(--cipher-plain);
  stroke-width: 2;
  stroke-linejoin: round;
}

.birthday-half {
  stroke: var(--cipher-result);
  stroke-width: 1;
  stroke-dasharray: 4 3;
}

.birthday-half-point {
  fill: var(--cipher-result);
  stroke: var(--c-bg);
  stroke-width: 2;
}

.birthday-half-label {
  fill: var(--fg-deep);
}

.birthday-cursor {
  stroke: var(--fg-muted);
  stroke-width: 1;
}

.birthday-point {
  fill: var(--cipher-plain);
  stroke: var(--c-bg);
  stroke-width: 2;
}

.birthday-point-label {
  fill: var(--fg-deeper);
  font-weight: 700;
}
</style>
