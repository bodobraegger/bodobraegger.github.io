<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { AES_BLOCK_BYTES, encryptBlock, importAesKeys } from '~/lib/aes'
import { BITS_PER_BYTE, asciiCharacter, bytesToBits, flipBit, hammingDistance } from '~/lib/bits'
import { useWebCrypto } from '~/composables/useWebCrypto'
import { usePageLanguage } from '~/composables/usePageLanguage'

const BLOCK_BITS = AES_BLOCK_BYTES * BITS_PER_BYTE
/** The AES-128 key of the FIPS-197 example, so that every visitor sees the same numbers. */
const EXAMPLE_KEY = Uint8Array.from({ length: AES_BLOCK_BYTES }, (_, index) => index)
const HISTORY_LENGTH = 8
const PERCENT = 100

type Target = 'plaintext' | 'key'
const TARGETS: Target[] = ['plaintext', 'key']

interface Text {
  title: string
  intro: string
  message: string
  flipTarget: string
  targets: Record<Target, string>
  ciphertext: string
  inputFlipped: (count: number) => string
  ciphertextChanged: (count: number, percent: number) => string
  history: string
  mean: string
  reset: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'Avalanche effect in AES-128',
    intro: 'Tap a bit to flip it. AES-128 (WebCrypto) encrypts the block again. The marked ciphertext bits are the bits that changed.',
    message: 'AVALANCHE EFFECT',
    flipTarget: 'Flip bits of:',
    targets: { plaintext: 'plaintext', key: 'key' },
    ciphertext: 'ciphertext',
    inputFlipped: count => count === 1 ? '1 input bit flipped' : `${count} input bits flipped`,
    ciphertextChanged: (count, percent) => `${count} of ${BLOCK_BITS} ciphertext bits changed (${percent}%)`,
    history: 'Ciphertext bits changed by each tap:',
    mean: 'mean',
    reset: 'Undo all flips',
  },
  pt: {
    title: 'Efeito avalanche no AES-128',
    intro: 'Toque em um bit para invertê-lo. O AES-128 (WebCrypto) cifra o bloco de novo. Os bits marcados do cifrado são os bits que mudaram.',
    message: 'EFEITO AVALANCHE',
    flipTarget: 'Inverter bits de:',
    targets: { plaintext: 'texto claro', key: 'chave' },
    ciphertext: 'cifrado',
    inputFlipped: count => count === 1 ? '1 bit de entrada invertido' : `${count} bits de entrada invertidos`,
    ciphertextChanged: (count, percent) => `${count} de ${BLOCK_BITS} bits do cifrado mudaram (${percent}%)`,
    history: 'Bits do cifrado mudados por cada toque:',
    mean: 'média',
    reset: 'Desfazer as inversões',
  },
}

const text = TEXT[usePageLanguage()]
const ORIGINAL: Record<Target, Uint8Array> = {
  plaintext: new TextEncoder().encode(text.message),
  key: EXAMPLE_KEY,
}

const isSupported = useWebCrypto()
const target = ref<Target>('plaintext')
const inputs = shallowReactive<Record<Target, Uint8Array>>({ ...ORIGINAL })
const referenceCiphertext = shallowRef<Uint8Array>()
const ciphertext = shallowRef<Uint8Array>()
const history = ref<number[]>([])

async function encrypt(plaintext: Uint8Array, key: Uint8Array) {
  return encryptBlock(await importAesKeys(key), plaintext)
}

const inputBits = computed(() => bytesToBits(inputs[target.value]))
const originalBits = computed(() => bytesToBits(ORIGINAL[target.value]))
const referenceBits = computed(() => referenceCiphertext.value ? bytesToBits(referenceCiphertext.value) : [])
const ciphertextBits = computed(() => ciphertext.value ? bytesToBits(ciphertext.value) : [])

const flippedInputCount = computed(() => TARGETS.reduce((count, name) =>
  count + hammingDistance(inputs[name], ORIGINAL[name]), 0))
const changedCount = computed(() => ciphertext.value && referenceCiphertext.value
  ? hammingDistance(ciphertext.value, referenceCiphertext.value)
  : 0)
const changedPercent = computed(() => Math.round(changedCount.value * PERCENT / BLOCK_BITS))
const historyMean = computed(() => history.value.length
  ? Math.round(history.value.reduce((sum, count) => sum + count, 0) / history.value.length)
  : 0)

const plaintextCharacters = computed(() => [...inputs.plaintext].map(byte => asciiCharacter(byte)).join(''))

// Taps are encrypted one after the other, so each history entry counts one flip
// against the ciphertext of the tap before it.
let pendingTaps = Promise.resolve()

function toggleBit(bitIndex: number) {
  inputs[target.value] = flipBit(inputs[target.value], bitIndex)
  const { plaintext, key } = inputs
  // A failed tap must not block the taps after it.
  pendingTaps = pendingTaps.catch(() => {}).then(async () => {
    const result = await encrypt(plaintext, key)
    const changedByTap = ciphertext.value ? hammingDistance(result, ciphertext.value) : 0
    ciphertext.value = result
    history.value = [...history.value, changedByTap].slice(-HISTORY_LENGTH)
  })
}

function undoFlips() {
  Object.assign(inputs, ORIGINAL)
  ciphertext.value = referenceCiphertext.value
  history.value = []
}

onMounted(async () => {
  if (!isSupported.value)
    return
  referenceCiphertext.value = await encrypt(ORIGINAL.plaintext, ORIGINAL.key)
  ciphertext.value = referenceCiphertext.value
})
</script>

<template>
  <StudyFigure :title="text.title" :unsupported="!isSupported">
    <p>{{ text.intro }}</p>

    <div class="study-controls">
      <span class="study-label">{{ text.flipTarget }}</span>
      <button
        v-for="name in TARGETS"
        :key="name"
        class="study-button"
        type="button"
        :aria-pressed="target === name"
        @click="target = name"
      >
        {{ text.targets[name] }}
      </button>
    </div>

    <div class="avalanche-grids">
      <div class="avalanche-panel">
        <span class="study-label">{{ text.targets[target] }}</span>
        <div class="study-bit-grid">
          <button
            v-for="(bit, index) in inputBits"
            :key="index"
            type="button"
            class="study-bit avalanche-bit is-editable"
            :class="{ 'is-marked': bit !== originalBits[index] }"
            :aria-label="`${text.targets[target]} bit ${index}: ${bit}`"
            :disabled="!referenceCiphertext"
            @click="toggleBit(index)"
          >
            {{ bit }}
          </button>
        </div>
        <span v-if="target === 'plaintext'" class="study-label study-mono avalanche-ascii">"{{ plaintextCharacters }}"</span>
        <span class="study-label">{{ text.inputFlipped(flippedInputCount) }}</span>
      </div>

      <div class="avalanche-panel">
        <span class="study-label">{{ text.ciphertext }}</span>
        <div class="study-bit-grid">
          <span
            v-for="(bit, index) in ciphertextBits"
            :key="index"
            class="study-bit avalanche-bit"
            :class="{ 'is-alert': bit !== referenceBits[index] }"
          >{{ bit }}</span>
        </div>
        <strong v-if="ciphertext" class="study-mono" aria-live="polite">
          {{ text.ciphertextChanged(changedCount, changedPercent) }}
        </strong>
      </div>
    </div>

    <div v-if="history.length" class="study-controls">
      <span class="study-label">
        {{ text.history }}
        <span class="study-mono">{{ history.join(', ') }}</span>
        ({{ text.mean }} {{ historyMean }})
      </span>
    </div>

    <div class="study-controls">
      <button class="study-button" type="button" :disabled="!flippedInputCount" @click="undoFlips">
        {{ text.reset }}
      </button>
    </div>
  </StudyFigure>
</template>

<style scoped>
.avalanche-grids {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.avalanche-panel {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.study-bit.avalanche-bit {
  height: 1.45rem;
  font-size: 0.72rem;
}

.study-bit.is-editable {
  padding: 0;
  font-family: inherit;
  background-color: transparent;
  cursor: pointer;
  border-style: dashed;
  border-color: var(--c-border);

  &.is-marked {
    background: var(--study-mark);
    border-color: var(--study-accent);
    border-style: solid;
  }
}

.avalanche-ascii {
  white-space: pre;
}
</style>
