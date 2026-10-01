<script setup lang="ts">
import type { Language } from '~/logics/languages'
import type { AesKeys } from '~/lib/aes'
import { AES_BLOCK_BYTES, AES_KEY_BYTES, NONCE_BYTES, decryptCbc, decryptGcm, encryptCbc, encryptGcm, importAesKeys, randomBytes } from '~/lib/aes'
import { BITS_PER_BYTE, toBinary, toHex } from '~/lib/bits'
import { usePageLanguage } from '~/composables/usePageLanguage'

type Mode = 'cbc' | 'gcm'
const MODES: Mode[] = ['cbc', 'gcm']

const BLOCK_LABELS: Record<Mode, string[]> = {
  cbc: ['IV', 'C1', 'C2', 'C3'],
  gcm: ['C1', 'C2', 'C3', 'tag'],
}
/** In the CBC layout the IV comes first, so C2 starts two blocks in. */
const CBC_SECOND_BLOCK_OFFSET = 2 * AES_BLOCK_BYTES
/** Bit 3 turns the digit 0 (0x30) into 8 (0x38). */
const AMOUNT_BIT_MASK = 0x08
const AMOUNT_DIGITS = '0100'
const PRINTABLE_FIRST = 0x20
const PRINTABLE_LAST = 0x7E
const REPLACEMENT_CHARACTER = '�'

interface Text {
  title: string
  intro: string
  message: string
  sent: string
  received: string
  tapByte: string
  byteBits: (name: string) => string
  flipAmount: string
  reset: string
  newKey: string
  flips: (count: number) => string
  intact: string
  accepted: string
  verified: string
  rejected: (error: string) => string
  cbcRule: string
  gcmRule: string
  unsupported: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'Tampering: CBC against GCM',
    intro: 'The same message, encrypted twice with AES-128. Change the ciphertext as an attacker on the network would, then look at what the receiver gets.',
    message: 'FROM: ANA SILVA TO: BRUNO COSTA AMOUNT: R$ 0100 ',
    sent: 'Plaintext sent',
    received: 'The receiver decrypts',
    tapByte: 'Tap a ciphertext byte to see its bits.',
    byteBits: name => `Bits of ${name}. Tap a bit to flip it:`,
    flipAmount: 'Flip 1 bit to change the amount',
    reset: 'Undo all changes',
    newKey: 'New key',
    flips: count => count === 1 ? '1 bit flipped' : `${count} bits flipped`,
    intact: 'Nothing changed. The receiver gets the text that was sent.',
    accepted: 'No error. The receiver accepts this text and cannot know that it was changed.',
    verified: 'The tag is correct. The text is released.',
    rejected: error => `Rejected (${error}): the tag does not match. No plaintext is released.`,
    cbcRule: 'A flipped bit in C(i-1) flips the same bit of P_i and destroys P(i-1).',
    gcmRule: 'GHASH covers every ciphertext bit with the key H, so any change breaks the tag.',
    unsupported: 'This browser has no WebCrypto API, so it cannot show this figure.',
  },
  pt: {
    title: 'Adulteração: CBC contra GCM',
    intro: 'A mesma mensagem, cifrada duas vezes com AES-128. Mude o cifrado como um atacante na rede faria, e veja o que o receptor recebe.',
    message: 'DE: ANA SILVA   PARA: BRUNO LIMAVALOR: R$ 0100  ',
    sent: 'Texto claro enviado',
    received: 'O receptor decifra',
    tapByte: 'Toque em um byte do cifrado para ver os bits dele.',
    byteBits: name => `Bits de ${name}. Toque em um bit para invertê-lo:`,
    flipAmount: 'Inverter 1 bit para mudar o valor',
    reset: 'Desfazer as mudanças',
    newKey: 'Nova chave',
    flips: count => count === 1 ? '1 bit invertido' : `${count} bits invertidos`,
    intact: 'Nada mudou. O receptor recebe o texto que foi enviado.',
    accepted: 'Nenhum erro. O receptor aceita este texto e não tem como saber que ele mudou.',
    verified: 'A tag está correta. O texto é liberado.',
    rejected: error => `Rejeitado (${error}): a tag não confere. Nenhum texto claro é liberado.`,
    cbcRule: 'Um bit invertido em C(i-1) inverte o mesmo bit de P_i e destrói P(i-1).',
    gcmRule: 'O GHASH cobre cada bit do cifrado com a chave H, então qualquer mudança quebra a tag.',
    unsupported: 'Este navegador não tem a API WebCrypto, então não mostra esta figura.',
  },
}

type Result = { kind: 'plaintext', bytes: Uint8Array } | { kind: 'rejected', error: string }

interface ModeState {
  sent: Uint8Array
  received: Uint8Array
  selectedByte?: number
  result?: Result
}

const text = TEXT[usePageLanguage()]
const plaintext = new TextEncoder().encode(text.message)
const plaintextLines = chunk(plaintext)

const isSupported = ref(true)
const keys = shallowRef<AesKeys>()
const states = reactive<Partial<Record<Mode, ModeState>>>({})

let cbcIv = new Uint8Array(AES_BLOCK_BYTES)
let gcmNonce = new Uint8Array(NONCE_BYTES)

function chunk(bytes: Uint8Array): Uint8Array[] {
  return Array.from({ length: Math.ceil(bytes.length / AES_BLOCK_BYTES) }, (_, index) =>
    bytes.subarray(index * AES_BLOCK_BYTES, (index + 1) * AES_BLOCK_BYTES))
}

function displayCharacter(byte: number) {
  return byte >= PRINTABLE_FIRST && byte <= PRINTABLE_LAST ? String.fromCharCode(byte) : REPLACEMENT_CHARACTER
}

function byteName(mode: Mode, index: number) {
  return `${BLOCK_LABELS[mode][Math.floor(index / AES_BLOCK_BYTES)]}[${index % AES_BLOCK_BYTES}]`
}

function flippedBitCount(state: ModeState) {
  return state.received.reduce((count, byte, index) =>
    count + toBinary(byte ^ state.sent[index], BITS_PER_BYTE).split('').filter(bit => bit === '1').length, 0)
}

async function decrypt(mode: Mode, received: Uint8Array): Promise<Result> {
  try {
    const bytes = mode === 'cbc'
      ? await decryptCbc(keys.value!, received.subarray(0, AES_BLOCK_BYTES), received.subarray(AES_BLOCK_BYTES))
      : await decryptGcm(keys.value!, gcmNonce, received)
    return { kind: 'plaintext', bytes }
  }
  catch (error) {
    return { kind: 'rejected', error: error instanceof DOMException ? error.name : String(error) }
  }
}

async function updateResult(mode: Mode) {
  const state = states[mode]!
  const received = state.received
  const result = await decrypt(mode, received)
  // A later flip may have finished first; only the newest ciphertext counts.
  if (state.received === received)
    state.result = result
}

async function encryptMessage() {
  keys.value = await importAesKeys(randomBytes(AES_KEY_BYTES))
  cbcIv = randomBytes(AES_BLOCK_BYTES)
  gcmNonce = randomBytes(NONCE_BYTES)
  const cbcCiphertext = await encryptCbc(keys.value, cbcIv, plaintext)
  const cbcSent = new Uint8Array(AES_BLOCK_BYTES + cbcCiphertext.length)
  cbcSent.set(cbcIv)
  cbcSent.set(cbcCiphertext, AES_BLOCK_BYTES)
  const gcmSent = await encryptGcm(keys.value, gcmNonce, plaintext)
  states.cbc = { sent: cbcSent, received: cbcSent.slice() }
  states.gcm = { sent: gcmSent, received: gcmSent.slice() }
  await Promise.all(MODES.map(updateResult))
}

function flipBit(mode: Mode, byteIndex: number, mask: number) {
  const state = states[mode]!
  const received = state.received.slice()
  received[byteIndex] ^= mask
  state.received = received
  state.selectedByte = byteIndex
  updateResult(mode)
}

function flipAmountBit() {
  const amountIndex = new TextDecoder().decode(plaintextLines[2]).indexOf(AMOUNT_DIGITS)
  flipBit('cbc', CBC_SECOND_BLOCK_OFFSET + amountIndex, AMOUNT_BIT_MASK)
}

function isByteChanged(state: ModeState, index: number) {
  return state.received[index] !== state.sent[index]
}

function isBitChanged(state: ModeState, index: number, position: number) {
  return (((state.received[index] ^ state.sent[index]) >> (BITS_PER_BYTE - 1 - position)) & 1) === 1
}

function blockBytes(bytes: Uint8Array, block: number) {
  return bytes.subarray(block * AES_BLOCK_BYTES, (block + 1) * AES_BLOCK_BYTES)
}

function undoChanges() {
  for (const mode of MODES) {
    const state = states[mode]!
    state.received = state.sent.slice()
    state.selectedByte = undefined
    updateResult(mode)
  }
}

const panels = computed(() => MODES.flatMap(mode => states[mode] ? [{ mode, state: states[mode]! }] : []))
const isChanged = computed(() => panels.value.some(({ state }) => flippedBitCount(state) > 0))

onMounted(() => {
  if (!globalThis.crypto?.subtle) {
    isSupported.value = false
    return
  }
  encryptMessage()
})
</script>

<template>
  <StudyFigure :title="text.title">
    <p>{{ text.intro }}</p>
    <p v-if="!isSupported" class="study-alert">
      {{ text.unsupported }}
    </p>

    <div>
      <div class="study-label">
        {{ text.sent }}
      </div>
      <div class="tamper-text study-mono">
        <div v-for="(line, index) in plaintextLines" :key="index" class="tamper-line">
          <span class="tamper-line-label">P{{ index + 1 }}</span>
          <span v-for="(byte, position) in line" :key="position" class="tamper-character">{{ displayCharacter(byte) }}</span>
        </div>
      </div>
    </div>

    <div class="study-controls">
      <button class="study-button" type="button" :disabled="!states.cbc" @click="flipAmountBit">
        {{ text.flipAmount }}
      </button>
      <button class="study-button" type="button" :disabled="!isChanged" @click="undoChanges">
        {{ text.reset }}
      </button>
      <button class="study-button" type="button" :disabled="!keys" @click="encryptMessage">
        {{ text.newKey }}
      </button>
    </div>

    <div class="tamper-panels">
      <section v-for="{ mode, state } in panels" :key="mode" class="tamper-panel">
        <div class="tamper-panel-title study-mono">
          AES-{{ mode.toUpperCase() }}
        </div>
        <div class="tamper-bytes study-mono">
          <template v-for="(label, block) in BLOCK_LABELS[mode]" :key="label">
            <span class="tamper-block-label">{{ label }}</span>
            <div class="tamper-block">
              <button
                v-for="(hex, position) in toHex(blockBytes(state.received, block))"
                :key="position"
                type="button"
                class="tamper-byte"
                :class="{
                  'is-selected': state.selectedByte === block * AES_BLOCK_BYTES + position,
                  'is-changed': isByteChanged(state, block * AES_BLOCK_BYTES + position),
                }"
                :aria-label="`${byteName(mode, block * AES_BLOCK_BYTES + position)}: ${hex}`"
                @click="state.selectedByte = block * AES_BLOCK_BYTES + position"
              >
                {{ hex }}
              </button>
            </div>
          </template>
        </div>

        <div v-if="state.selectedByte !== undefined" class="tamper-bit-picker">
          <span class="study-label">{{ text.byteBits(byteName(mode, state.selectedByte)) }}</span>
          <span class="study-bits">
            <button
              v-for="(bit, position) in toBinary(state.received[state.selectedByte], BITS_PER_BYTE)"
              :key="position"
              type="button"
              class="study-bit tamper-bit"
              :class="{ 'is-alert': isBitChanged(state, state.selectedByte, position) }"
              :aria-label="`bit ${position}: ${bit}`"
              @click="flipBit(mode, state.selectedByte, 0x80 >> position)"
            >{{ bit }}</button>
          </span>
        </div>
        <p v-else class="study-label">
          {{ text.tapByte }}
        </p>

        <div>
          <div class="study-label">
            {{ text.received }}<template v-if="flippedBitCount(state)">
              ({{ text.flips(flippedBitCount(state)) }})
            </template>
          </div>
          <template v-if="state.result?.kind === 'plaintext'">
            <div class="tamper-text study-mono">
              <div v-for="(line, index) in chunk(state.result.bytes)" :key="index" class="tamper-line">
                <span class="tamper-line-label">P{{ index + 1 }}</span>
                <span
                  v-for="(byte, position) in line"
                  :key="position"
                  class="tamper-character"
                  :class="{ 'is-changed': byte !== plaintextLines[index][position] }"
                >{{ displayCharacter(byte) }}</span>
              </div>
            </div>
            <p class="tamper-verdict" :class="{ 'study-alert': mode === 'cbc' && flippedBitCount(state) }">
              {{ mode === 'cbc' ? (flippedBitCount(state) ? text.accepted : text.intact) : text.verified }}
            </p>
          </template>
          <p v-else-if="state.result?.kind === 'rejected'" class="study-alert tamper-verdict">
            ✗ {{ text.rejected(state.result.error) }}
          </p>
        </div>
        <p class="study-label">
          {{ mode === 'cbc' ? text.cbcRule : text.gcmRule }}
        </p>
      </section>
    </div>
  </StudyFigure>
</template>

<style scoped>
.tamper-panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.2rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.tamper-panel {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--c-border);
}

.tamper-panel-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--fg-deep);
}

.tamper-bytes {
  display: grid;
  grid-template-columns: 2.2rem minmax(0, 1fr);
  gap: 0.35rem 0.4rem;
  align-items: start;
}

.tamper-block-label {
  padding-top: 0.35rem;
  font-size: 0.75rem;
  color: var(--fg-muted);
}

.tamper-block {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 2px;
}

.tamper-byte {
  min-height: 1.9rem;
  border: 1px solid var(--c-border-soft);
  font-family: var(--fonts-mono);
  font-size: 0.75rem;
  color: var(--fg);
  background: transparent;
  cursor: pointer;

  &:hover {
    border-color: var(--fg-muted);
  }

  &.is-changed {
    background: var(--study-alert-mark);
    border-color: var(--study-alert);
    color: var(--study-alert);
  }

  &.is-selected {
    outline: 2px solid var(--study-accent);
    outline-offset: -1px;
  }
}

.tamper-bit-picker {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.study-bit.tamper-bit {
  width: 2rem;
  height: 2.2rem;
  font: inherit;
  background: transparent;
  cursor: pointer;
  border-color: var(--fg-muted);
  border-style: dashed;
}

.tamper-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.85rem;
}

.tamper-line {
  display: flex;
  align-items: baseline;
}

.tamper-line-label {
  width: 2.2rem;
  flex: none;
  font-size: 0.75rem;
  color: var(--fg-muted);
}

.tamper-character {
  display: inline-block;
  width: 1.1ch;
  text-align: center;
  white-space: pre;

  &.is-changed {
    background: var(--study-alert-mark);
    color: var(--study-alert);
  }
}

.tamper-verdict {
  margin-top: 0.4rem;
}
</style>
