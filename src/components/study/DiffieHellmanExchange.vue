<script setup lang="ts">
import type { PowerSteps } from '~/lib/modular'
import type { Language } from '~/logics/languages'
import { LANGUAGE_DEFINITIONS } from '~/logics/languages'
import { usePageLanguage } from '~/composables/usePageLanguage'
import { MAXIMUM_MODULUS, isPrime, isPrimitiveRoot, modularPower } from '~/lib/modular'

interface Inputs {
  prime: string
  alpha: string
  alicePrivate: string
  bobPrivate: string
  darthFirst: string
  darthSecond: string
}

type Field = keyof Inputs
/** The fields a preset sets: Darth's values stay as they are. */
type PresetField = 'prime' | 'alpha' | 'alicePrivate' | 'bobPrivate'
type Preset = 'slides' | 'list'
type Party = 'alice' | 'bob' | 'darth'

/** Slide 365 (also the notebook diffie_hellman_simples) and list 5 section 4 as solved in the guide. */
const PRESETS: Record<Preset, Pick<Inputs, PresetField>> = {
  slides: { prime: '353', alpha: '3', alicePrivate: '97', bobPrivate: '233' },
  list: { prime: '467', alpha: '2', alicePrivate: '3', bobPrivate: '10' },
}
const PRESET_ORDER: Preset[] = ['slides', 'list']
const DARTH_DEFAULTS = { darthFirst: '7', darthSecond: '12' }
const PUBLIC_FIELDS: PresetField[] = ['prime', 'alpha']
const PRIVATE_FIELDS: PresetField[] = ['alicePrivate', 'bobPrivate']
const DARTH_FIELDS: Field[] = ['darthFirst', 'darthSecond']
const PARTY_TONE: Record<Party, 'plain' | 'key' | 'result'> = { alice: 'plain', bob: 'key', darth: 'result' }
const DIGITS_PATTERN = /^\d{1,7}$/

/** The name of each value, as in slides 362 and 368. */
const SYMBOLS: Record<Field, string> = {
  prime: 'q',
  alpha: 'α',
  alicePrivate: 'X_A',
  bobPrivate: 'X_B',
  darthFirst: 'X_D1',
  darthSecond: 'X_D2',
}

interface Text {
  title: string
  presets: Record<Preset, string>
  darth: string
  parties: Record<Party, string>
  fields: Record<Field, string>
  sends: (value: string, receiver: string) => string
  intercepts: (value: string, replacement: string, receiver: string) => string
  stepsHint: string
  errors: {
    notNumber: (field: string) => string
    notPrime: (value: number) => string
    tooLarge: (limit: string) => string
    alphaRange: string
    privateRange: (symbol: string) => string
  }
  notPrimitive: (alpha: number, prime: number) => string
  shared: (key: number) => string
  split: (aliceKey: number, bobKey: number) => string
  splitByChance: (key: number) => string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'Diffie-Hellman, and Darth in the middle',
    presets: { slides: 'Slide 365: q = 353, α = 3', list: 'List 5: q = 467, α = 2' },
    darth: 'Darth in the middle',
    parties: { alice: 'Alice', bob: 'Bob', darth: 'Darth' },
    fields: {
      prime: 'prime q',
      alpha: 'primitive root α',
      alicePrivate: 'Alice, private X_A',
      bobPrivate: 'Bob, private X_B',
      darthFirst: 'Darth, private X_D1',
      darthSecond: 'Darth, private X_D2',
    },
    sends: (value, receiver) => `sends ${value} to ${receiver}`,
    intercepts: (value, replacement, receiver) => `intercepts ${value} and sends ${replacement} to ${receiver}`,
    stepsHint: 'Open a line for its square-and-multiply steps.',
    errors: {
      notNumber: field => `Enter a whole number for ${field}.`,
      notPrime: value => `q = ${value} is not prime.`,
      tooLarge: limit => `Keep q below ${limit}, a size for hand work.`,
      alphaRange: 'α must satisfy 1 < α < q.',
      privateRange: symbol => `${symbol} must satisfy 1 < ${symbol} < q − 1.`,
    },
    notPrimitive: (alpha, prime) => `α = ${alpha} is not a primitive root of ${prime}: its powers do not reach every value from 1 to ${prime - 1}, so fewer keys are possible. The exchange still works.`,
    shared: key => `Alice and Bob both get K = ${key} = α^(X_A × X_B) mod q, and K never crossed the network.`,
    split: (aliceKey, bobKey) => `Alice has K2 = ${aliceKey} and Bob has K1 = ${bobKey}. Each believes the key is shared with the other, but Darth knows both and can read and change every message.`,
    splitByChance: key => `Here K1 = K2 = ${key} by chance, but Darth still knows the key. Change X_D1 or X_D2.`,
  },
  pt: {
    title: 'Diffie-Hellman, e Darth no meio',
    presets: { slides: 'Slide 365: q = 353, α = 3', list: 'Lista 5: q = 467, α = 2' },
    darth: 'Darth no meio',
    parties: { alice: 'Alice', bob: 'Bob', darth: 'Darth' },
    fields: {
      prime: 'primo q',
      alpha: 'raiz primitiva α',
      alicePrivate: 'Alice, privado X_A',
      bobPrivate: 'Bob, privado X_B',
      darthFirst: 'Darth, privado X_D1',
      darthSecond: 'Darth, privado X_D2',
    },
    sends: (value, receiver) => `envia ${value} para ${receiver}`,
    intercepts: (value, replacement, receiver) => `intercepta ${value} e envia ${replacement} para ${receiver}`,
    stepsHint: 'Abra uma linha para ver os passos de quadrado e multiplicação.',
    errors: {
      notNumber: field => `Digite um número inteiro para ${field}.`,
      notPrime: value => `q = ${value} não é primo.`,
      tooLarge: limit => `Mantenha q abaixo de ${limit}, um tamanho para conta à mão.`,
      alphaRange: 'α precisa satisfazer 1 < α < q.',
      privateRange: symbol => `${symbol} precisa satisfazer 1 < ${symbol} < q − 1.`,
    },
    notPrimitive: (alpha, prime) => `α = ${alpha} não é raiz primitiva de ${prime}: suas potências não alcançam todos os valores de 1 a ${prime - 1}, então há menos chaves possíveis. A troca ainda funciona.`,
    shared: key => `Alice e Bob obtêm K = ${key} = α^(X_A × X_B) mod q, e K nunca passou pela rede.`,
    split: (aliceKey, bobKey) => `Alice tem K2 = ${aliceKey} e Bob tem K1 = ${bobKey}. Cada um acredita que a chave é compartilhada com o outro, mas Darth conhece as duas e pode ler e mudar cada mensagem.`,
    splitByChance: key => `Aqui K1 = K2 = ${key} por acaso, mas Darth ainda conhece a chave. Mude X_D1 ou X_D2.`,
  },
}

const language = usePageLanguage()
const text = TEXT[language]
const limitText = new Intl.NumberFormat(LANGUAGE_DEFINITIONS[language].locale).format(MAXIMUM_MODULUS)

const inputs = reactive<Inputs>({ ...PRESETS.slides, ...DARTH_DEFAULTS })
const darthActive = ref(false)
const activePreset = computed(() => PRESET_ORDER.find(preset =>
  [...PUBLIC_FIELDS, ...PRIVATE_FIELDS].every(field => inputs[field] === PRESETS[preset][field])))

function selectPreset(preset: Preset) {
  Object.assign(inputs, PRESETS[preset])
}

const shownFields = computed(() => [...PUBLIC_FIELDS, ...PRIVATE_FIELDS, ...(darthActive.value ? DARTH_FIELDS : [])])

const validated = computed(() => {
  const values: Partial<Record<Field, number>> = {}
  const errors: string[] = []
  for (const field of shownFields.value) {
    const value = inputs[field].trim()
    if (DIGITS_PATTERN.test(value))
      values[field] = Number(value)
    else
      errors.push(text.errors.notNumber(text.fields[field]))
  }
  if (errors.length > 0)
    return { errors }
  const numbers = values as Record<Field, number>
  const { prime, alpha } = numbers
  if (!isPrime(prime))
    return { errors: [text.errors.notPrime(prime)] }
  if (prime >= MAXIMUM_MODULUS)
    return { errors: [text.errors.tooLarge(limitText)] }
  if (alpha <= 1 || alpha >= prime)
    errors.push(text.errors.alphaRange)
  for (const field of [...PRIVATE_FIELDS, ...(darthActive.value ? DARTH_FIELDS : [])]) {
    if (numbers[field] <= 1 || numbers[field] >= prime - 1)
      errors.push(text.errors.privateRange(SYMBOLS[field]))
  }
  return { errors, values: errors.length === 0 ? numbers : undefined }
})

const primitiveWarning = computed(() => {
  const values = validated.value.values
  return values && !isPrimitiveRoot(values.alpha, values.prime) ? text.notPrimitive(values.alpha, values.prime) : undefined
})

interface Line {
  party: Party
  /** A computation, shown as a formula that opens to its square-and-multiply steps. */
  power?: { label: string, formula: string, steps: PowerSteps }
  message?: string
}

function computation(party: Party, label: string, formula: string, base: number, exponent: number, prime: number): Line {
  const steps = modularPower(base, exponent, prime)
  return { party, power: { label, formula: `${label} = ${formula} = ${base}^${exponent} mod ${prime} = ${steps.result}`, steps } }
}

const exchange = computed(() => {
  const values = validated.value.values
  if (!values)
    return undefined
  const { prime, alpha, alicePrivate, bobPrivate, darthFirst, darthSecond } = values
  const alicePublic = modularPower(alpha, alicePrivate, prime).result
  const bobPublic = modularPower(alpha, bobPrivate, prime).result
  const lines: Line[] = [
    computation('alice', 'Y_A', 'α^X_A mod q', alpha, alicePrivate, prime),
    computation('bob', 'Y_B', 'α^X_B mod q', alpha, bobPrivate, prime),
  ]
  if (!darthActive.value) {
    lines.push(
      { party: 'alice', message: text.sends(`Y_A = ${alicePublic}`, text.parties.bob) },
      { party: 'bob', message: text.sends(`Y_B = ${bobPublic}`, text.parties.alice) },
      computation('alice', 'K', 'Y_B^X_A mod q', bobPublic, alicePrivate, prime),
      computation('bob', 'K', 'Y_A^X_B mod q', alicePublic, bobPrivate, prime),
    )
    return { lines, aliceKey: modularPower(bobPublic, alicePrivate, prime).result, bobKey: modularPower(alicePublic, bobPrivate, prime).result }
  }
  const darthFirstPublic = modularPower(alpha, darthFirst, prime).result
  const darthSecondPublic = modularPower(alpha, darthSecond, prime).result
  // The order of slide 368: Darth answers Alice's value with Y_D1 to Bob, and Bob's value with Y_D2 to Alice.
  lines.push(
    computation('darth', 'Y_D1', 'α^X_D1 mod q', alpha, darthFirst, prime),
    computation('darth', 'Y_D2', 'α^X_D2 mod q', alpha, darthSecond, prime),
    { party: 'alice', message: text.sends(`Y_A = ${alicePublic}`, text.parties.bob) },
    { party: 'darth', message: text.intercepts(`Y_A`, `Y_D1 = ${darthFirstPublic}`, text.parties.bob) },
    computation('darth', 'K2', 'Y_A^X_D2 mod q', alicePublic, darthSecond, prime),
    computation('bob', 'K1', 'Y_D1^X_B mod q', darthFirstPublic, bobPrivate, prime),
    { party: 'bob', message: text.sends(`Y_B = ${bobPublic}`, text.parties.alice) },
    { party: 'darth', message: text.intercepts(`Y_B`, `Y_D2 = ${darthSecondPublic}`, text.parties.alice) },
    computation('darth', 'K1', 'Y_B^X_D1 mod q', bobPublic, darthFirst, prime),
    computation('alice', 'K2', 'Y_D2^X_A mod q', darthSecondPublic, alicePrivate, prime),
  )
  return { lines, aliceKey: modularPower(darthSecondPublic, alicePrivate, prime).result, bobKey: modularPower(darthFirstPublic, bobPrivate, prime).result }
})

const outcome = computed(() => {
  const result = exchange.value
  if (!result)
    return undefined
  if (!darthActive.value)
    return { success: result.aliceKey === result.bobKey, text: text.shared(result.aliceKey) }
  return { success: false, text: result.aliceKey === result.bobKey ? text.splitByChance(result.aliceKey) : text.split(result.aliceKey, result.bobKey) }
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
      <button type="button" class="study-button" :aria-pressed="darthActive" @click="darthActive = !darthActive">
        {{ text.darth }}
      </button>
    </div>

    <div class="cipher-fields is-numeric">
      <label v-for="field in shownFields" :key="field" class="cipher-field">
        <span>{{ text.fields[field] }}</span>
        <input v-model="inputs[field]" type="text" inputmode="numeric" spellcheck="false" autocomplete="off">
      </label>
    </div>

    <p v-for="error in validated.errors" :key="error" class="cipher-error">
      {{ error }}
    </p>
    <p v-if="primitiveWarning" class="cipher-muted">
      {{ primitiveWarning }}
    </p>

    <template v-if="exchange">
      <p class="cipher-muted">
        {{ text.stepsHint }}
      </p>
      <div class="dh-lines">
        <template v-for="(line, index) in exchange.lines" :key="index">
          <span class="dh-party study-mono" :class="`cipher-${PARTY_TONE[line.party]}`">{{ text.parties[line.party] }}</span>
          <details v-if="line.power" class="dh-detail">
            <summary class="study-mono">
              {{ line.power.formula }}
            </summary>
            <ModularPowerSteps :steps="line.power.steps" :result-label="line.power.label" />
          </details>
          <span v-else class="study-mono">{{ line.message }}</span>
        </template>
      </div>
      <p v-if="outcome" class="study-mono" :class="outcome.success ? 'study-success' : 'study-alert'">
        {{ outcome.success ? '✓' : '✗' }} {{ outcome.text }}
      </p>
    </template>
  </CipherFigure>
</template>

<style scoped>
/* One row per action: the party in the first column, the action or computation in the second. */
.dh-lines {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.5rem 0.75rem;
  align-items: baseline;
}

.dh-detail {
  min-width: 0;

  summary {
    cursor: pointer;
  }

  > :not(summary) {
    margin-top: 0.4rem;
  }
}
</style>
