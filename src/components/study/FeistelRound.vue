<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { toBinary } from '~/lib/bits'
import { usePageLanguage } from '~/composables/usePageLanguage'

const { initialPhase = 'encryption' } = defineProps<{ initialPhase?: Phase }>()

const HALF_WIDTH = 8
const BLOCK_WIDTH = 2 * HALF_WIDTH
const HALF_MASK = 0xFF
const GUIDE_KEY = 0b10101010
const GUIDE_BLOCK = 0b1100110010101010

type Phase = 'encryption' | 'decryption' | 'swap'

interface Row {
  label: string
  value: number
  width: number
  marked?: (index: number) => boolean
  alert?: (index: number) => boolean
  faded?: (index: number) => boolean
  editable?: 'block' | 'key'
  /** Puts an 8 bit value under the low half of a 16 bit value above it. */
  alignLow?: boolean
}

interface Values {
  block: number
  key: number
  left: number
  right: number
  product: number
  round: number
  newRight: number
  ciphertext: number
  recovered: number
  swapped: number
  swapDifference: number
}

interface Outcome {
  success: boolean
  text: string
}

interface Step {
  phase: Phase
  rows: Row[]
  caption: string
  outcome?: Outcome
}

interface Text {
  title: string
  phases: Record<Phase, string>
  step: (current: number, total: number) => string
  back: string
  next: string
  reset: string
  editHint: string
  bitsDiffer: (count: number) => string
  labels: {
    block: string
    key: string
    product: string
    ciphertext: string
    recovered: string
    swapped: string
  }
  captions: {
    input: string
    split: (values: Values) => string
    function: (values: Values) => string
    xor: (values: Values) => string
    swap: (values: Values) => string
    receive: string
    recompute: (values: Values) => string
    cancel: (values: Values) => string
    swapOnly: (values: Values) => string
  }
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'Feistel round, step by step',
    phases: { encryption: 'Encryption', decryption: 'Decryption', swap: 'The list code: only a swap' },
    step: (current, total) => `Step ${current} of ${total}`,
    back: 'Back',
    next: 'Next',
    reset: 'Use the guide values',
    editHint: 'Tap a bit of the block or of the key to change it.',
    bitsDiffer: count => `${count} of ${BLOCK_WIDTH} bits differ`,
    labels: {
      block: 'block',
      key: 'K',
      product: 'R0 × K',
      ciphertext: 'ciphertext',
      recovered: 'recovered',
      swapped: 'invertido',
    },
    captions: {
      input: 'The input is a block of 2w = 16 bits and a key K of 8 bits. These are the values of the list 3 code.',
      split: values => `Split the block into two halves of w = 8 bits: L0 = ${values.left} and R0 = ${values.right}.`,
      function: values => `F(R0, K) = (R0 × K) & 0xFF. ${values.right} × ${values.key} = ${values.product}. The mask 0xFF keeps only the low 8 bits, so F = ${values.round}.`,
      xor: values => `R1 = L0 XOR F(R0, K) = ${values.left} XOR ${values.round} = ${values.newRight}. Each 1 bit of F flips the bit of L0 above it.`,
      swap: values => `L1 = R0: the halves change places. The ciphertext is L1 followed by R1, ${toBinary(values.ciphertext, BLOCK_WIDTH)}.`,
      receive: 'Decryption receives L1 and R1. R0 = L1, so the right half of the block is back at once.',
      recompute: values => `F(L1, K) = F(R0, K) = ${values.round}. F is calculated again in the same direction. It does not have to be invertible.`,
      cancel: values => `L0 = R1 XOR F(L1, K) = ${values.newRight} XOR ${values.round} = ${values.left}. F XOR F = 0 cancels the F term, and the block comes back.`,
      swapOnly: values => values.swapDifference === 0
        ? 'The variable invertido only swaps the halves of the ciphertext. Here F = 0, so the swap gives the block by chance.'
        : `The variable invertido only swaps the halves of the ciphertext. The result is not the block: ${values.swapDifference} bits differ. A swap is not a decryption.`,
    },
  },
  pt: {
    title: 'Rodada de Feistel, passo a passo',
    phases: { encryption: 'Cifragem', decryption: 'Decifragem', swap: 'O código da lista: só uma troca' },
    step: (current, total) => `Passo ${current} de ${total}`,
    back: 'Voltar',
    next: 'Avançar',
    reset: 'Usar os valores do guia',
    editHint: 'Toque em um bit do bloco ou da chave para mudá-lo.',
    bitsDiffer: count => `${count} de ${BLOCK_WIDTH} bits diferentes`,
    labels: {
      block: 'bloco',
      key: 'K',
      product: 'R0 × K',
      ciphertext: 'cifrado',
      recovered: 'recuperado',
      swapped: 'invertido',
    },
    captions: {
      input: 'A entrada é um bloco de 2w = 16 bits e uma chave K de 8 bits. São os valores do código da lista 3.',
      split: values => `Divida o bloco em duas metades de w = 8 bits: L0 = ${values.left} e R0 = ${values.right}.`,
      function: values => `F(R0, K) = (R0 × K) & 0xFF. ${values.right} × ${values.key} = ${values.product}. A máscara 0xFF mantém só os 8 bits baixos, então F = ${values.round}.`,
      xor: values => `R1 = L0 XOR F(R0, K) = ${values.left} XOR ${values.round} = ${values.newRight}. Cada bit 1 de F inverte o bit de L0 acima dele.`,
      swap: values => `L1 = R0: as metades trocam de lugar. O cifrado é L1 seguido de R1, ${toBinary(values.ciphertext, BLOCK_WIDTH)}.`,
      receive: 'A decifragem recebe L1 e R1. R0 = L1, então a metade direita do bloco volta de imediato.',
      recompute: values => `F(L1, K) = F(R0, K) = ${values.round}. F é calculada de novo, no mesmo sentido. Ela não precisa ser inversível.`,
      cancel: values => `L0 = R1 XOR F(L1, K) = ${values.newRight} XOR ${values.round} = ${values.left}. F XOR F = 0 cancela o termo F, e o bloco volta.`,
      swapOnly: values => values.swapDifference === 0
        ? 'A variável invertido só troca as metades do cifrado. Aqui F = 0, então a troca dá o bloco por acaso.'
        : `A variável invertido só troca as metades do cifrado. O resultado não é o bloco: ${values.swapDifference} bits diferentes. Uma troca não é uma decifragem.`,
    },
  },
}

const text = TEXT[usePageLanguage()]

const block = ref(GUIDE_BLOCK)
const key = ref(GUIDE_KEY)
const stepIndex = ref(0)

function roundFunction(half: number, roundKey: number) {
  return (half * roundKey) & HALF_MASK
}

function bitOf(value: number, width: number, index: number) {
  return (value >> (width - 1 - index)) & 1
}

function countBits(value: number) {
  return toBinary(value, BLOCK_WIDTH).split('').filter(bit => bit === '1').length
}

const values = computed<Values>(() => {
  const left = block.value >> HALF_WIDTH
  const right = block.value & HALF_MASK
  const round = roundFunction(right, key.value)
  const newRight = left ^ round
  const ciphertext = (right << HALF_WIDTH) | newRight
  const receivedLeft = ciphertext >> HALF_WIDTH
  const receivedRight = ciphertext & HALF_MASK
  const recovered = ((receivedRight ^ roundFunction(receivedLeft, key.value)) << HALF_WIDTH) | receivedLeft
  const swapped = (newRight << HALF_WIDTH) | right
  return {
    block: block.value,
    key: key.value,
    left,
    right,
    product: right * key.value,
    round,
    newRight,
    ciphertext,
    recovered,
    swapped,
    swapDifference: countBits(swapped ^ block.value),
  }
})

const steps = computed<Step[]>(() => {
  const v = values.value
  const { labels, captions } = text
  const always = () => true
  const roundBitSet = (index: number) => bitOf(v.round, HALF_WIDTH, index) === 1
  return [
    {
      phase: 'encryption',
      caption: captions.input,
      rows: [
        { label: labels.block, value: v.block, width: BLOCK_WIDTH, editable: 'block' },
        { label: labels.key, value: v.key, width: HALF_WIDTH, editable: 'key' },
      ],
    },
    {
      phase: 'encryption',
      caption: captions.split(v),
      rows: [
        { label: 'L0', value: v.left, width: HALF_WIDTH, marked: always },
        { label: 'R0', value: v.right, width: HALF_WIDTH, marked: always },
      ],
    },
    {
      phase: 'encryption',
      caption: captions.function(v),
      rows: [
        { label: 'R0', value: v.right, width: HALF_WIDTH },
        { label: labels.key, value: v.key, width: HALF_WIDTH },
        { label: labels.product, value: v.product, width: BLOCK_WIDTH, faded: index => index < HALF_WIDTH },
        { label: 'F', value: v.round, width: HALF_WIDTH, marked: always, alignLow: true },
      ],
    },
    {
      phase: 'encryption',
      caption: captions.xor(v),
      rows: [
        { label: 'L0', value: v.left, width: HALF_WIDTH },
        { label: 'F', value: v.round, width: HALF_WIDTH, marked: roundBitSet },
        { label: 'R1', value: v.newRight, width: HALF_WIDTH, marked: roundBitSet },
      ],
    },
    {
      phase: 'encryption',
      caption: captions.swap(v),
      rows: [
        { label: 'L1 = R0', value: v.right, width: HALF_WIDTH },
        { label: 'R1', value: v.newRight, width: HALF_WIDTH },
        { label: labels.ciphertext, value: v.ciphertext, width: BLOCK_WIDTH, marked: always },
      ],
    },
    {
      phase: 'decryption',
      caption: captions.receive,
      rows: [
        { label: labels.ciphertext, value: v.ciphertext, width: BLOCK_WIDTH },
        { label: 'L1', value: v.right, width: HALF_WIDTH },
        { label: 'R1', value: v.newRight, width: HALF_WIDTH },
        { label: 'R0 = L1', value: v.right, width: HALF_WIDTH, marked: always },
      ],
    },
    {
      phase: 'decryption',
      caption: captions.recompute(v),
      rows: [
        { label: 'L1', value: v.right, width: HALF_WIDTH },
        { label: labels.key, value: v.key, width: HALF_WIDTH },
        { label: 'F', value: v.round, width: HALF_WIDTH, marked: always },
      ],
    },
    {
      phase: 'decryption',
      caption: captions.cancel(v),
      outcome: { success: v.recovered === v.block, text: `${labels.recovered} = ${labels.block}` },
      rows: [
        { label: 'R1', value: v.newRight, width: HALF_WIDTH },
        { label: 'F', value: v.round, width: HALF_WIDTH, marked: roundBitSet },
        { label: 'L0', value: v.left, width: HALF_WIDTH, marked: roundBitSet },
        { label: labels.recovered, value: v.recovered, width: BLOCK_WIDTH, marked: always },
      ],
    },
    {
      phase: 'swap',
      caption: captions.swapOnly(v),
      outcome: {
        success: v.swapDifference === 0,
        text: `${labels.swapped} ${v.swapDifference === 0 ? '=' : '≠'} ${labels.block}, ${text.bitsDiffer(v.swapDifference)}`,
      },
      rows: [
        { label: labels.ciphertext, value: v.ciphertext, width: BLOCK_WIDTH },
        {
          label: labels.swapped,
          value: v.swapped,
          width: BLOCK_WIDTH,
          alert: index => bitOf(v.swapped, BLOCK_WIDTH, index) !== bitOf(v.block, BLOCK_WIDTH, index),
        },
        { label: labels.block, value: v.block, width: BLOCK_WIDTH },
      ],
    },
  ]
})

stepIndex.value = steps.value.findIndex(item => item.phase === initialPhase)

const step = computed(() => steps.value[stepIndex.value])
const isEdited = computed(() => block.value !== GUIDE_BLOCK || key.value !== GUIDE_KEY)

function toggleBit(row: Row, index: number) {
  const shift = row.width - 1 - index
  if (row.editable === 'block')
    block.value ^= 1 << shift
  else if (row.editable === 'key')
    key.value ^= 1 << shift
}

function resetValues() {
  block.value = GUIDE_BLOCK
  key.value = GUIDE_KEY
}
</script>

<template>
  <StudyFigure :title="text.title">
    <div class="study-controls feistel-navigation">
      <button class="study-button" type="button" :disabled="stepIndex === 0" @click="stepIndex--">
        {{ text.back }}
      </button>
      <span class="study-label" aria-live="polite">
        {{ text.step(stepIndex + 1, steps.length) }}: {{ text.phases[step.phase] }}
      </span>
      <button class="study-button" type="button" :disabled="stepIndex === steps.length - 1" @click="stepIndex++">
        {{ text.next }}
      </button>
    </div>

    <div class="feistel-progress" aria-hidden="true">
      <span
        v-for="(item, index) in steps"
        :key="index"
        class="feistel-progress-step"
        :class="[`is-${item.phase}`, { 'is-current': index === stepIndex, 'is-done': index < stepIndex }]"
      />
    </div>

    <div class="feistel-rows">
      <div v-for="row in step.rows" :key="row.label" class="feistel-row">
        <span class="feistel-row-label study-mono">{{ row.label }}</span>
        <span class="study-bits" :class="{ 'feistel-block': row.width === BLOCK_WIDTH, 'is-low-aligned': row.alignLow }">
          <component
            :is="row.editable ? 'button' : 'span'"
            v-for="(bit, index) in toBinary(row.value, row.width)"
            :key="index"
            class="study-bit"
            :class="{
              'is-marked': row.marked?.(index),
              'is-alert': row.alert?.(index),
              'is-faded': row.faded?.(index),
              'is-editable': row.editable,
            }"
            :type="row.editable ? 'button' : undefined"
            @click="row.editable && toggleBit(row, index)"
          >{{ bit }}</component>
        </span>
        <span class="feistel-row-value study-mono">{{ row.width === HALF_WIDTH ? row.value : '' }}</span>
      </div>
    </div>

    <p class="feistel-caption">
      {{ step.caption }}
    </p>

    <p v-if="step.outcome" class="study-mono" :class="step.outcome.success ? 'study-success' : 'study-alert'">
      {{ step.outcome.success ? '✓' : '✗' }} {{ step.outcome.text }}
    </p>

    <div v-if="stepIndex === 0" class="study-controls">
      <span class="study-label">{{ text.editHint }}</span>
      <button v-if="isEdited" class="study-button" type="button" @click="resetValues">
        {{ text.reset }}
      </button>
    </div>
  </StudyFigure>
</template>

<style scoped>
.feistel-navigation {
  justify-content: space-between;

  .study-label {
    flex: 1;
    text-align: center;
  }
}

.feistel-progress {
  display: flex;
  gap: 3px;
}

.feistel-progress-step {
  flex: 1;
  height: 4px;
  background: var(--c-border-soft);
  transition: background-color 0.3s;

  &.is-done {
    background: var(--c-border);
  }

  &.is-current {
    background: var(--fg-deep);
  }

  &.is-swap.is-current {
    background: var(--study-alert);
  }
}

.feistel-rows {
  display: grid;
  grid-template-columns: 5.5rem max-content 1fr;
  gap: 0.45rem 0.5rem;
  align-items: center;
  min-height: 8.5rem;
  align-content: start;
}

.feistel-row {
  display: contents;
}

.feistel-row-label {
  font-size: 0.8rem;
  color: var(--fg-muted);
  text-align: right;
}

.feistel-row-value {
  font-size: 0.8rem;
  color: var(--fg-muted);
}

/* A gap between the two halves of a 16 bit value */
.feistel-block > :nth-child(8) {
  margin-right: 0.4rem;

  @media (max-width: 480px) {
    margin-right: 0.25rem;
  }
}

.is-low-aligned {
  justify-self: end;
}

.study-bit.is-editable {
  cursor: pointer;
  border-style: dashed;
  border-color: var(--fg-muted);
  background: transparent;
  font: inherit;
}

.feistel-caption {
  min-height: 4.4em;
}

@media (max-width: 480px) {
  .feistel-rows {
    grid-template-columns: max-content 1fr;
    row-gap: 0.15rem;
  }

  .feistel-row-label {
    grid-column: 1 / -1;
    margin-top: 0.3rem;
    text-align: left;
  }

  .feistel-row-value {
    display: none;
  }

  .study-bit.is-editable {
    height: 2rem;
  }
}
</style>
