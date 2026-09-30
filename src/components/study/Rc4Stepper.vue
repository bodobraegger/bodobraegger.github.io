<script setup lang="ts">
import type { Language } from '~/logics/languages'
import type { Rc4Phase, Rc4Step } from '~/lib/rc4'
import { rc4Trace } from '~/lib/rc4'
import { usePageLanguage } from '~/composables/usePageLanguage'

/** A small state keeps every value readable. Real RC4 uses 256 entries and arithmetic mod 256. */
const STATE_SIZE = 8
const KEYSTREAM_LENGTH = 8
const DEFAULT_KEY = '1 2 3 6'
const MAX_KEY_LENGTH = STATE_SIZE
const PLAY_INTERVAL_MS = 1400
const NUMBER_SEPARATOR_PATTERN = /[\s,;]+/
const DIGITS_PATTERN = /^\d+$/
const PHASES: Rc4Phase[] = ['start', 'ksa', 'prga']

interface Text {
  title: string
  smallState: string
  key: string
  phases: Record<Rc4Phase, string>
  step: (current: number, total: number) => string
  back: string
  next: string
  play: string
  pause: string
  reset: string
  keyUnused: string
  keystream: string
  encrypt: string
  swap: (i: number, j: number) => string
  noSwap: string
  identity: string
  expanded: (values: string) => string
  badKey: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'RC4 step by step: key scheduling (KSA) and keystream generation (PRGA)',
    smallState: `This demo uses a state S of ${STATE_SIZE} entries (0 to ${STATE_SIZE - 1}) instead of 256, so all arithmetic is mod ${STATE_SIZE}. The steps are the same as in real RC4.`,
    key: `Key K (numbers 0 to ${STATE_SIZE - 1}, at most ${MAX_KEY_LENGTH})`,
    phases: { start: 'Start', ksa: 'KSA', prga: 'PRGA' },
    step: (current, total) => `step ${current} of ${total}`,
    back: 'Back',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
    reset: 'Reset',
    keyUnused: 'T is no longer used',
    keystream: 'Keystream k',
    encrypt: 'Encryption is c = p XOR k, decryption is p = c XOR k.',
    swap: (i, j) => `swap S[${i}] and S[${j}]`,
    noSwap: 'i = j: the swap changes nothing',
    identity: `S[i] = i for i from 0 to ${STATE_SIZE - 1}.`,
    expanded: values => `T is the key repeated to ${STATE_SIZE} entries: ${values}.`,
    badKey: `Type 1 to ${MAX_KEY_LENGTH} numbers from 0 to ${STATE_SIZE - 1}, separated by spaces.`,
  },
  pt: {
    title: 'RC4 passo a passo: escalonamento da chave (KSA) e geração do keystream (PRGA)',
    smallState: `Esta demonstração usa um estado S de ${STATE_SIZE} posições (0 a ${STATE_SIZE - 1}) em vez de 256, então toda a aritmética é mod ${STATE_SIZE}. Os passos são os mesmos do RC4 real.`,
    key: `Chave K (números de 0 a ${STATE_SIZE - 1}, no máximo ${MAX_KEY_LENGTH})`,
    phases: { start: 'Início', ksa: 'KSA', prga: 'PRGA' },
    step: (current, total) => `passo ${current} de ${total}`,
    back: 'Voltar',
    next: 'Avançar',
    play: 'Reproduzir',
    pause: 'Pausar',
    reset: 'Reiniciar',
    keyUnused: 'T não é mais usado',
    keystream: 'Keystream k',
    encrypt: 'A cifragem é c = p XOR k, a decifragem é p = c XOR k.',
    swap: (i, j) => `troca S[${i}] e S[${j}]`,
    noSwap: 'i = j: a troca não muda nada',
    identity: `S[i] = i para i de 0 a ${STATE_SIZE - 1}.`,
    expanded: values => `T é a chave repetida até ${STATE_SIZE} posições: ${values}.`,
    badKey: `Digite de 1 a ${MAX_KEY_LENGTH} números de 0 a ${STATE_SIZE - 1}, separados por espaços.`,
  },
}

const text = TEXT[usePageLanguage()]

const keyText = ref(DEFAULT_KEY)
const stepIndex = ref(0)

const key = computed(() => {
  const parts = keyText.value.trim().split(NUMBER_SEPARATOR_PATTERN).filter(Boolean)
  if (parts.length === 0 || parts.length > MAX_KEY_LENGTH || !parts.every(part => DIGITS_PATTERN.test(part)))
    return undefined
  const values = parts.map(Number)
  return values.every(value => value < STATE_SIZE) ? values : undefined
})

const steps = computed(() => key.value ? rc4Trace(key.value, STATE_SIZE, KEYSTREAM_LENGTH) : [])
const step = computed<Rc4Step | undefined>(() => steps.value[Math.min(stepIndex.value, steps.value.length - 1)])
const isLast = computed(() => stepIndex.value >= steps.value.length - 1)

const { isActive: isPlaying, pause, resume } = useIntervalFn(() => {
  if (isLast.value)
    pause()
  else
    stepIndex.value++
}, PLAY_INTERVAL_MS, { immediate: false })

watch(key, () => {
  stepIndex.value = 0
  pause()
})

function togglePlay() {
  if (isPlaying.value) {
    pause()
    return
  }
  if (isLast.value)
    stepIndex.value = 0
  resume()
}

function goBack() {
  pause()
  stepIndex.value = Math.max(0, stepIndex.value - 1)
}

function goNext() {
  pause()
  stepIndex.value = Math.min(steps.value.length - 1, stepIndex.value + 1)
}

function reset() {
  pause()
  stepIndex.value = 0
}

/** The cells of S in display order, keyed by value so a swap moves the two cells. */
const cells = computed(() => step.value?.state.map((value, position) => ({ value, position })) ?? [])

function pointers(position: number): string[] {
  const current = step.value
  if (!current || current.phase === 'start')
    return []
  const names: string[] = []
  if (current.i === position)
    names.push('i')
  if (current.j === position)
    names.push('j')
  if (current.t === position)
    names.push('t')
  return names
}

const formula = computed(() => {
  const current = step.value
  if (!current)
    return ''
  if (current.phase === 'start')
    return `${text.identity}\n${text.expanded(current.expandedKey.join(' '))}`
  const i = current.i!
  const j = current.j!
  const swapLine = i === j ? text.noSwap : text.swap(i, j)
  // After the swap, the old S[i] sits at position j.
  const oldStateAtI = current.state[j]
  if (current.phase === 'ksa') {
    return [
      `i = ${i}`,
      `j = (j + S[i] + T[i]) mod ${STATE_SIZE}`,
      `  = (${current.previousJ} + ${oldStateAtI} + ${current.expandedKey[i]}) mod ${STATE_SIZE} = ${j}`,
      swapLine,
    ].join('\n')
  }
  const previousI = (i - 1 + STATE_SIZE) % STATE_SIZE
  return [
    `i = (i + 1) mod ${STATE_SIZE}`,
    `  = (${previousI} + 1) mod ${STATE_SIZE} = ${i}`,
    `j = (j + S[i]) mod ${STATE_SIZE}`,
    `  = (${current.previousJ} + ${oldStateAtI}) mod ${STATE_SIZE} = ${j}`,
    swapLine,
    `t = (S[i] + S[j]) mod ${STATE_SIZE}`,
    `  = (${current.state[i]} + ${current.state[j]}) mod ${STATE_SIZE} = ${current.t}`,
    `k = S[t] = S[${current.t}] = ${current.output}`,
  ].join('\n')
})
</script>

<template>
  <CipherFigure :title="text.title">
    <p class="cipher-muted">
      {{ text.smallState }}
    </p>
    <div class="cipher-fields">
      <label class="cipher-field">
        <span class="cipher-key">{{ text.key }}</span>
        <input v-model="keyText" type="text" inputmode="numeric" spellcheck="false" autocomplete="off">
      </label>
    </div>

    <p v-if="!step" class="cipher-error" role="alert">
      {{ text.badKey }}
    </p>
    <template v-else>
      <div class="study-controls">
        <button type="button" class="study-button" :disabled="stepIndex === 0" @click="goBack">
          {{ text.back }}
        </button>
        <button type="button" class="study-button" :disabled="isLast" @click="goNext">
          {{ text.next }}
        </button>
        <button type="button" class="study-button" :aria-pressed="isPlaying" @click="togglePlay">
          {{ isPlaying ? text.pause : text.play }}
        </button>
        <button type="button" class="study-button" @click="reset">
          {{ text.reset }}
        </button>
      </div>

      <div class="rc4-phases study-mono" aria-live="polite">
        <span
          v-for="phase in PHASES"
          :key="phase"
          class="rc4-phase"
          :class="{ 'is-current': phase === step.phase }"
        >{{ text.phases[phase] }}</span>
        <span class="study-label">{{ text.step(stepIndex + 1, steps.length) }}</span>
      </div>

      <div class="rc4-arrays study-mono" :style="{ '--rc4-size': STATE_SIZE }">
        <span class="rc4-row-label" />
        <div class="rc4-row">
          <span v-for="position in STATE_SIZE" :key="position" class="rc4-index">{{ position - 1 }}</span>
        </div>

        <span class="rc4-row-label">S</span>
        <TransitionGroup tag="div" name="rc4-swap" class="rc4-row">
          <span
            v-for="cell in cells"
            :key="cell.value"
            class="rc4-cell"
            :class="{ 'is-swapped': step.swapped?.includes(cell.position), 'is-output': step.phase === 'prga' && cell.position === step.t }"
          >{{ cell.value }}</span>
        </TransitionGroup>

        <span class="rc4-row-label" />
        <div class="rc4-row" aria-hidden="true">
          <span v-for="position in STATE_SIZE" :key="position" class="rc4-pointer">{{ pointers(position - 1).join(' ') }}</span>
        </div>

        <span class="rc4-row-label cipher-key">T</span>
        <div class="rc4-row" :class="{ 'is-unused': step.phase === 'prga' }">
          <span
            v-for="(value, position) in step.expandedKey"
            :key="position"
            class="rc4-cell rc4-key-cell"
            :class="{ 'is-read': step.phase === 'ksa' && position === step.i }"
          >{{ value }}</span>
        </div>
        <span v-if="step.phase === 'prga'" class="rc4-unused-note study-label">{{ text.keyUnused }}</span>
      </div>

      <div class="cipher-formula">
        {{ formula }}
      </div>

      <p>
        <span class="study-label">{{ text.keystream }}: </span>
        <span class="study-mono rc4-keystream">
          <span
            v-for="(value, index) in step.keystream"
            :key="index"
            :class="{ 'is-latest': index === step.keystream.length - 1 }"
          >{{ value }}</span>
        </span>
      </p>
      <p class="cipher-muted">
        {{ text.encrypt }}
      </p>
    </template>
  </CipherFigure>
</template>

<style scoped>
.rc4-phases {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.3rem 0.8rem;
}

.rc4-phase {
  color: var(--fg-muted);

  &.is-current {
    color: var(--fg-deeper);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 0.25em;
  }
}

.rc4-arrays {
  display: grid;
  grid-template-columns: 1.5rem minmax(0, 20rem);
  row-gap: 0.25rem;
  align-items: center;
}

.rc4-row-label {
  font-weight: 700;
}

.rc4-row {
  display: grid;
  grid-template-columns: repeat(var(--rc4-size), minmax(0, 1fr));
  gap: 3px;

  &.is-unused {
    opacity: 0.35;
  }
}

.rc4-index,
.rc4-pointer {
  text-align: center;
  font-size: 0.75rem;
  color: var(--fg-muted);
}

.rc4-pointer {
  min-height: 1.2em;
  color: var(--fg-deeper);
  font-weight: 700;
}

.rc4-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.4rem;
  border: 1px solid var(--c-border);
  color: var(--fg-deep);
  font-size: 1.05rem;
  transition:
    background-color 0.3s,
    border-color 0.3s;

  &.is-swapped {
    border: 2px solid var(--cipher-plain);
    background: var(--cipher-plain-soft);
    color: var(--cipher-plain);
    font-weight: 700;
  }

  &.is-output {
    background: var(--cipher-result-soft);
    border-color: var(--cipher-result);
    color: var(--cipher-result);
    font-weight: 700;
  }
}

.rc4-key-cell {
  height: 2rem;
  color: var(--cipher-key);
  border-style: dashed;

  &.is-read {
    border: 2px solid var(--cipher-key);
    background: var(--cipher-key-soft);
    font-weight: 700;
  }
}

.rc4-unused-note {
  grid-column: 2;
}

.rc4-swap-move {
  transition: transform 0.6s ease-in-out;
}

.rc4-keystream {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.6ch;

  .is-latest {
    color: var(--cipher-result);
    font-weight: 700;
  }
}

.cipher-formula {
  font-size: 0.85rem;
}
</style>
