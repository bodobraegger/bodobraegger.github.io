<script setup lang="ts">
import type { BitRow, BitRowTone } from './XorBitRows.vue'
import type { Language } from '~/logics/languages'
import { byteToHex, bytesToHex, parseHex, randomBytes, xorBytes } from '~/lib/xor'
import { usePageLanguage } from '~/composables/usePageLanguage'

const MAX_BYTES = 12
const DEFAULT_FIRST_PLAINTEXT = 'PIN 4821'
const DEFAULT_SECOND_PLAINTEXT = 'PIN 0307'
const DEFAULT_KEYSTREAM = parseHex('9C3E71A85B0F2D64E7194AC2')
/** The first byte where the two default plaintexts differ, so the start view shows a non-zero XOR. */
const DEFAULT_SELECTED_BYTE = 4
const FIRST_PRINTABLE = 0x20
const LAST_PRINTABLE = 0x7E
const SPACE = 0x20
const VISIBLE_SPACE = '␣'

const LABELS = {
  en: {
    title: 'Stream cipher: the same keystream K used for two messages',
    firstPlaintext: 'Plaintext P1',
    secondPlaintext: 'Plaintext P2',
    newKeystream: 'New random keystream',
    reset: 'Default values',
    visibility: 'P1, P2 and K are secret. The attacker sees only C1 and C2.',
    selectByte: 'Tap a column to see its bits.',
    equalEverywhere: 'C1 ⊕ C2 = P1 ⊕ P2 in every byte. K cancels out, so the attacker does not need it.',
    zeroNote: 'Where P1 and P2 have the same character, C1 ⊕ C2 is 00. The attacker sees where the two texts match.',
    guessHeading: 'If the attacker knows or guesses P1 (a fixed header, a known format), P2 follows:',
    guess: 'Attacker\'s guess for P1',
    recovered: 'P2 = (C1 ⊕ C2) ⊕ guess',
    xorLegend: '⊕ means XOR.',
  },
  pt: {
    title: 'Cifra de fluxo: o mesmo keystream K usado em duas mensagens',
    firstPlaintext: 'Texto claro P1',
    secondPlaintext: 'Texto claro P2',
    newKeystream: 'Novo keystream aleatório',
    reset: 'Valores iniciais',
    visibility: 'P1, P2 e K são secretos. O atacante vê apenas C1 e C2.',
    selectByte: 'Toque numa coluna para ver os bits.',
    equalEverywhere: 'C1 ⊕ C2 = P1 ⊕ P2 em todos os bytes. K se cancela, então o atacante não precisa dele.',
    zeroNote: 'Onde P1 e P2 têm o mesmo caractere, C1 ⊕ C2 é 00. O atacante vê onde os dois textos coincidem.',
    guessHeading: 'Se o atacante conhece ou adivinha P1 (um cabeçalho fixo, um formato conhecido), obtém P2:',
    guess: 'Palpite do atacante para P1',
    recovered: 'P2 = (C1 ⊕ C2) ⊕ palpite',
    xorLegend: '⊕ significa XOR.',
  },
} satisfies Record<Language, Record<string, string>>

const labels = LABELS[usePageLanguage()]

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const firstPlaintextText = ref(DEFAULT_FIRST_PLAINTEXT)
const secondPlaintextText = ref(DEFAULT_SECOND_PLAINTEXT)
const guessText = ref(DEFAULT_FIRST_PLAINTEXT)
const keystream = ref(DEFAULT_KEYSTREAM)
const selectedByte = ref(DEFAULT_SELECTED_BYTE)

function encode(text: string): number[] {
  return [...encoder.encode(text)].slice(0, MAX_BYTES)
}

const firstPlaintext = computed(() => encode(firstPlaintextText.value))
const secondPlaintext = computed(() => encode(secondPlaintextText.value))
const firstCiphertext = computed(() => xorBytes(firstPlaintext.value, keystream.value))
const secondCiphertext = computed(() => xorBytes(secondPlaintext.value, keystream.value))
const ciphertextXor = computed(() => xorBytes(firstCiphertext.value, secondCiphertext.value))
const plaintextXor = computed(() => xorBytes(firstPlaintext.value, secondPlaintext.value))
const recoveredSecond = computed(() => xorBytes(ciphertextXor.value, encode(guessText.value)))
const recoveredSecondText = computed(() => decoder.decode(new Uint8Array(recoveredSecond.value)))

const columnCount = computed(() => Math.max(firstPlaintext.value.length, secondPlaintext.value.length))
const selectedColumn = computed(() => Math.min(selectedByte.value, columnCount.value - 1))

interface TableRow {
  label: string
  bytes: number[]
  tone: BitRowTone
  showCharacters?: boolean
}

const tableRows = computed<TableRow[]>(() => [
  { label: 'P1', bytes: firstPlaintext.value, tone: 'plain', showCharacters: true },
  { label: 'P2', bytes: secondPlaintext.value, tone: 'plain', showCharacters: true },
  { label: 'K', bytes: keystream.value.slice(0, columnCount.value), tone: 'key' },
  { label: 'C1', bytes: firstCiphertext.value, tone: 'neutral' },
  { label: 'C2', bytes: secondCiphertext.value, tone: 'neutral' },
  { label: 'C1⊕C2', bytes: ciphertextXor.value, tone: 'result' },
  { label: 'P1⊕P2', bytes: plaintextXor.value, tone: 'result' },
])

function pick(bytes: number[]): number[] {
  const byte = bytes[selectedColumn.value]
  return byte === undefined ? [] : [byte]
}

const ciphertextBitRows = computed<BitRow[]>(() => [
  { label: 'C1', bytes: pick(firstCiphertext.value), tone: 'neutral' },
  { label: 'C2', bytes: pick(secondCiphertext.value), tone: 'neutral' },
  { label: 'C1⊕C2', bytes: pick(ciphertextXor.value), tone: 'result', separated: true },
])

const plaintextBitRows = computed<BitRow[]>(() => [
  { label: 'P1', bytes: pick(firstPlaintext.value), tone: 'plain' },
  { label: 'P2', bytes: pick(secondPlaintext.value), tone: 'plain' },
  { label: 'P1⊕P2', bytes: pick(plaintextXor.value), tone: 'result', separated: true },
])

function hexAt(bytes: number[]): string {
  const byte = bytes[selectedColumn.value]
  return byte === undefined ? '--' : byteToHex(byte)
}

const cancellation = computed(() => {
  const first = hexAt(firstPlaintext.value)
  const second = hexAt(secondPlaintext.value)
  const key = hexAt(keystream.value)
  return [
    'C1 ⊕ C2 = (P1 ⊕ K) ⊕ (P2 ⊕ K)',
    '        = P1 ⊕ P2',
    `byte ${selectedColumn.value + 1}:`,
    `(${first} ⊕ ${key}) ⊕ (${second} ⊕ ${key})`,
    `  = ${first} ⊕ ${second} = ${hexAt(plaintextXor.value)}`,
  ].join('\n')
})

function character(byte: number | undefined): string {
  if (byte === undefined)
    return ''
  if (byte === SPACE)
    return VISIBLE_SPACE
  return byte >= FIRST_PRINTABLE && byte <= LAST_PRINTABLE ? String.fromCharCode(byte) : ''
}

function newKeystream() {
  keystream.value = randomBytes(MAX_BYTES)
}

function reset() {
  firstPlaintextText.value = DEFAULT_FIRST_PLAINTEXT
  secondPlaintextText.value = DEFAULT_SECOND_PLAINTEXT
  guessText.value = DEFAULT_FIRST_PLAINTEXT
  keystream.value = DEFAULT_KEYSTREAM
  selectedByte.value = DEFAULT_SELECTED_BYTE
}
</script>

<template>
  <CipherFigure :title="labels.title">
    <div class="cipher-fields">
      <label class="cipher-field">
        <span class="cipher-plain">{{ labels.firstPlaintext }}</span>
        <input v-model="firstPlaintextText" type="text" :maxlength="MAX_BYTES" spellcheck="false" autocomplete="off">
      </label>
      <label class="cipher-field">
        <span class="cipher-plain">{{ labels.secondPlaintext }}</span>
        <input v-model="secondPlaintextText" type="text" :maxlength="MAX_BYTES" spellcheck="false" autocomplete="off">
      </label>
    </div>
    <div class="study-controls">
      <button type="button" class="study-button" @click="newKeystream">
        {{ labels.newKeystream }}
      </button>
      <button type="button" class="study-button" @click="reset">
        {{ labels.reset }}
      </button>
    </div>

    <template v-if="columnCount > 0">
      <p class="cipher-muted">
        {{ labels.visibility }} {{ labels.selectByte }} {{ labels.xorLegend }}
      </p>
      <div class="cipher-scroll">
        <div class="reuse-grid" :style="{ '--reuse-columns': columnCount }">
          <span />
          <button
            v-for="column in columnCount"
            :key="column"
            type="button"
            class="reuse-column-button"
            :aria-pressed="column - 1 === selectedColumn"
            @click="selectedByte = column - 1"
          >
            {{ column }}
          </button>
          <template v-for="row in tableRows" :key="row.label">
            <span class="reuse-label" :class="`cipher-${row.tone}`">{{ row.label }}</span>
            <span
              v-for="column in columnCount"
              :key="column"
              class="reuse-cell"
              :class="[`cipher-${row.tone}`, { 'reuse-selected': column - 1 === selectedColumn, 'reuse-zero': row.tone === 'result' && row.bytes[column - 1] === 0 }]"
              @click="selectedByte = column - 1"
            >
              <span v-if="row.showCharacters" class="reuse-character">{{ character(row.bytes[column - 1]) }}</span>
              {{ row.bytes[column - 1] === undefined ? '' : byteToHex(row.bytes[column - 1]) }}
            </span>
          </template>
        </div>
      </div>

      <div class="reuse-bits">
        <XorBitRows :rows="ciphertextBitRows" :first-byte-index="selectedColumn" />
        <XorBitRows :rows="plaintextBitRows" :first-byte-index="selectedColumn" />
      </div>
      <div class="cipher-formula cipher-scroll">
        {{ cancellation }}
      </div>
      <p class="cipher-result">
        {{ labels.equalEverywhere }}
      </p>
      <p class="cipher-muted">
        {{ labels.zeroNote }}
      </p>

      <p>{{ labels.guessHeading }}</p>
      <div class="cipher-fields">
        <label class="cipher-field">
          <span>{{ labels.guess }}</span>
          <input v-model="guessText" type="text" :maxlength="MAX_BYTES" spellcheck="false" autocomplete="off">
        </label>
      </div>
      <p>
        {{ labels.recovered }} = <span class="cipher-plain reuse-recovered">{{ recoveredSecondText }}</span>
        <span class="cipher-muted"> ({{ bytesToHex(recoveredSecond) }})</span>
      </p>
    </template>
  </CipherFigure>
</template>

<style scoped>
.reuse-grid {
  display: grid;
  grid-template-columns: auto repeat(var(--reuse-columns), minmax(2.6ch, 1fr));
  align-items: end;
  width: max-content;
  min-width: 100%;
  font-family: var(--fonts-mono);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.reuse-label {
  padding-right: 0.6rem;
  white-space: nowrap;
}

.reuse-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.1rem 0.15rem;
  cursor: pointer;
}

.reuse-character {
  color: var(--fg-deep);
  font-weight: 600;
  min-height: 1.45em;
}

.reuse-selected {
  background: var(--c-border-soft);
}

.reuse-zero {
  font-weight: 700;
}

.reuse-column-button {
  min-height: 2.25rem;
  padding: 0;
  border: 0;
  border-bottom: 1px dashed var(--c-border);
  background: transparent;
  color: var(--fg-muted);
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
}

.reuse-column-button[aria-pressed='true'] {
  border: 0;
  border-bottom: 2px solid var(--fg-deeper);
  background: var(--c-border-soft);
  color: var(--fg-deeper);
}

.reuse-bits {
  display: flex;
  flex-wrap: wrap;
  column-gap: 1.5rem;
}

.reuse-recovered {
  font-weight: 700;
  white-space: pre;
}
</style>
