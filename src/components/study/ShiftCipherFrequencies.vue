<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { LANGUAGE_DEFINITIONS } from '~/logics/languages'
import type { SubstitutedCharacter } from '~/lib/classic-ciphers'
import { ALPHABET, keywordShifts, letterAt, letterCounts, letterIndex, substitute } from '~/lib/classic-ciphers'
import { usePageLanguage } from '~/composables/usePageLanguage'

const { initialMode = 'caesar' } = defineProps<{ initialMode?: Mode }>()
const MODES = ['caesar', 'vigenere'] as const
type Mode = typeof MODES[number]

/** The worked examples of sections 2.6 and 2.10. */
const GUIDE_SHIFT = 3
const GUIDE_KEYWORD = 'deceptive'
const GUIDE_MESSAGES: Record<Mode, string> = {
  caesar: 'meet me after the toga party',
  vigenere: 'we are discovered save yourself',
}
const MIN_SHIFT = 1
const MAX_SHIFT = 25
const PERCENT = 100
const PERCENT_DIGITS = 1
const MAX_TEXT_LENGTH = 2000
const WORD_BREAK_PATTERN = /\s/

interface Text {
  title: Record<Mode, string>
  modes: Record<Mode, string>
  shift: string
  keyword: string
  message: string
  guideExample: string
  longText: string
  sampleText: string
  tapLetter: string
  plainRow: string
  keyRow: string
  cipherRow: string
  mapping: (plain: string, keyLetter: string | undefined, shift: number, cipher: string) => string
  frequencies: string
  plainChart: string
  cipherChart: string
  tallest: (letter: string, percent: string) => string
  letterCount: (count: number) => string
  observation: Record<Mode, string>
  shortTextNote: string
  noKey: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: {
      caesar: 'Caesar: one shift for every letter, and the frequencies keep their shape',
      vigenere: 'Vigenère: the keyword changes the shift, and the frequencies become flatter',
    },
    modes: { caesar: 'Caesar', vigenere: 'Vigenère' },
    shift: 'Shift k',
    keyword: 'Keyword',
    message: 'Plaintext',
    guideExample: 'Guide example',
    longText: 'Long text',
    sampleText: 'The security of a classical cipher depends on the key and on the structure of the language. In English the letter E is the most common letter, followed by T, A, O, I and N. A Caesar cipher moves every letter by the same amount, so the most common letter of the ciphertext is still the image of E. The attacker counts the letters, finds the tallest bar and reads the shift. A polyalphabetic cipher uses several shifts in turn, so each plaintext letter can become several different ciphertext letters, and the counts are spread over the whole alphabet. The frequency shape becomes flatter, but the key still repeats, and the Kasiski method can find its length.',
    tapLetter: 'Tap a letter to see its mapping.',
    plainRow: 'plain',
    keyRow: 'key',
    cipherRow: 'cipher',
    mapping: (plain, keyLetter, shift, cipher) => keyLetter
      ? `${plain} with key letter ${keyLetter} (shift ${shift}) becomes ${cipher}: (${letterIndex(plain)} + ${shift}) mod 26 = ${letterIndex(cipher)}.`
      : `${plain} with shift ${shift} becomes ${cipher}: (${letterIndex(plain)} + ${shift}) mod 26 = ${letterIndex(cipher)}.`,
    frequencies: 'Letter frequencies',
    plainChart: 'Plaintext',
    cipherChart: 'Ciphertext',
    tallest: (letter, percent) => `tallest bar: ${letter}, ${percent}%`,
    letterCount: count => `${count} letters`,
    observation: {
      caesar: 'The ciphertext chart is the plaintext chart moved k places to the right. The shape stays, so the tallest bar gives away the shift.',
      vigenere: 'Each plaintext letter becomes several different letters, so the counts spread out and the chart is flatter. The key still repeats, which is what the Kasiski attack uses.',
    },
    shortTextNote: 'A short text gives irregular bars. Use the long text to see the shape.',
    noKey: 'Type a keyword with at least one letter.',
  },
  pt: {
    title: {
      caesar: 'César: um deslocamento para todas as letras, e as frequências mantêm o formato',
      vigenere: 'Vigenère: a palavra-chave muda o deslocamento, e as frequências ficam mais planas',
    },
    modes: { caesar: 'César', vigenere: 'Vigenère' },
    shift: 'Deslocamento k',
    keyword: 'Palavra-chave',
    message: 'Texto claro',
    guideExample: 'Exemplo do guia',
    longText: 'Texto longo',
    sampleText: 'A segurança de uma cifra clássica depende da chave e da estrutura da língua. Em português as letras mais comuns são A, E, O, S e R. A cifra de César desloca todas as letras pela mesma quantidade, então a letra mais comum do texto cifrado ainda é a imagem do A ou do E. O atacante conta as letras, encontra a barra mais alta e descobre o deslocamento. Uma cifra polialfabética usa vários deslocamentos em sequência, então cada letra do texto claro pode virar várias letras diferentes no cifrado, e as contagens se espalham pelo alfabeto inteiro. O formato das frequências fica mais plano, mas a chave ainda se repete, e o método de Kasiski consegue descobrir o seu comprimento.',
    tapLetter: 'Toque numa letra para ver o mapeamento.',
    plainRow: 'claro',
    keyRow: 'chave',
    cipherRow: 'cifrado',
    mapping: (plain, keyLetter, shift, cipher) => keyLetter
      ? `${plain} com a letra da chave ${keyLetter} (deslocamento ${shift}) vira ${cipher}: (${letterIndex(plain)} + ${shift}) mod 26 = ${letterIndex(cipher)}.`
      : `${plain} com deslocamento ${shift} vira ${cipher}: (${letterIndex(plain)} + ${shift}) mod 26 = ${letterIndex(cipher)}.`,
    frequencies: 'Frequência das letras',
    plainChart: 'Texto claro',
    cipherChart: 'Texto cifrado',
    tallest: (letter, percent) => `barra mais alta: ${letter}, ${percent}%`,
    letterCount: count => `${count} letras`,
    observation: {
      caesar: 'O gráfico do cifrado é o gráfico do texto claro deslocado k posições para a direita. O formato se mantém, então a barra mais alta entrega o deslocamento.',
      vigenere: 'Cada letra do texto claro vira várias letras diferentes, então as contagens se espalham e o gráfico fica mais plano. A chave ainda se repete, e é isso que o ataque de Kasiski usa.',
    },
    shortTextNote: 'Um texto curto dá barras irregulares. Use o texto longo para ver o formato.',
    noKey: 'Digite uma palavra-chave com pelo menos uma letra.',
  },
}

/** Below this many letters the counts are too irregular to show a shape. */
const SHAPE_MIN_LETTERS = 200

const language = usePageLanguage()
const text = TEXT[language]
const percentFormat = new Intl.NumberFormat(LANGUAGE_DEFINITIONS[language].locale, {
  minimumFractionDigits: PERCENT_DIGITS,
  maximumFractionDigits: PERCENT_DIGITS,
})

const mode = ref<Mode>(initialMode)
const shift = ref(GUIDE_SHIFT)
const keyword = ref(GUIDE_KEYWORD)
const message = ref(GUIDE_MESSAGES[initialMode])
const selectedPosition = ref<number>()

const shifts = computed(() => mode.value === 'caesar' ? [shift.value] : keywordShifts(keyword.value))
const characters = computed(() => substitute(message.value, shifts.value))
/** Groups of characters that wrap as one, so a line break never splits a word. Each group ends with its space. */
const words = computed(() => {
  const groups: { character: SubstitutedCharacter, position: number }[][] = [[]]
  characters.value.forEach((character, position) => {
    groups[groups.length - 1].push({ character, position })
    if (WORD_BREAK_PATTERN.test(character.plain))
      groups.push([])
  })
  return groups.filter(group => group.length > 0)
})
const letterPositions = computed(() => characters.value.flatMap((character, position) => character.shift === undefined ? [] : [position]))

const selected = computed(() => {
  const position = selectedPosition.value !== undefined && characters.value[selectedPosition.value]?.shift !== undefined
    ? selectedPosition.value
    : letterPositions.value[0]
  return position === undefined ? undefined : { position, ...characters.value[position] }
})

const selectedKeyLetter = computed(() => {
  if (mode.value !== 'vigenere' || selected.value?.shift === undefined)
    return undefined
  return letterAt(selected.value.shift)
})

const cipherAlphabet = computed(() => [...ALPHABET].map(letter => letterAt(letterIndex(letter) + (selected.value?.shift ?? 0))))

interface Series {
  label: string
  tone: 'plain' | 'result'
  percents: number[]
  tallest: { letter: string, percent: string }
  highlighted?: string
}

function toSeries(label: string, tone: Series['tone'], letters: string, highlighted?: string): Series {
  const counts = letterCounts(letters)
  const total = counts.reduce((sum, count) => sum + count, 0) || 1
  const percents = counts.map(count => count / total * PERCENT)
  const tallestIndex = percents.indexOf(Math.max(...percents))
  return {
    label,
    tone,
    percents,
    tallest: { letter: ALPHABET[tallestIndex], percent: percentFormat.format(percents[tallestIndex]) },
    highlighted,
  }
}

const letterTotal = computed(() => letterPositions.value.length)
const series = computed(() => [
  toSeries(text.plainChart, 'plain', characters.value.map(character => character.plain).join(''), selected.value?.plain),
  toSeries(text.cipherChart, 'result', characters.value.map(character => character.cipher).join(''), selected.value?.cipher),
])
/** Both charts share one scale, so a flatter chart looks flatter. */
const chartMaximum = computed(() => Math.max(...series.value.flatMap(entry => entry.percents), 1))

function setMode(next: Mode) {
  if (mode.value === next)
    return
  const showsGuideExample = message.value === GUIDE_MESSAGES[mode.value]
  mode.value = next
  if (showsGuideExample)
    message.value = GUIDE_MESSAGES[next]
}

function barTitle(entry: Series, index: number): string {
  return `${ALPHABET[index]}: ${percentFormat.format(entry.percents[index])}%`
}

watch(message, () => selectedPosition.value = undefined)
</script>

<template>
  <CipherFigure :title="text.title[mode]">
    <div class="study-controls">
      <button
        v-for="option in MODES"
        :key="option"
        type="button"
        class="study-button"
        :aria-pressed="mode === option"
        @click="setMode(option)"
      >
        {{ text.modes[option] }}
      </button>
    </div>

    <div class="cipher-fields">
      <label v-if="mode === 'caesar'" class="cipher-field">
        <span class="cipher-key">{{ text.shift }} = {{ shift }}</span>
        <input v-model.number="shift" type="range" :min="MIN_SHIFT" :max="MAX_SHIFT" step="1">
      </label>
      <label v-else class="cipher-field">
        <span class="cipher-key">{{ text.keyword }}</span>
        <input v-model="keyword" type="text" spellcheck="false" autocomplete="off">
      </label>
    </div>
    <label class="cipher-field">
      <span class="cipher-plain">{{ text.message }}</span>
      <textarea v-model="message" class="shift-message" spellcheck="false" :maxlength="MAX_TEXT_LENGTH" rows="2" />
    </label>
    <div class="study-controls">
      <button type="button" class="study-button" :aria-pressed="message === GUIDE_MESSAGES[mode]" @click="message = GUIDE_MESSAGES[mode]">
        {{ text.guideExample }}
      </button>
      <button type="button" class="study-button" :aria-pressed="message === text.sampleText" @click="message = text.sampleText">
        {{ text.longText }}
      </button>
    </div>

    <p v-if="shifts.length === 0" class="cipher-error" role="alert">
      {{ text.noKey }}
    </p>
    <template v-else>
      <div>
        <p class="study-label">
          {{ text.tapLetter }}
        </p>
        <div class="shift-text study-mono">
          <span class="shift-column shift-legend">
            <span class="cipher-plain">{{ text.plainRow }}</span>
            <span v-if="mode === 'vigenere'" class="cipher-key">{{ text.keyRow }}</span>
            <span class="cipher-result">{{ text.cipherRow }}</span>
          </span>
          <span v-for="word in words" :key="word[0].position" class="shift-word">
            <span
              v-for="{ character, position } in word"
              :key="position"
              class="shift-column"
              :class="{ 'is-letter': character.shift !== undefined, 'is-selected': position === selected?.position, 'is-space': character.plain === ' ' }"
              @click="character.shift !== undefined && (selectedPosition = position)"
            >
              <span class="cipher-plain">{{ character.plain }}</span>
              <span v-if="mode === 'vigenere'" class="cipher-key">{{ character.shift === undefined ? '' : letterAt(character.shift).toLowerCase() }}</span>
              <span class="cipher-result">{{ character.cipher }}</span>
            </span>
          </span>
        </div>
      </div>

      <div v-if="selected && selected.shift !== undefined">
        <p>{{ text.mapping(selected.plain, selectedKeyLetter, selected.shift, selected.cipher) }}</p>
        <div class="shift-alphabet study-mono" aria-hidden="true">
          <span
            v-for="letter in ALPHABET"
            :key="`plain-${letter}`"
            class="cipher-plain"
            :class="{ 'is-selected': letter === selected.plain }"
          >{{ letter }}</span>
          <span
            v-for="(letter, index) in cipherAlphabet"
            :key="`cipher-${index}`"
            class="cipher-result"
            :class="{ 'is-selected': ALPHABET[index] === selected.plain }"
          >{{ letter }}</span>
        </div>
      </div>

      <div>
        <p class="study-label">
          {{ text.frequencies }} ({{ text.letterCount(letterTotal) }})
        </p>
        <div v-for="entry in series" :key="entry.label" class="shift-chart">
          <div class="shift-chart-heading">
            <span :class="`cipher-${entry.tone}`">{{ entry.label }}</span>
            <span class="study-label">{{ text.tallest(entry.tallest.letter, entry.tallest.percent) }}</span>
          </div>
          <div class="shift-bars" role="img" :aria-label="`${entry.label}: ${text.tallest(entry.tallest.letter, entry.tallest.percent)}`">
            <span
              v-for="(percent, index) in entry.percents"
              :key="index"
              class="shift-bar-column"
              :title="barTitle(entry, index)"
            >
              <span
                class="shift-bar"
                :class="[`shift-bar-${entry.tone}`, { 'is-selected': ALPHABET[index] === entry.highlighted }]"
                :style="{ height: `${percent / chartMaximum * PERCENT}%` }"
              />
            </span>
          </div>
          <div class="shift-axis study-mono" aria-hidden="true">
            <span v-for="letter in ALPHABET" :key="letter" :class="{ 'is-selected': letter === entry.highlighted }">{{ letter }}</span>
          </div>
        </div>
        <p v-if="letterTotal < SHAPE_MIN_LETTERS" class="cipher-muted">
          {{ text.shortTextNote }}
        </p>
        <p>{{ text.observation[mode] }}</p>
      </div>
    </template>
  </CipherFigure>
</template>

<style scoped>
.shift-text {
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.4rem;
  max-height: 16rem;
  overflow-y: auto;
  margin-top: 0.3rem;
  font-size: 0.95rem;
}

.shift-word {
  display: inline-flex;
}

.shift-column {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 1.15ch;
  line-height: 1.3;

  &.is-letter {
    cursor: pointer;
  }

  &.is-space {
    min-width: 1.6ch;
  }

  &.is-selected {
    background: var(--c-border-soft);
    outline: 1px solid var(--fg-muted);
    font-weight: 700;
  }
}

.cipher-figure textarea.shift-message {
  max-height: 9rem;
}

.shift-legend {
  align-items: flex-start;
  margin-right: 0.8ch;
  font-size: 0.75rem;
  line-height: 1.66;
}

.shift-alphabet {
  display: grid;
  grid-template-columns: repeat(26, minmax(0, 1fr));
  margin-top: 0.4rem;
  font-size: 0.75rem;
  text-align: center;
  line-height: 1.7;

  .is-selected {
    background: var(--c-border-soft);
    outline: 1px solid var(--fg-muted);
    font-weight: 700;
  }
}

.shift-chart {
  margin-top: 0.6rem;
}

.shift-chart-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0 1rem;
  font-size: 0.85rem;
}

.shift-bars {
  display: grid;
  grid-template-columns: repeat(26, minmax(0, 1fr));
  gap: 2px;
  height: 5.5rem;
  align-items: end;
  border-bottom: 1px solid var(--c-border);
}

.shift-bar-column {
  display: flex;
  align-items: flex-end;
  height: 100%;
}

.shift-bar {
  width: 100%;
  border-radius: 2px 2px 0 0;
  transition: height 0.3s ease-out;
}

.shift-bar-plain {
  background: var(--cipher-plain);
  opacity: 0.55;
}

.shift-bar-result {
  background: var(--cipher-result);
  opacity: 0.55;
}

.shift-bar.is-selected {
  opacity: 1;
}

.shift-axis {
  display: grid;
  grid-template-columns: repeat(26, minmax(0, 1fr));
  gap: 2px;
  font-size: 0.6rem;
  text-align: center;
  color: var(--fg-muted);

  .is-selected {
    color: var(--fg-deeper);
    font-weight: 700;
  }
}
</style>
