<script setup lang="ts">
import type { BitRow } from './XorBitRows.vue'
import type { Language } from '~/logics/languages'
import { usePageLanguage } from '~/composables/usePageLanguage'
import { BITS_PER_BYTE, toBinary } from '~/lib/bits'

type Preset = 'notebook' | 'mock'
type HashFunction = 'xor' | 'rotate'

const BLOCK_COUNT = 3
const BYTE_MASK = 0xFF
const HIGH_BIT_SHIFT = BITS_PER_BYTE - 1

/** The notebook Hash_Simples_e_Fraca, and question 3 of the mock exam (amount, account, date). */
const PRESETS: Record<Preset, number[]> = {
  notebook: [0b11001100, 0b01010101, 0b11000111],
  mock: [0b10110010, 0b01101100, 0b11010001],
}
const PRESET_ORDER: Preset[] = ['notebook', 'mock']
const HASH_ORDER: HashFunction[] = ['xor', 'rotate']
/** Every order of three blocks, as block indexes. */
const ORDERS: number[][] = [[0, 1, 2], [1, 0, 2], [0, 2, 1], [2, 1, 0], [1, 2, 0], [2, 0, 1]]
const SWAPPED_ORDER = 1

interface Text {
  title: string
  presets: Record<Preset, string>
  hashes: Record<HashFunction, string>
  blocks: string
  editHint: string
  order: string
  sent: string
  received: string
  sameOrder: string
  sameMessage: string
  undetected: (hash: string) => string
  detected: (sent: string, received: string) => string
  collisionByChance: (hash: string) => string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'The simple XOR hash: reorder the blocks',
    presets: { notebook: 'Notebook blocks', mock: 'Mock exam: amount, account, date' },
    hashes: { xor: 'XOR of the blocks (slide 282)', rotate: 'Rotate, then XOR (a fix)' },
    blocks: 'Blocks of the message',
    editHint: 'Tap a bit to change it.',
    order: 'Order the attacker delivers',
    sent: 'Sent',
    received: 'Received',
    sameOrder: 'Choose another order to play the attacker.',
    sameMessage: 'The reordered message is the same as the original, because two blocks are equal.',
    undetected: hash => `Both orders give the hash ${hash}. The encrypted hash of the sender still matches, so the receiver accepts the changed message.`,
    detected: (sent, received) => `The hashes differ, ${sent} against ${received}: each block is rotated a number of times that depends on its position, so the receiver detects the change.`,
    collisionByChance: hash => `Both orders give ${hash} by chance. A hash of 8 bits has only 256 values, so collisions are easy to find.`,
  },
  pt: {
    title: 'O hash XOR simples: reordene os blocos',
    presets: { notebook: 'Blocos do notebook', mock: 'Prova simulada: valor, conta, data' },
    hashes: { xor: 'XOR dos blocos (slide 282)', rotate: 'Rotacionar, depois XOR (uma correção)' },
    blocks: 'Blocos da mensagem',
    editHint: 'Toque em um bit para mudá-lo.',
    order: 'Ordem que o atacante entrega',
    sent: 'Enviado',
    received: 'Recebido',
    sameOrder: 'Escolha outra ordem para fazer o papel do atacante.',
    sameMessage: 'A mensagem reordenada é igual à original, porque dois blocos são iguais.',
    undetected: hash => `As duas ordens dão o hash ${hash}. O hash cifrado do emissor ainda confere, então o receptor aceita a mensagem alterada.`,
    detected: (sent, received) => `Os hashes diferem, ${sent} contra ${received}: cada bloco é rotacionado um número de vezes que depende da sua posição, então o receptor detecta a mudança.`,
    collisionByChance: hash => `As duas ordens dão ${hash} por acaso. Um hash de 8 bits tem só 256 valores, então colisões são fáceis de achar.`,
  },
}

const text = TEXT[usePageLanguage()]

const blocks = ref<number[]>([...PRESETS.notebook])
const orderIndex = ref(SWAPPED_ORDER)
const hashFunction = ref<HashFunction>('xor')
const activePreset = computed(() => PRESET_ORDER.find(preset => PRESETS[preset].every((block, index) => block === blocks.value[index])))

function selectPreset(preset: Preset) {
  blocks.value = [...PRESETS[preset]]
}

function toggleBit(blockIndex: number, bitIndex: number) {
  blocks.value[blockIndex] ^= 1 << (HIGH_BIT_SHIFT - bitIndex)
}

function rotateLeft(value: number): number {
  return ((value << 1) | (value >> HIGH_BIT_SHIFT)) & BYTE_MASK
}

function blockName(index: number): string {
  return `B${index + 1}`
}

function orderLabel(order: number[]): string {
  return order.map(blockName).join(' ')
}

function byte(value: number): Uint8Array {
  return Uint8Array.of(value)
}

/** The rows of the hash written as a column sum, and the hash. H_0 = 00000000. */
function hashRows(order: number[]): { rows: BitRow[], hash: number } {
  if (hashFunction.value === 'xor') {
    const hash = order.reduce((value, index) => value ^ blocks.value[index], 0)
    return {
      rows: [
        ...order.map((index): BitRow => ({ label: blockName(index), bytes: byte(blocks.value[index]), tone: 'plain' })),
        { label: 'H', bytes: byte(hash), tone: 'result', separated: true },
      ],
      hash,
    }
  }
  const rows: BitRow[] = []
  let hash = 0
  for (const [position, index] of order.entries()) {
    const rotated = rotateLeft(hash)
    hash = rotated ^ blocks.value[index]
    rows.push(
      { label: `ROTL(H_${position})`, bytes: byte(rotated), tone: 'key' },
      { label: blockName(index), bytes: byte(blocks.value[index]), tone: 'plain' },
      { label: `H_${position + 1}`, bytes: byte(hash), tone: 'result', separated: true },
    )
  }
  return { rows, hash }
}

const order = computed(() => ORDERS[orderIndex.value])
const sent = computed(() => hashRows(ORDERS[0]))
const received = computed(() => hashRows(order.value))

const outcome = computed(() => {
  const sentHash = toBinary(sent.value.hash, BITS_PER_BYTE)
  const receivedHash = toBinary(received.value.hash, BITS_PER_BYTE)
  if (orderIndex.value === 0)
    return { tone: 'muted', text: text.sameOrder }
  if (order.value.every((index, position) => blocks.value[index] === blocks.value[position]))
    return { tone: 'muted', text: text.sameMessage }
  if (sentHash !== receivedHash)
    return { tone: 'success', text: text.detected(sentHash, receivedHash) }
  return { tone: 'alert', text: hashFunction.value === 'xor' ? text.undetected(sentHash) : text.collisionByChance(sentHash) }
})
</script>

<template>
  <CipherFigure :title="text.title">
    <div class="study-controls">
      <button
        v-for="preset in PRESET_ORDER"
        :key="preset"
        type="button"
        class="study-button"
        :aria-pressed="activePreset === preset"
        @click="selectPreset(preset)"
      >
        {{ text.presets[preset] }}
      </button>
    </div>

    <div class="cipher-field">
      <span>{{ text.blocks }} <span class="study-label">{{ text.editHint }}</span></span>
      <div v-for="blockIndex in BLOCK_COUNT" :key="blockIndex" class="hash-block">
        <span class="study-mono cipher-plain">{{ blockName(blockIndex - 1) }}</span>
        <span class="study-bits">
          <button
            v-for="(bit, bitIndex) in toBinary(blocks[blockIndex - 1], BITS_PER_BYTE)"
            :key="bitIndex"
            type="button"
            class="study-bit is-editable"
            :aria-label="`${blockName(blockIndex - 1)}, bit ${bitIndex}: ${bit}`"
            @click="toggleBit(blockIndex - 1, bitIndex)"
          >{{ bit }}</button>
        </span>
      </div>
    </div>

    <div class="cipher-field">
      <span>{{ text.order }}</span>
      <div class="study-controls">
        <button
          v-for="(candidate, index) in ORDERS"
          :key="index"
          type="button"
          class="study-button study-mono"
          :aria-pressed="orderIndex === index"
          @click="orderIndex = index"
        >
          {{ orderLabel(candidate) }}
        </button>
      </div>
    </div>

    <div class="study-controls">
      <button
        v-for="option in HASH_ORDER"
        :key="option"
        type="button"
        class="study-button"
        :aria-pressed="hashFunction === option"
        @click="hashFunction = option"
      >
        {{ text.hashes[option] }}
      </button>
    </div>

    <div class="hash-panels">
      <div class="cipher-field">
        <span>{{ text.sent }}: {{ orderLabel(ORDERS[0]) }}</span>
        <XorBitRows :rows="sent.rows" binary-only />
      </div>
      <div class="cipher-field">
        <span>{{ text.received }}: {{ orderLabel(order) }}</span>
        <XorBitRows :rows="received.rows" binary-only />
      </div>
    </div>

    <p class="study-mono" :class="{ 'study-success': outcome.tone === 'success', 'study-alert': outcome.tone === 'alert', 'cipher-muted': outcome.tone === 'muted' }">
      <template v-if="outcome.tone !== 'muted'">
        {{ outcome.tone === 'success' ? '✓' : '✗' }}
      </template>
      {{ outcome.text }}
    </p>
  </CipherFigure>
</template>

<style scoped>
.hash-block {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

/* Sent and received side by side, stacked on a phone. */
.hash-panels {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}
</style>
