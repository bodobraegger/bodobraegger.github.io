<script setup lang="ts">
import type { AesKeys } from '~/lib/aes'
import type { Language } from '~/logics/languages'
import { AES_BLOCK_BYTES, AES_KEY_BYTES, encryptCbc, encryptCtr, importAesKeys } from '~/lib/aes'
import { BITS_PER_BYTE, bytesToHex, randomBytes } from '~/lib/bits'
import { useWebCrypto } from '~/composables/useWebCrypto'
import { usePageLanguage } from '~/composables/usePageLanguage'

const HARVEST_BITS = 512
const HARVEST_COLUMNS = 32
const BLOCK_BITS = AES_BLOCK_BYTES * BITS_PER_BYTE
const HARVEST_BLOCKS = HARVEST_BITS / BLOCK_BITS
const SAMPLES_PER_SEED = 511
const SHOWN_SAMPLES = 3
const PREFIX_BYTES = 3
const RDRAND_BYTES = 8

/** The conditioner key is fixed in the hardware and not public; the figure uses the key of the FIPS-197 example. */
const CONDITIONER_KEY = Uint8Array.from({ length: AES_KEY_BYTES }, (_, index) => index)
const ZERO_IV = new Uint8Array(AES_BLOCK_BYTES)

const TRACE_WIDTH = 240
const TRACE_HEIGHT = 80
const TRACE_MARGIN = 10
const TRACE_POINTS = 60
const NOISE_POINTS = 24
const NOISE_AMPLITUDE = 0.06
const DECAY_RATE = 0.22
const PULSE_MILLISECONDS = 1800
const PLAY_MILLISECONDS = 1400
const PLAY_HARVEST_BITS = 64
const PLAY_SLOW_SAMPLES = 3
const PLAY_FAST_SAMPLES = 64

type Stage = 'harvest' | 'condition' | 'generate'
const STAGES: Stage[] = ['harvest', 'condition', 'generate']

interface Text {
  title: string
  intro: string
  stageNames: Record<Stage, string>
  stageFacts: Record<Stage, string>
  stageLabel: (number: number) => string
  metastable: string
  decayed: (bit: number) => string
  harvest: (count: number) => string
  pulse: string
  fillHarvest: string
  harvestExplanation: string
  chainExplanation: string
  discarded: string
  kept: string
  nextBlock: string
  conditionDone: string
  seedExplanation: (seedNumber: number) => string
  counter: string
  samples: (count: number) => string
  nextSample: string
  runToLimit: string
  reseed: string
  limitReached: string
  rdrand: string
  play: string
  pause: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'Intel DRNG: from thermal noise to RDRAND',
    intro: 'Step through the three stages. Stage 1 makes raw bits, stage 2 removes their bias, stage 3 makes many fast outputs from one seed.',
    stageNames: { harvest: 'Entropy source', condition: 'Conditioner (AES-CBC-MAC)', generate: 'CTR_DRBG' },
    stageFacts: {
      harvest: '4 Gbps, harvested in 512 bit blocks',
      condition: 'AES-CBC-MAC, 256 bits without bias',
      generate: '128 bit outputs, > 3 Gbps, 511 per seed',
    },
    stageLabel: number => `Stage ${number}`,
    metastable: 'Clock pulse: both inverters are in the metastable state.',
    decayed: bit => `Thermal noise decided: the circuit decayed to ${bit}.`,
    harvest: count => `Harvest: ${count} of ${HARVEST_BITS} bits`,
    pulse: 'Clock pulse (1 bit)',
    fillHarvest: `Harvest ${HARVEST_BITS} bits`,
    harvestExplanation: 'Two inverters (NOT gates) feed each other. A clock pulse forces them into the metastable state, between 0 and 1. Thermal noise pushes the node to one side, and the circuit decays to that stable state.',
    chainExplanation: `The ${HARVEST_BITS} bits are ${HARVEST_BLOCKS} AES blocks. CBC chains each block into the next, so the last block depends on all ${HARVEST_BITS} bits.`,
    discarded: 'discarded',
    kept: 'kept (the MAC)',
    nextBlock: 'Next AES block',
    conditionDone: 'Only the last ciphertext block is the output: 128 bits without bias. A second chain gives 128 more, and the two make the seed of stage 3.',
    seedExplanation: seedNumber => `Seed ${seedNumber} (256 bits from stage 2) sets the AES key K and the counter V. Each output is AES with key K on the next counter value.`,
    counter: 'counter',
    samples: count => `${count} of ${SAMPLES_PER_SEED} samples from this seed`,
    nextSample: 'Next sample',
    runToLimit: `Run to ${SAMPLES_PER_SEED}`,
    reseed: 'Reseed',
    limitReached: `Limit reached: after ${SAMPLES_PER_SEED} samples the DRNG takes a new seed from stages 1 and 2.`,
    rdrand: 'rdrand rax: CF = 1 (success), RAX =',
    play: 'Play',
    pause: 'Pause',
  },
  pt: {
    title: 'Intel DRNG: do ruído térmico ao RDRAND',
    intro: 'Avance pelos três estágios. O estágio 1 gera bits brutos, o estágio 2 remove o viés, o estágio 3 gera muitas saídas rápidas a partir de uma semente.',
    stageNames: { harvest: 'Fonte de entropia', condition: 'Condicionador (AES-CBC-MAC)', generate: 'CTR_DRBG' },
    stageFacts: {
      harvest: '4 Gbps, colhida em blocos de 512 bits',
      condition: 'AES-CBC-MAC, 256 bits não enviesados',
      generate: 'saídas de 128 bits, > 3 Gbps, 511 por semente',
    },
    stageLabel: number => `Estágio ${number}`,
    metastable: 'Pulso de clock: os dois inversores estão no estado metaestável.',
    decayed: bit => `O ruído térmico decidiu: o circuito decaiu para ${bit}.`,
    harvest: count => `Colheita: ${count} de ${HARVEST_BITS} bits`,
    pulse: 'Pulso de clock (1 bit)',
    fillHarvest: `Colher ${HARVEST_BITS} bits`,
    harvestExplanation: 'Dois inversores (portas NOT) alimentam um ao outro. Um pulso de clock força os dois para o estado metaestável, entre 0 e 1. O ruído térmico empurra o nó para um lado, e o circuito decai para esse estado estável.',
    chainExplanation: `Os ${HARVEST_BITS} bits são ${HARVEST_BLOCKS} blocos AES. O CBC encadeia cada bloco no próximo, então o último bloco depende de todos os ${HARVEST_BITS} bits.`,
    discarded: 'descartado',
    kept: 'mantido (o MAC)',
    nextBlock: 'Próximo bloco AES',
    conditionDone: 'Só o último bloco cifrado é a saída: 128 bits não enviesados. Uma segunda cadeia dá mais 128, e as duas formam a semente do estágio 3.',
    seedExplanation: seedNumber => `A semente ${seedNumber} (256 bits do estágio 2) define a chave AES K e o contador V. Cada saída é o AES com a chave K no próximo valor do contador.`,
    counter: 'contador',
    samples: count => `${count} de ${SAMPLES_PER_SEED} amostras desta semente`,
    nextSample: 'Próxima amostra',
    runToLimit: `Avançar até ${SAMPLES_PER_SEED}`,
    reseed: 'Ressementear',
    limitReached: `Limite atingido: depois de ${SAMPLES_PER_SEED} amostras o DRNG pega uma nova semente dos estágios 1 e 2.`,
    rdrand: 'rdrand rax: CF = 1 (sucesso), RAX =',
    play: 'Reproduzir',
    pause: 'Pausar',
  },
}

const text = TEXT[usePageLanguage()]

const isSupported = useWebCrypto()
const stage = ref<Stage>('harvest')
const harvest = ref<number[]>([])
const trace = ref<number[]>([])
const isMetastable = ref(false)
const lastBit = ref<number>()
const traceKey = ref(0)
const chainBlocks = shallowRef<Uint8Array[]>([])
const processedBlocks = ref(0)
const seedNumber = ref(0)
/** All 511 outputs of the current seed, computed at once in `seed()`. */
const outputs = shallowRef<Uint8Array[]>([])
const sampleCount = ref(0)

let conditionerKeys: AesKeys | undefined

function randomBit() {
  return randomBytes(1)[0] & 1
}

function packBits(bits: number[]): Uint8Array {
  const bytes = new Uint8Array(bits.length / BITS_PER_BYTE)
  bits.forEach((bit, index) => {
    bytes[Math.floor(index / BITS_PER_BYTE)] |= bit << (BITS_PER_BYTE - 1 - index % BITS_PER_BYTE)
  })
  return bytes
}

/**
 * The node voltage (0 to 1) after a clock pulse: it holds near 1/2 while the
 * noise wanders, then diverges exponentially to the side where the noise left it.
 */
function metastableTrace(): { points: number[], bit: number } {
  const noise = [...randomBytes(NOISE_POINTS)].map(byte => (byte / 255 - 0.5) * 2 * NOISE_AMPLITUDE)
  const points = noise.map(value => 0.5 + value)
  const offset = points.at(-1)! - 0.5
  const bit = offset >= 0 ? 1 : 0
  let distance = Math.max(Math.abs(offset), NOISE_AMPLITUDE / 4)
  while (points.length < TRACE_POINTS) {
    distance = Math.min(0.5, distance * (1 + DECAY_RATE) + 0.005)
    points.push(bit ? 0.5 + distance : 0.5 - distance)
  }
  return { points, bit }
}

const tracePath = computed(() => trace.value.map((value, index) => {
  const x = TRACE_MARGIN + index * (TRACE_WIDTH - 2 * TRACE_MARGIN) / (TRACE_POINTS - 1)
  const y = TRACE_HEIGHT - TRACE_MARGIN - value * (TRACE_HEIGHT - 2 * TRACE_MARGIN)
  return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
}).join(' '))

let pulseTimer: ReturnType<typeof setTimeout> | undefined

function clockPulse() {
  const { points, bit } = metastableTrace()
  trace.value = points
  traceKey.value++
  isMetastable.value = true
  clearTimeout(pulseTimer)
  pulseTimer = setTimeout(() => {
    isMetastable.value = false
    lastBit.value = bit
  }, PULSE_MILLISECONDS)
  addBits([bit])
}

function addBits(bits: number[]) {
  if (harvest.value.length === HARVEST_BITS)
    return
  harvest.value = [...harvest.value, ...bits].slice(0, HARVEST_BITS)
  if (harvest.value.length === HARVEST_BITS)
    startConditioning()
}

/** The first row of each 128 bit AES block of stage 2, after the first block. */
function isBlockStart(bitIndex: number) {
  return bitIndex >= BLOCK_BITS && bitIndex % BLOCK_BITS < HARVEST_COLUMNS
}

function fillHarvest() {
  const missing = HARVEST_BITS - harvest.value.length
  addBits(Array.from({ length: missing }, randomBit))
}

async function startConditioning() {
  conditionerKeys ??= await importAesKeys(CONDITIONER_KEY)
  const ciphertext = await encryptCbc(conditionerKeys, ZERO_IV, packBits(harvest.value))
  chainBlocks.value = Array.from({ length: HARVEST_BLOCKS }, (_, index) =>
    ciphertext.slice(index * AES_BLOCK_BYTES, (index + 1) * AES_BLOCK_BYTES))
  processedBlocks.value = 0
  stage.value = 'condition'
}

function nextBlock() {
  processedBlocks.value = Math.min(HARVEST_BLOCKS, processedBlocks.value + 1)
}

const isChainDone = computed(() => processedBlocks.value === HARVEST_BLOCKS)

/** CTR_DRBG increments the 128 bit counter V before each AES call. */
function incrementCounter(counter: Uint8Array): Uint8Array {
  const next = counter.slice()
  for (let index = next.length - 1; index >= 0; index--) {
    next[index] = (next[index] + 1) & 0xFF
    if (next[index])
      break
  }
  return next
}

const counterStart = shallowRef<Uint8Array>(new Uint8Array(AES_BLOCK_BYTES))

async function seed() {
  // The real seed comes out of the conditioner; its bits are not shown, so random bytes stand in for it.
  const keys = await importAesKeys(randomBytes(AES_KEY_BYTES))
  counterStart.value = randomBytes(AES_BLOCK_BYTES)
  const keystream = await encryptCtr(keys, incrementCounter(counterStart.value), new Uint8Array(SAMPLES_PER_SEED * AES_BLOCK_BYTES))
  outputs.value = Array.from({ length: SAMPLES_PER_SEED }, (_, index) =>
    keystream.slice(index * AES_BLOCK_BYTES, (index + 1) * AES_BLOCK_BYTES))
  seedNumber.value++
  sampleCount.value = 0
  stage.value = 'generate'
}

function addSamples(count: number) {
  sampleCount.value = Math.min(SAMPLES_PER_SEED, sampleCount.value + count)
}

const isLimitReached = computed(() => sampleCount.value === SAMPLES_PER_SEED)
const shownSamples = computed(() => Array.from({ length: Math.min(SHOWN_SAMPLES, sampleCount.value) }, (_, offset) => {
  const number = sampleCount.value - offset
  return { number, hex: bytesToHex(outputs.value[number - 1]) }
}))
const rdrandValue = computed(() => sampleCount.value
  ? bytesToHex(outputs.value[sampleCount.value - 1].subarray(0, RDRAND_BYTES))
  : '')

function reseed() {
  harvest.value = []
  trace.value = []
  lastBit.value = undefined
  processedBlocks.value = 0
  stage.value = 'harvest'
}

function prefix(bytes: Uint8Array) {
  return `${bytesToHex(bytes.subarray(0, PREFIX_BYTES))}…`
}

const harvestBlockPrefixes = computed(() => harvest.value.length === HARVEST_BITS
  ? Array.from({ length: HARVEST_BLOCKS }, (_, index) =>
      prefix(packBits(harvest.value.slice(index * BLOCK_BITS, (index + 1) * BLOCK_BITS))))
  : [])

function playStep() {
  if (stage.value === 'harvest') {
    if (!harvest.value.length || !isMetastable.value)
      clockPulse()
    addBits(Array.from({ length: PLAY_HARVEST_BITS }, randomBit))
  }
  else if (stage.value === 'condition') {
    if (isChainDone.value)
      seed()
    else
      nextBlock()
  }
  else if (isLimitReached.value) {
    reseed()
  }
  else {
    addSamples(sampleCount.value < PLAY_SLOW_SAMPLES ? 1 : PLAY_FAST_SAMPLES)
  }
}

const { isActive: isPlaying, pause, resume } = useIntervalFn(playStep, PLAY_MILLISECONDS, { immediate: false })

function togglePlay() {
  if (isPlaying.value) {
    pause()
  }
  else {
    playStep()
    resume()
  }
}

onBeforeUnmount(() => clearTimeout(pulseTimer))

/* The CBC chain diagram: one column per AES block. */
const CHAIN_WIDTH = 400
const CHAIN_HEIGHT = 190
const COLUMN_WIDTH = CHAIN_WIDTH / HARVEST_BLOCKS
const BOX_WIDTH = 72
const ROW_MESSAGE = 22
const ROW_XOR = 62
const ROW_AES = 104
const ROW_CIPHER = 150
const XOR_RADIUS = 9
const columns = Array.from({ length: HARVEST_BLOCKS }, (_, index) => ({
  index,
  center: COLUMN_WIDTH * index + COLUMN_WIDTH / 2,
}))
</script>

<template>
  <StudyFigure :title="text.title" class="drng" :unsupported="!isSupported">
    <p>{{ text.intro }}</p>

    <div class="drng-stages" role="list">
      <div
        v-for="(name, index) in STAGES"
        :key="name"
        class="drng-stage"
        :class="{ 'is-active': stage === name }"
        role="listitem"
        :aria-current="stage === name ? 'step' : undefined"
      >
        <span class="study-label study-mono">{{ text.stageLabel(index + 1) }}</span>
        <strong>{{ text.stageNames[name] }}</strong>
        <span class="study-label">{{ text.stageFacts[name] }}</span>
      </div>
    </div>

    <div class="study-stack">
      <div class="drng-panel" :class="{ 'study-ghost': stage !== 'harvest' }" :inert="stage !== 'harvest' || undefined">
        <p>{{ text.harvestExplanation }}</p>
        <div class="drng-circuit">
          <svg viewBox="0 0 160 80" class="drng-inverters" role="img" :aria-label="text.stageNames.harvest">
            <g class="drng-wire" :class="{ 'is-metastable': isMetastable }">
              <path d="M30,20 H130 V60 H30 Z" fill="none" />
            </g>
            <g class="drng-gate">
              <path d="M68,10 L88,20 L68,30 Z" />
              <circle cx="91" cy="20" r="3" />
              <path d="M92,50 L72,60 L92,70 Z" />
              <circle cx="69" cy="60" r="3" />
            </g>
            <text x="30" y="14" class="drng-node">A</text>
            <text x="126" y="76" class="drng-node">B</text>
            <text x="48" y="45" class="drng-node-value" :class="{ 'is-metastable': isMetastable }">
              {{ isMetastable ? '½' : lastBit ?? '' }}
            </text>
            <text x="112" y="45" class="drng-node-value" :class="{ 'is-metastable': isMetastable }">
              {{ isMetastable ? '½' : lastBit === undefined ? '' : 1 - lastBit }}
            </text>
          </svg>
          <svg :viewBox="`0 0 ${TRACE_WIDTH} ${TRACE_HEIGHT}`" class="drng-trace" aria-hidden="true">
            <line :x1="TRACE_MARGIN" :x2="TRACE_WIDTH - TRACE_MARGIN" :y1="TRACE_HEIGHT / 2" :y2="TRACE_HEIGHT / 2" class="drng-trace-middle" />
            <text x="0" :y="TRACE_MARGIN + 3" class="drng-trace-label">1</text>
            <text x="0" :y="TRACE_HEIGHT / 2 + 3" class="drng-trace-label">½</text>
            <text x="0" :y="TRACE_HEIGHT - TRACE_MARGIN + 3" class="drng-trace-label">0</text>
            <path v-if="trace.length" :key="traceKey" :d="tracePath" pathLength="1" class="drng-trace-line" />
          </svg>
        </div>
        <div class="study-stack" aria-live="polite">
          <p class="study-label" :class="{ 'study-ghost': !isMetastable }">
            {{ text.metastable }}
          </p>
          <p class="study-label" :class="{ 'study-ghost': isMetastable || lastBit === undefined }">
            {{ text.decayed(lastBit ?? 0) }}
          </p>
        </div>
        <span class="study-label study-mono">{{ text.harvest(harvest.length) }}</span>
        <div class="drng-harvest" :style="{ '--columns': HARVEST_COLUMNS }">
          <span
            v-for="index in HARVEST_BITS"
            :key="index"
            class="drng-harvest-bit"
            :class="{
              'is-one': harvest[index - 1] === 1,
              'is-zero': harvest[index - 1] === 0,
              'is-block-start': isBlockStart(index - 1),
            }"
          />
        </div>
        <div class="study-controls">
          <button class="study-button" type="button" :disabled="!isSupported || isPlaying" @click="clockPulse">
            {{ text.pulse }}
          </button>
          <button class="study-button" type="button" :disabled="!isSupported || isPlaying" @click="fillHarvest">
            {{ text.fillHarvest }}
          </button>
        </div>
      </div>

      <div class="drng-panel" :class="{ 'study-ghost': stage !== 'condition' }" :inert="stage !== 'condition' || undefined">
        <p>{{ text.chainExplanation }}</p>
        <svg :viewBox="`0 0 ${CHAIN_WIDTH} ${CHAIN_HEIGHT}`" class="drng-chain" role="img" :aria-label="text.stageNames.condition">
          <g
            v-for="column in columns"
            :key="column.index"
            class="drng-column"
            :class="{
              'is-done': column.index < processedBlocks,
              'is-kept': isChainDone && column.index === HARVEST_BLOCKS - 1,
              'is-discarded': isChainDone && column.index < HARVEST_BLOCKS - 1,
            }"
          >
            <rect :x="column.center - BOX_WIDTH / 2" :y="ROW_MESSAGE - 14" :width="BOX_WIDTH" height="28" class="drng-box" />
            <text :x="column.center" :y="ROW_MESSAGE - 2" class="drng-box-title">m{{ column.index + 1 }}</text>
            <text :x="column.center" :y="ROW_MESSAGE + 10" class="drng-box-value">{{ harvestBlockPrefixes[column.index] }}</text>
            <line :x1="column.center" :x2="column.center" :y1="ROW_MESSAGE + 14" :y2="ROW_XOR - XOR_RADIUS" class="drng-arrow" />
            <text v-if="!column.index" :x="column.center - XOR_RADIUS - 4" :y="ROW_XOR + 3" class="drng-box-note drng-iv">IV = 0</text>
            <circle :cx="column.center" :cy="ROW_XOR" :r="XOR_RADIUS" class="drng-xor" />
            <path :d="`M${column.center - XOR_RADIUS},${ROW_XOR} h${2 * XOR_RADIUS} M${column.center},${ROW_XOR - XOR_RADIUS} v${2 * XOR_RADIUS}`" class="drng-xor" />
            <line :x1="column.center" :x2="column.center" :y1="ROW_XOR + XOR_RADIUS" :y2="ROW_AES - 12" class="drng-arrow" />
            <rect :x="column.center - BOX_WIDTH / 2" :y="ROW_AES - 12" :width="BOX_WIDTH" height="24" class="drng-box drng-aes" />
            <text :x="column.center" :y="ROW_AES + 4" class="drng-box-title">AES</text>
            <line :x1="column.center" :x2="column.center" :y1="ROW_AES + 12" :y2="ROW_CIPHER - 14" class="drng-arrow" />
            <rect :x="column.center - BOX_WIDTH / 2" :y="ROW_CIPHER - 14" :width="BOX_WIDTH" height="28" class="drng-box drng-cipher" />
            <text :x="column.center" :y="ROW_CIPHER - 2" class="drng-box-title">c{{ column.index + 1 }}</text>
            <text :x="column.center" :y="ROW_CIPHER + 10" class="drng-box-value">
              {{ column.index < processedBlocks ? prefix(chainBlocks[column.index]) : '' }}
            </text>
            <text :x="column.center" :y="ROW_CIPHER + 30" class="drng-box-note">
              {{ isChainDone ? (column.index === HARVEST_BLOCKS - 1 ? text.kept : text.discarded) : '' }}
            </text>
            <path
              v-if="column.index < HARVEST_BLOCKS - 1"
              :d="`M${column.center + BOX_WIDTH / 2},${ROW_CIPHER} H${column.center + COLUMN_WIDTH / 2} V${ROW_XOR} H${column.center + COLUMN_WIDTH - XOR_RADIUS}`"
              class="drng-arrow drng-feed"
              fill="none"
            />
          </g>
        </svg>
        <p class="study-success" :class="{ 'study-ghost': !isChainDone }" aria-live="polite">
          ✓ {{ text.conditionDone }}
        </p>
        <div class="study-controls">
          <button v-if="!isChainDone" class="study-button" type="button" :disabled="isPlaying" @click="nextBlock">
            {{ text.nextBlock }}
          </button>
          <button v-else class="study-button" type="button" :disabled="isPlaying" @click="seed">
            {{ text.stageLabel(3) }} →
          </button>
        </div>
      </div>

      <div class="drng-panel" :class="{ 'study-ghost': stage !== 'generate' }" :inert="stage !== 'generate' || undefined">
        <p>{{ text.seedExplanation(seedNumber) }}</p>
        <div class="drng-counter study-mono">
          <span class="study-label">{{ text.counter }}</span>
          <span>V + {{ Math.max(1, sampleCount) }}</span>
          <span aria-hidden="true">→</span>
          <span class="drng-counter-aes">AES<sub>K</sub></span>
          <span aria-hidden="true">→</span>
          <span>128 bits</span>
        </div>
        <div class="drng-samples study-mono">
          <span v-for="sample in shownSamples" :key="sample.number" :class="{ 'is-latest': sample.number === sampleCount }">
            <span class="study-label">#{{ sample.number }}</span> {{ sample.hex }}
          </span>
        </div>
        <div class="drng-progress" role="progressbar" :aria-valuenow="sampleCount" aria-valuemin="0" :aria-valuemax="SAMPLES_PER_SEED">
          <span :style="{ width: `${sampleCount / SAMPLES_PER_SEED * 100}%` }" :class="{ 'is-full': isLimitReached }" />
        </div>
        <span class="study-label study-mono" aria-live="polite">{{ text.samples(sampleCount) }}</span>
        <p class="study-mono drng-rdrand" :class="{ 'study-ghost': !rdrandValue }">
          {{ text.rdrand }} <span class="study-success">{{ rdrandValue || '0'.repeat(RDRAND_BYTES * 2) }}</span>
        </p>
        <p class="study-alert" :class="{ 'study-ghost': !isLimitReached }">
          {{ text.limitReached }}
        </p>
        <div class="study-controls">
          <template v-if="!isLimitReached">
            <button class="study-button" type="button" :disabled="isPlaying" @click="addSamples(1)">
              {{ text.nextSample }}
            </button>
            <button class="study-button" type="button" :disabled="isPlaying" @click="addSamples(SAMPLES_PER_SEED)">
              {{ text.runToLimit }}
            </button>
          </template>
          <button v-else class="study-button" type="button" :disabled="isPlaying" @click="reseed">
            {{ text.reseed }}
          </button>
        </div>
      </div>
    </div>

    <div class="study-controls">
      <button class="study-button" type="button" :aria-pressed="isPlaying" :disabled="!isSupported" @click="togglePlay">
        {{ isPlaying ? text.pause : text.play }}
      </button>
    </div>
  </StudyFigure>
</template>

<style scoped>
.drng {
  min-width: 0;
}

.drng-stages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.4rem;
}

.drng-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0.6rem;
  border: 1px dashed var(--c-border);
  opacity: 0.6;
  transition:
    opacity 0.6s,
    border-color 0.6s,
    background-color 0.6s;

  &.is-active {
    border: 1px solid var(--study-accent);
    background: var(--study-mark);
    opacity: 1;
  }

  & + &::before {
    content: '→';
    position: absolute;
    top: 50%;
    left: -1.1rem;
    transform: translateY(-50%);
    color: var(--fg-muted);
  }
}

.drng-panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
}

.drng-circuit {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: 0.8rem;
  align-items: center;
}

.drng-inverters,
.drng-trace,
.drng-chain {
  width: 100%;
  height: auto;
  overflow: visible;
}

.drng-wire path {
  stroke: var(--fg-muted);
  stroke-width: 1.5;
  transition: stroke 0.6s;
}

.drng-wire.is-metastable path {
  stroke: var(--study-alert);
  stroke-dasharray: 3 3;
}

.drng-gate {
  fill: var(--c-bg);
  stroke: var(--fg-deep);
  stroke-width: 1.5;
}

.drng-node,
.drng-node-value,
.drng-trace-label {
  font-family: var(--fonts-mono);
  fill: var(--fg-muted);
}

.drng-node {
  font-size: 9px;
}

.drng-node-value {
  font-size: 13px;
  text-anchor: middle;
  fill: var(--study-accent);

  &.is-metastable {
    fill: var(--study-alert);
  }
}

.drng-trace-label {
  font-size: 8px;
}

.drng-trace-middle {
  stroke: var(--c-border);
  stroke-dasharray: 2 3;
}

.drng-trace-line {
  fill: none;
  stroke: var(--study-accent);
  stroke-width: 1.5;
  stroke-dasharray: 1;
  animation: drng-draw 1.8s ease-in forwards;
}

@keyframes drng-draw {
  from {
    stroke-dashoffset: 1;
  }

  to {
    stroke-dashoffset: 0;
  }
}

.drng-harvest {
  display: grid;
  max-width: 30rem;
  grid-template-columns: repeat(var(--columns), minmax(0, 1fr));
  gap: 1px;
}

.drng-harvest-bit {
  aspect-ratio: 1;
  border: 1px solid var(--c-border-soft);
  transition: background-color 0.4s;

  &.is-one {
    border-color: var(--study-accent);
    background: var(--study-accent);
  }

  &.is-zero {
    background: var(--study-mark);
  }
}

.drng-harvest-bit.is-block-start {
  margin-top: 3px;
}

.drng-box {
  fill: transparent;
  stroke: var(--c-border);
  stroke-dasharray: 3 2;
  transition:
    stroke 0.6s,
    fill 0.6s;
}

.drng-box-title,
.drng-box-value,
.drng-box-note {
  font-family: var(--fonts-mono);
  text-anchor: middle;
  fill: var(--fg-deep);
}

.drng-box-title {
  font-size: 11px;
}

.drng-box-value {
  font-size: 9px;
  fill: var(--fg-muted);
}

.drng-box-note {
  font-size: 9px;
  fill: var(--fg-muted);
}

.drng-iv {
  text-anchor: end;
}

.drng-arrow,
.drng-xor {
  stroke: var(--fg-muted);
  stroke-width: 1.2;
  fill: none;
}

.drng-column {
  transition: opacity 0.6s;

  &.is-done {
    .drng-box {
      stroke: var(--study-accent);
      stroke-dasharray: none;
    }

    .drng-aes {
      fill: var(--study-mark);
    }
  }

  &.is-discarded {
    .drng-cipher {
      stroke: var(--fg-muted);
      stroke-dasharray: 3 2;
    }

    .drng-cipher ~ .drng-box-value {
      text-decoration: line-through;
    }
  }

  &.is-kept {
    .drng-cipher {
      stroke: var(--study-success);
      stroke-width: 2;
      fill: color-mix(in srgb, var(--study-success) 15%, transparent);
    }

    .drng-box-note {
      fill: var(--study-success);
    }
  }
}

.drng-counter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: baseline;
}

.drng-counter-aes {
  padding: 0 0.4rem;
  border: 1px solid var(--study-accent);
  background: var(--study-mark);
}

.drng-samples {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-height: 4.2rem;
  font-size: 0.75rem;
  overflow-wrap: anywhere;

  > span {
    opacity: 0.55;
  }

  .is-latest {
    opacity: 1;
    color: var(--fg-deeper);
  }
}

.drng-progress {
  height: 0.5rem;
  border: 1px solid var(--c-border);

  span {
    display: block;
    height: 100%;
    background: var(--study-accent);
    transition: width 0.6s;

    &.is-full {
      background: var(--study-alert);
    }
  }
}

.drng-rdrand {
  font-size: 0.75rem;
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .drng-stages {
    grid-template-columns: minmax(0, 1fr);
    gap: 1.2rem;
  }

  .drng-stage + .drng-stage::before {
    content: '↓';
    top: -1.15rem;
    left: 50%;
    transform: translateX(-50%);
  }

  .drng-circuit {
    grid-template-columns: minmax(0, 1fr);
  }

  .drng-inverters {
    max-width: 12rem;
    justify-self: center;
  }
}
</style>
