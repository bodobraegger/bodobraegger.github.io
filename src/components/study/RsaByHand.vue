<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { LANGUAGE_DEFINITIONS } from '~/logics/languages'
import { usePageLanguage } from '~/composables/usePageLanguage'
import { MAXIMUM_MODULUS, greatestCommonDivisor, isPrime, modularInverse, modularPower } from '~/lib/modular'

interface Inputs {
  p: string
  q: string
  e: string
  message: string
}

type Preset = 'list' | 'mock'

/** List 5 section 2 (also the notebook RSA_Exemplo_Simples), and question 2 of the mock exam. */
const PRESETS: Record<Preset, Inputs> = {
  list: { p: '17', q: '11', e: '7', message: '88' },
  mock: { p: '5', q: '11', e: '7', message: '9' },
}
const PRESET_ORDER: Preset[] = ['list', 'mock']
const FIELDS: (keyof Inputs)[] = ['p', 'q', 'e', 'message']
const DIGITS_PATTERN = /^\d{1,7}$/

interface Text {
  title: string
  presets: Record<Preset, string>
  fields: Record<keyof Inputs, string>
  steps: { modulus: string, inverse: string, encryption: string, decryption: string }
  euclidHint: string
  errors: {
    notNumber: (field: string) => string
    notPrime: (name: string, value: number) => string
    samePrimes: string
    tooLarge: (limit: string) => string
    exponentRange: string
    noInverse: (divisor: number) => string
    messageRange: string
  }
  inverse: (coefficient: string, modulus: number, inverse: number) => string
  check: string
  recovered: (message: number) => string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'RSA by hand: keys, encryption, decryption',
    presets: { list: 'List 5: p = 17, q = 11', mock: 'Mock exam: p = 5, q = 11' },
    fields: { p: 'prime p', q: 'prime q', e: 'public exponent e', message: 'message M' },
    steps: {
      modulus: '1. n and φ(n)',
      inverse: '2. d, the inverse of e modulo φ(n), with the extended Euclidean algorithm',
      encryption: '3. Encryption with PU = {e, n}, square-and-multiply',
      decryption: '4. Decryption with PR = {d, n}',
    },
    euclidHint: 'Each row divides the divisor of the row above by its remainder. t starts with 0 for φ(n) and 1 for e, and each new t is the t two rows up minus the quotient times the t one row up. The t of the row with remainder 1 is d, plus φ(n) when it is negative.',
    errors: {
      notNumber: field => `Enter a whole number for ${field}.`,
      notPrime: (name, value) => `${name} = ${value} is not prime.`,
      samePrimes: 'p and q must be two different primes.',
      tooLarge: limit => `Keep n below ${limit}, a size for hand work.`,
      exponentRange: 'e must satisfy 1 < e < φ(n).',
      noInverse: divisor => `gcd(e, φ(n)) = ${divisor}, not 1, so e has no inverse modulo φ(n). Choose another e.`,
      messageRange: 'M must satisfy 0 ≤ M < n.',
    },
    inverse: (coefficient, modulus, inverse) => `d = ${coefficient} mod ${modulus} = ${inverse}`,
    check: 'check',
    recovered: message => `M = ${message}: the original message comes back.`,
  },
  pt: {
    title: 'RSA à mão: chaves, cifragem, decifragem',
    presets: { list: 'Lista 5: p = 17, q = 11', mock: 'Prova simulada: p = 5, q = 11' },
    fields: { p: 'primo p', q: 'primo q', e: 'expoente público e', message: 'mensagem M' },
    steps: {
      modulus: '1. n e φ(n)',
      inverse: '2. d, o inverso de e módulo φ(n), com o algoritmo de Euclides estendido',
      encryption: '3. Cifragem com PU = {e, n}, quadrado e multiplicação',
      decryption: '4. Decifragem com PR = {d, n}',
    },
    euclidHint: 'Cada linha divide o divisor da linha de cima pelo seu resto. t começa com 0 para φ(n) e 1 para e, e cada novo t é o t de duas linhas acima menos o quociente vezes o t da linha acima. O t da linha com resto 1 é d, mais φ(n) quando é negativo.',
    errors: {
      notNumber: field => `Digite um número inteiro para ${field}.`,
      notPrime: (name, value) => `${name} = ${value} não é primo.`,
      samePrimes: 'p e q precisam ser dois primos diferentes.',
      tooLarge: limit => `Mantenha n abaixo de ${limit}, um tamanho para conta à mão.`,
      exponentRange: 'e precisa satisfazer 1 < e < φ(n).',
      noInverse: divisor => `mdc(e, φ(n)) = ${divisor}, não 1, então e não tem inverso módulo φ(n). Escolha outro e.`,
      messageRange: 'M precisa satisfazer 0 ≤ M < n.',
    },
    inverse: (coefficient, modulus, inverse) => `d = ${coefficient} mod ${modulus} = ${inverse}`,
    check: 'verificação',
    recovered: message => `M = ${message}: a mensagem original volta.`,
  },
}

const language = usePageLanguage()
const text = TEXT[language]
const limitText = new Intl.NumberFormat(LANGUAGE_DEFINITIONS[language].locale).format(MAXIMUM_MODULUS)

const inputs = reactive<Inputs>({ ...PRESETS.list })
const activePreset = computed(() => PRESET_ORDER.find(preset => FIELDS.every(field => inputs[field] === PRESETS[preset][field])))

function selectPreset(preset: Preset) {
  Object.assign(inputs, PRESETS[preset])
}

/** Writes a negative number with a minus sign, in parentheses when it is a factor. */
function signed(value: number, asFactor = false): string {
  if (value >= 0)
    return String(value)
  return asFactor ? `(−${-value})` : `−${-value}`
}

const parsed = computed(() => {
  const values: Partial<Record<keyof Inputs, number>> = {}
  const errors: string[] = []
  for (const field of FIELDS) {
    const value = inputs[field].trim()
    if (DIGITS_PATTERN.test(value))
      values[field] = Number(value)
    else
      errors.push(text.errors.notNumber(text.fields[field]))
  }
  return { values, errors }
})

const keys = computed(() => {
  const { values, errors } = parsed.value
  if (errors.length > 0)
    return { errors }
  const { p, q, e } = values as Record<keyof Inputs, number>
  const keyErrors: string[] = []
  if (!isPrime(p))
    keyErrors.push(text.errors.notPrime('p', p))
  if (!isPrime(q))
    keyErrors.push(text.errors.notPrime('q', q))
  if (p === q)
    keyErrors.push(text.errors.samePrimes)
  if (p * q >= MAXIMUM_MODULUS)
    keyErrors.push(text.errors.tooLarge(limitText))
  if (keyErrors.length > 0)
    return { errors: keyErrors }

  const modulus = p * q
  const totient = (p - 1) * (q - 1)
  if (e <= 1 || e >= totient)
    return { errors: [text.errors.exponentRange], modulus, totient }
  const inverse = modularInverse(e, totient)
  if (inverse.inverse === undefined)
    return { errors: [text.errors.noInverse(greatestCommonDivisor(e, totient))], modulus, totient, inverse }
  return { errors: [], modulus, totient, inverse, privateExponent: inverse.inverse }
})

const modulusLines = computed(() => {
  const { p, q } = parsed.value.values
  const { modulus, totient } = keys.value
  if (modulus === undefined || totient === undefined || p === undefined || q === undefined)
    return []
  return [
    `n = p × q = ${p} × ${q} = ${modulus}`,
    `φ(n) = (p − 1)(q − 1) = ${p - 1} × ${q - 1} = ${totient}`,
  ]
})

/** The Euclid rows with the coefficient column aligned. */
const euclidLines = computed(() => {
  const steps = keys.value.inverse?.steps ?? []
  const divisions = steps.map(step => `${step.dividend} = ${step.quotient} × ${step.divisor} + ${step.remainder}`)
  const width = Math.max(0, ...divisions.map(line => line.length))
  return steps.map((step, index) => step.remainder === 0
    ? divisions[index]
    : `${divisions[index].padEnd(width)}   t = ${signed(step.previousCoefficient)} − ${step.quotient} × ${signed(step.divisorCoefficient, true)} = ${signed(step.coefficient)}`)
})

const keyLines = computed(() => {
  const { inverse, totient, modulus, privateExponent } = keys.value
  const e = parsed.value.values.e
  if (!inverse || privateExponent === undefined || totient === undefined || modulus === undefined || e === undefined)
    return []
  const product = e * privateExponent
  return [
    text.inverse(signed(inverse.coefficient), totient, privateExponent),
    `${text.check}: ${e} × ${privateExponent} = ${product} = ${Math.floor(product / totient)} × ${totient} + 1`,
    `PU = {${e}, ${modulus}}   PR = {${privateExponent}, ${modulus}}`,
  ]
})

const messageError = computed(() => {
  const { message } = parsed.value.values
  const { modulus } = keys.value
  return message !== undefined && modulus !== undefined && message >= modulus ? text.errors.messageRange : undefined
})

const encryption = computed(() => {
  const { message, e } = parsed.value.values
  const { modulus, privateExponent } = keys.value
  if (messageError.value || message === undefined || e === undefined || modulus === undefined || privateExponent === undefined)
    return undefined
  const ciphertext = modularPower(message, e, modulus)
  return { ciphertext, plaintext: modularPower(ciphertext.result, privateExponent, modulus) }
})

const errors = computed(() => [...keys.value.errors, ...(messageError.value ? [messageError.value] : [])])
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

    <div class="cipher-fields is-numeric">
      <label v-for="field in FIELDS" :key="field" class="cipher-field">
        <span>{{ text.fields[field] }}</span>
        <input v-model="inputs[field]" type="text" inputmode="numeric" spellcheck="false" autocomplete="off">
      </label>
    </div>

    <p v-for="error in errors" :key="error" class="cipher-error">
      {{ error }}
    </p>

    <template v-if="modulusLines.length > 0">
      <p class="study-label">
        {{ text.steps.modulus }}
      </p>
      <div class="cipher-formula">
        <div v-for="line in modulusLines" :key="line">
          {{ line }}
        </div>
      </div>
    </template>

    <template v-if="euclidLines.length > 0">
      <p class="study-label">
        {{ text.steps.inverse }}
      </p>
      <div class="cipher-formula">
        <div v-for="line in euclidLines" :key="line">
          {{ line }}
        </div>
        <div v-for="(line, index) in keyLines" :key="line" :class="{ 'cipher-formula-separated': index === 0 }">
          {{ line }}
        </div>
      </div>
      <p class="cipher-muted">
        {{ text.euclidHint }}
      </p>
    </template>

    <template v-if="encryption">
      <p class="study-label">
        {{ text.steps.encryption }}
      </p>
      <ModularPowerSteps :steps="encryption.ciphertext" result-label="C" />
      <p class="study-label">
        {{ text.steps.decryption }}
      </p>
      <ModularPowerSteps :steps="encryption.plaintext" result-label="M" />
      <p class="study-mono" :class="encryption.plaintext.result === parsed.values.message ? 'study-success' : 'study-alert'">
        {{ encryption.plaintext.result === parsed.values.message ? '✓' : '✗' }} {{ text.recovered(encryption.plaintext.result) }}
      </p>
    </template>
  </CipherFigure>
</template>
