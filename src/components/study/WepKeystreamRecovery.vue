<script setup lang="ts">
import type { BitRow } from './XorBitRows.vue'
import type { Language } from '~/logics/languages'
import { HexParseError, bytesToHex, parseHex, randomBytes, xorBytes } from '~/lib/bits'
import { usePageLanguage } from '~/composables/usePageLanguage'

/** The captured exchange of the worked example in section 4.7. */
const GUIDE_CHALLENGE = '2A7F9C4E'
const GUIDE_RESPONSE = 'D3B1AC8B'
const GUIDE_NEXT_CHALLENGE = '6B0E51D7'
const MAX_BYTES = 8
const MAX_INPUT_LENGTH = MAX_BYTES * 3

type InputError = 'notHex' | 'oddLength' | 'empty' | 'lengthMismatch' | 'tooLong'

interface Text extends Record<InputError, string> {
  title: string
  stepCapture: string
  challenge: string
  response: string
  recovered: string
  stepReplay: string
  nextChallenge: string
  randomChallenge: string
  forged: string
  accepted: string
  reset: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'WEP authentication: recover the keystream, then log in without the key',
    stepCapture: 'Step 1: the attacker listens to one authentication.',
    challenge: 'Challenge P (the AP sends it in the clear)',
    response: 'Response C (the station encrypts it)',
    recovered: 'R = P XOR C is the keystream for this IV. It is not the secret key.',
    stepReplay: 'Step 2: the attacker asks to authenticate, sends the same IV, and gets a new challenge.',
    nextChallenge: 'New challenge P\' from the AP',
    randomChallenge: 'Random challenge',
    forged: 'The attacker answers C\' = P\' XOR R.',
    accepted: 'The AP decrypts C\' with the keystream of the same IV, gets P\' back, and accepts the attacker. The attacker never knew the secret key.',
    reset: 'Guide values',
    notHex: 'Use only the hex digits 0 to 9 and A to F.',
    oddLength: 'Each byte needs two hex digits.',
    empty: 'Type at least one byte.',
    lengthMismatch: 'P and C must have the same number of bytes.',
    tooLong: `Use at most ${MAX_BYTES} bytes.`,
  },
  pt: {
    title: 'Autenticação WEP: recuperar o keystream e entrar sem a chave',
    stepCapture: 'Passo 1: o atacante escuta uma autenticação.',
    challenge: 'Desafio P (o AP envia em claro)',
    response: 'Resposta C (a estação cifra)',
    recovered: 'R = P XOR C é o keystream deste IV. Não é a chave secreta.',
    stepReplay: 'Passo 2: o atacante pede autenticação, envia o mesmo IV e recebe um novo desafio.',
    nextChallenge: 'Novo desafio P\' do AP',
    randomChallenge: 'Desafio aleatório',
    forged: 'O atacante responde C\' = P\' XOR R.',
    accepted: 'O AP decifra C\' com o keystream do mesmo IV, obtém P\' de volta e aceita o atacante. O atacante nunca conheceu a chave secreta.',
    reset: 'Valores do guia',
    notHex: 'Use apenas os dígitos hexadecimais de 0 a 9 e de A a F.',
    oddLength: 'Cada byte precisa de dois dígitos hexadecimais.',
    empty: 'Digite pelo menos um byte.',
    lengthMismatch: 'P e C precisam ter o mesmo número de bytes.',
    tooLong: `Use no máximo ${MAX_BYTES} bytes.`,
  },
}

const text = TEXT[usePageLanguage()]

const challengeText = ref(GUIDE_CHALLENGE)
const responseText = ref(GUIDE_RESPONSE)
const nextChallengeText = ref(GUIDE_NEXT_CHALLENGE)

type Parsed = { bytes: Uint8Array } | { error: InputError }

function parse(text: string): Parsed {
  try {
    const bytes = parseHex(text)
    if (bytes.length === 0)
      return { error: 'empty' }
    if (bytes.length > MAX_BYTES)
      return { error: 'tooLong' }
    return { bytes }
  }
  catch (error) {
    if (error instanceof HexParseError)
      return { error: error.reason === 'not-hex' ? 'notHex' : 'oddLength' }
    throw error
  }
}

const challenge = computed(() => parse(challengeText.value))
const response = computed(() => parse(responseText.value))
const nextChallenge = computed(() => parse(nextChallengeText.value))

const captureError = computed(() => {
  if ('error' in challenge.value)
    return challenge.value.error
  if ('error' in response.value)
    return response.value.error
  if (challenge.value.bytes.length !== response.value.bytes.length)
    return 'lengthMismatch'
  return undefined
})

const keystream = computed(() => {
  if (captureError.value || !('bytes' in challenge.value) || !('bytes' in response.value))
    return undefined
  return xorBytes(challenge.value.bytes, response.value.bytes)
})

const captureRows = computed<BitRow[]>(() => {
  if (!keystream.value || !('bytes' in challenge.value) || !('bytes' in response.value))
    return []
  return [
    { label: 'P', bytes: challenge.value.bytes, tone: 'plain' },
    { label: 'C', bytes: response.value.bytes, tone: 'neutral' },
    { label: 'R', bytes: keystream.value, tone: 'key', separated: true },
  ]
})

const replayError = computed(() => {
  if ('error' in nextChallenge.value)
    return nextChallenge.value.error
  if (keystream.value && nextChallenge.value.bytes.length !== keystream.value.length)
    return 'lengthMismatch'
  return undefined
})

const forgedResponse = computed(() => {
  if (!keystream.value || replayError.value || !('bytes' in nextChallenge.value))
    return undefined
  return xorBytes(nextChallenge.value.bytes, keystream.value)
})

const replayRows = computed<BitRow[]>(() => {
  if (!forgedResponse.value || !keystream.value || !('bytes' in nextChallenge.value))
    return []
  return [
    { label: 'P\'', bytes: nextChallenge.value.bytes, tone: 'plain' },
    { label: 'R', bytes: keystream.value, tone: 'key' },
    { label: 'C\'', bytes: forgedResponse.value, tone: 'result', separated: true },
  ]
})

function pickRandomChallenge() {
  nextChallengeText.value = bytesToHex(randomBytes(keystream.value?.length ?? GUIDE_CHALLENGE.length / 2))
}

function reset() {
  challengeText.value = GUIDE_CHALLENGE
  responseText.value = GUIDE_RESPONSE
  nextChallengeText.value = GUIDE_NEXT_CHALLENGE
}
</script>

<template>
  <CipherFigure :title="text.title">
    <p>{{ text.stepCapture }}</p>
    <div class="cipher-fields">
      <label class="cipher-field">
        <span class="cipher-plain">{{ text.challenge }}</span>
        <input v-model="challengeText" type="text" :maxlength="MAX_INPUT_LENGTH" spellcheck="false" autocomplete="off" autocapitalize="characters">
      </label>
      <label class="cipher-field">
        <span>{{ text.response }}</span>
        <input v-model="responseText" type="text" :maxlength="MAX_INPUT_LENGTH" spellcheck="false" autocomplete="off" autocapitalize="characters">
      </label>
    </div>
    <div class="study-controls">
      <button type="button" class="study-button" @click="reset">
        {{ text.reset }}
      </button>
    </div>
    <p v-if="captureError" class="cipher-error" aria-live="polite">
      {{ text[captureError] }}
    </p>
    <template v-else-if="keystream">
      <XorBitRows :rows="captureRows" />
      <p class="cipher-key">
        R = {{ bytesToHex(keystream) }}. {{ text.recovered }}
      </p>

      <p>{{ text.stepReplay }}</p>
      <div class="cipher-fields">
        <label class="cipher-field">
          <span class="cipher-plain">{{ text.nextChallenge }}</span>
          <input v-model="nextChallengeText" type="text" :maxlength="MAX_INPUT_LENGTH" spellcheck="false" autocomplete="off" autocapitalize="characters">
        </label>
      </div>
      <div class="study-controls">
        <button type="button" class="study-button" @click="pickRandomChallenge">
          {{ text.randomChallenge }}
        </button>
      </div>
      <p v-if="replayError" class="cipher-error" aria-live="polite">
        {{ text[replayError] }}
      </p>
      <template v-else-if="forgedResponse">
        <p>{{ text.forged }}</p>
        <XorBitRows :rows="replayRows" />
        <p>{{ text.accepted }}</p>
      </template>
    </template>
  </CipherFigure>
</template>
