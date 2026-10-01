<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { SIGNIFICANCE_LEVEL, frequencyTest, lcgBits, runsTest } from '~/lib/randomness'
import { BITS_PER_BYTE, bytesToBits } from '~/lib/bits'
import { usePageLanguage } from '~/composables/usePageLanguage'

type Preset = 'alternating' | 'blocks' | 'generator' | 'browser'
const { initialPreset = 'generator' } = defineProps<{ initialPreset?: Preset }>()

const PRESETS: Preset[] = ['alternating', 'blocks', 'generator', 'browser']

const SEQUENCE_BITS = 128
const GENERATOR_SEED = 2026
const SMALLEST_SHOWN_P = 0.0001
const P_DECIMALS = 4
const STATISTIC_DECIMALS = 3
const EXPECTED_RUNS_DECIMALS = 1

interface Text {
  title: string
  intro: string
  presets: Record<Preset, string>
  size: string
  frequency: string
  runs: string
  ones: (ones: number, zeros: number) => string
  sum: (sum: number, statistic: string) => string
  proportion: (proportion: string) => string
  prerequisite: (tolerance: string, met: boolean) => string
  runCount: (runs: number, expected: string) => string
  notRun: string
  pass: string
  fail: string
  verdictPass: string
  verdictFail: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'NIST frequency and runs tests',
    intro: 'Tap a bit to flip it, or load an example. The shading marks the runs: a run is a group of equal bits in a row.',
    presets: { alternating: '0101...01', blocks: '000...111', generator: `LCG, seed ${GENERATOR_SEED}`, browser: 'crypto.getRandomValues' },
    size: `n = ${SEQUENCE_BITS} bits. The list uses n = 1,000,000 bits, with the same formulas. A test passes when p ≥ α = ${SIGNIFICANCE_LEVEL}.`,
    frequency: 'Frequency test',
    runs: 'Runs test',
    ones: (ones, zeros) => `ones = ${ones}, zeros = ${zeros}, expected n/2 = ${SEQUENCE_BITS / 2}`,
    sum: (sum, statistic) => `S_n = ${sum}, s_obs = |S_n| / √n = ${statistic}`,
    proportion: proportion => `π = ones / n = ${proportion}`,
    prerequisite: (tolerance, met) => `|π − 1/2| < 2/√n = ${tolerance}: ${met ? 'yes' : 'no'}`,
    runCount: (runs, expected) => `runs V_n = ${runs}, expected 2nπ(1 − π) = ${expected}`,
    notRun: 'Not run: π is too far from 1/2, so the test fails.',
    pass: 'pass',
    fail: 'fail',
    verdictPass: 'Both tests pass. This gives a level of confidence, not a proof.',
    verdictFail: 'At least one test fails, so the sequence is rejected as random. A sequence must pass every test.',
  },
  pt: {
    title: 'Testes de frequência e de corridas do NIST',
    intro: 'Toque em um bit para invertê-lo, ou carregue um exemplo. O sombreado marca as corridas: uma corrida é um grupo de bits iguais seguidos.',
    presets: { alternating: '0101...01', blocks: '000...111', generator: `LCG, semente ${GENERATOR_SEED}`, browser: 'crypto.getRandomValues' },
    size: `n = ${SEQUENCE_BITS} bits. A lista usa n = 1.000.000 bits, com as mesmas fórmulas. Um teste passa quando p ≥ α = ${SIGNIFICANCE_LEVEL}.`,
    frequency: 'Teste de frequência',
    runs: 'Teste de corridas',
    ones: (ones, zeros) => `uns = ${ones}, zeros = ${zeros}, esperado n/2 = ${SEQUENCE_BITS / 2}`,
    sum: (sum, statistic) => `S_n = ${sum}, s_obs = |S_n| / √n = ${statistic}`,
    proportion: proportion => `π = uns / n = ${proportion}`,
    prerequisite: (tolerance, met) => `|π − 1/2| < 2/√n = ${tolerance}: ${met ? 'sim' : 'não'}`,
    runCount: (runs, expected) => `corridas V_n = ${runs}, esperado 2nπ(1 − π) = ${expected}`,
    notRun: 'Não executado: π está longe demais de 1/2, então o teste falha.',
    pass: 'passa',
    fail: 'falha',
    verdictPass: 'Os dois testes passam. Isso dá um nível de confiança, não uma prova.',
    verdictFail: 'Pelo menos um teste falha, então a sequência é rejeitada como aleatória. Ela precisa passar em todos os testes.',
  },
}

const text = TEXT[usePageLanguage()]

function presetBits(preset: Preset): number[] {
  switch (preset) {
    case 'alternating':
      return Array.from({ length: SEQUENCE_BITS }, (_, index) => index % 2)
    case 'blocks':
      return Array.from({ length: SEQUENCE_BITS }, (_, index) => index < SEQUENCE_BITS / 2 ? 0 : 1)
    case 'generator':
      return lcgBits(GENERATOR_SEED, SEQUENCE_BITS).bits
    case 'browser':
      return bytesToBits(crypto.getRandomValues(new Uint8Array(SEQUENCE_BITS / BITS_PER_BYTE)))
  }
}

// The browser source exists only in the browser, so the server renders the generator instead.
const bits = ref(presetBits(initialPreset === 'browser' ? 'generator' : initialPreset))
const activePreset = ref<Preset | undefined>(initialPreset)

onMounted(() => {
  if (initialPreset === 'browser')
    bits.value = presetBits('browser')
})

const frequency = computed(() => frequencyTest(bits.value))
const runs = computed(() => runsTest(bits.value))
const tolerance = (2 / Math.sqrt(SEQUENCE_BITS)).toFixed(STATISTIC_DECIMALS)

/** The run each bit belongs to, counted from 0, for the alternate shading. */
const runIndices = computed(() => {
  let run = 0
  return bits.value.map((bit, index) => {
    if (index > 0 && bit !== bits.value[index - 1])
      run++
    return run
  })
})

function formatP(value: number) {
  return value < SMALLEST_SHOWN_P ? `p < ${SMALLEST_SHOWN_P}` : `p = ${value.toFixed(P_DECIMALS)}`
}

function loadPreset(preset: Preset) {
  bits.value = presetBits(preset)
  activePreset.value = preset
}

function toggleBit(index: number) {
  bits.value = bits.value.map((bit, position) => position === index ? 1 - bit : bit)
  activePreset.value = undefined
}
</script>

<template>
  <StudyFigure :title="text.title">
    <p>{{ text.intro }}</p>

    <div class="study-controls">
      <button
        v-for="preset in PRESETS"
        :key="preset"
        class="study-button study-mono"
        type="button"
        :aria-pressed="activePreset === preset"
        @click="loadPreset(preset)"
      >
        {{ text.presets[preset] }}
      </button>
    </div>

    <div class="study-bit-grid">
      <button
        v-for="(bit, index) in bits"
        :key="index"
        type="button"
        class="study-bit randomness-bit"
        :class="{ 'is-odd-run': runIndices[index] % 2 === 1 }"
        :aria-label="`bit ${index}: ${bit}`"
        @click="toggleBit(index)"
      >
        {{ bit }}
      </button>
    </div>

    <p class="study-label">
      {{ text.size }}
    </p>

    <div class="randomness-results">
      <section class="randomness-test">
        <strong>{{ text.frequency }}</strong>
        <span class="study-mono">{{ text.ones(frequency.ones, frequency.zeros) }}</span>
        <span class="study-mono">{{ text.sum(frequency.sum, frequency.statistic.toFixed(STATISTIC_DECIMALS)) }}</span>
        <span class="study-mono" :class="frequency.passed ? 'study-success' : 'study-alert'">
          {{ formatP(frequency.pValue) }}: {{ frequency.passed ? `✓ ${text.pass}` : `✗ ${text.fail}` }}
        </span>
      </section>

      <section class="randomness-test">
        <strong>{{ text.runs }}</strong>
        <span class="study-mono">{{ text.proportion(runs.proportion.toFixed(STATISTIC_DECIMALS)) }}</span>
        <span class="study-mono">{{ text.prerequisite(tolerance, runs.prerequisiteMet) }}</span>
        <div class="study-stack">
          <div class="randomness-test" :class="{ 'study-ghost': !runs.prerequisiteMet }">
            <span class="study-mono">{{ text.runCount(runs.runs, runs.expectedRuns.toFixed(EXPECTED_RUNS_DECIMALS)) }}</span>
            <span class="study-mono" :class="runs.passed ? 'study-success' : 'study-alert'">
              {{ formatP(runs.pValue) }}: {{ runs.passed ? `✓ ${text.pass}` : `✗ ${text.fail}` }}
            </span>
          </div>
          <span class="study-alert" :class="{ 'study-ghost': runs.prerequisiteMet }">✗ {{ text.notRun }}</span>
        </div>
      </section>
    </div>

    <div class="study-stack" aria-live="polite">
      <p class="study-success" :class="{ 'study-ghost': !(frequency.passed && runs.passed) }">
        {{ text.verdictPass }}
      </p>
      <p class="study-alert" :class="{ 'study-ghost': frequency.passed && runs.passed }">
        {{ text.verdictFail }}
      </p>
    </div>
  </StudyFigure>
</template>

<style scoped>
.study-bit.randomness-bit {
  height: 1.7rem;
  padding: 0;
  font: inherit;
  font-size: 0.75rem;
  background: transparent;
  cursor: pointer;

  &.is-odd-run {
    background: var(--study-mark);
    color: var(--study-accent);
  }

  &:hover {
    border-color: var(--fg-muted);
  }
}

.randomness-results {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.9rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.randomness-test {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

.randomness-results > .randomness-test {
  padding-top: 0.5rem;
  border-top: 1px dashed var(--c-border);
}
</style>
