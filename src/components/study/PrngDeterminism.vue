<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { lcgBits } from '~/lib/randomness'
import { usePageLanguage } from '~/composables/usePageLanguage'

const OUTPUT_BITS = 64
const SHOWN_STATES = 3
const DEFAULT_SEED = 2026
const LARGEST_SEED = 2 ** 32 - 1
const RUNS = [0, 1] as const

interface Text {
  title: string
  intro: string
  run: (number: number) => string
  seed: string
  nextSeed: string
  same: string
  different: (count: number) => string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'A PRNG is deterministic',
    intro: 'Two runs of the same generator, a linear congruential generator: X(n+1) = (1664525 × X(n) + 1013904223) mod 2^32. Each step gives one output bit, the top bit of X(n+1).',
    run: number => `Run ${number}`,
    seed: 'seed',
    nextSeed: 'seed + 1',
    same: `Same seed, same sequence: all ${OUTPUT_BITS} bits are equal. Anyone who knows the seed and the algorithm can reproduce the whole output.`,
    different: count => `Different seeds: ${count} of ${OUTPUT_BITS} bits differ. The seed alone decides the sequence.`,
  },
  pt: {
    title: 'Um PRNG é determinístico',
    intro: 'Duas execuções do mesmo gerador, um gerador congruencial linear: X(n+1) = (1664525 × X(n) + 1013904223) mod 2^32. Cada passo dá um bit de saída, o bit mais alto de X(n+1).',
    run: number => `Execução ${number}`,
    seed: 'semente',
    nextSeed: 'semente + 1',
    same: `Mesma semente, mesma sequência: os ${OUTPUT_BITS} bits são iguais. Quem conhece a semente e o algoritmo reproduz a saída inteira.`,
    different: count => `Sementes diferentes: ${count} de ${OUTPUT_BITS} bits diferentes. Só a semente decide a sequência.`,
  },
}

const text = TEXT[usePageLanguage()]
const seeds = ref<number[]>([DEFAULT_SEED, DEFAULT_SEED])

function validSeed(value: number) {
  return Number.isFinite(value) ? Math.min(LARGEST_SEED, Math.max(0, Math.trunc(value))) : 0
}

const outputs = computed(() => seeds.value.map(seed => lcgBits(validSeed(seed), OUTPUT_BITS)))
const differentCount = computed(() =>
  outputs.value[0].bits.filter((bit, index) => bit !== outputs.value[1].bits[index]).length)
</script>

<template>
  <StudyFigure :title="text.title">
    <p>{{ text.intro }}</p>

    <div v-for="run in RUNS" :key="run" class="prng-run">
      <div class="study-controls">
        <strong>{{ text.run(run + 1) }}</strong>
        <label class="prng-seed study-mono">
          {{ text.seed }}
          <input v-model.number="seeds[run]" type="number" inputmode="numeric" min="0" :max="LARGEST_SEED">
        </label>
        <button class="study-button" type="button" @click="seeds[run] = validSeed(seeds[run]) + 1">
          {{ text.nextSeed }}
        </button>
      </div>
      <span class="study-label study-mono prng-states">
        <template v-for="(state, index) in outputs[run].states.slice(0, SHOWN_STATES)" :key="index">X{{ index + 1 }} = {{ state }}, </template>...
      </span>
      <div class="study-bit-grid">
        <span
          v-for="(bit, index) in outputs[run].bits"
          :key="index"
          class="study-bit prng-bit"
          :class="{ 'is-alert': bit !== outputs[1 - run].bits[index] }"
        >{{ bit }}</span>
      </div>
    </div>

    <p :class="differentCount ? '' : 'study-success'" aria-live="polite">
      {{ differentCount ? text.different(differentCount) : `✓ ${text.same}` }}
    </p>
  </StudyFigure>
</template>

<style scoped>
.prng-run {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.prng-seed {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;

  input {
    width: 7.5rem;
    min-height: 2.5rem;
    padding: 0 0.5rem;
    border: 1px dashed var(--fg-muted);
    background: transparent;
    color: var(--fg-deep);
    font: inherit;
  }
}

.prng-states {
  overflow-wrap: anywhere;
}

.study-bit.prng-bit {
  height: 1.4rem;
  font-size: 0.72rem;
}
</style>
