<script setup lang="ts">
import type { Language } from '~/logics/languages'
import type { Digram, PlayfairRule } from '~/lib/classic-ciphers'
import { PLAYFAIR_SIZE, playfairDigrams, playfairEncryptDigram, playfairSquare } from '~/lib/classic-ciphers'
import { usePageLanguage } from '~/composables/usePageLanguage'

const GUIDE_KEYWORD = 'monarchy'
/** The four worked pairs of section 2.9, and the filler example. */
const PRESET_MESSAGES = ['ar mu hs ea', 'balloon']
const MAX_MESSAGE_LENGTH = 40
/** The square holds 25 letters, so a longer keyword adds nothing. */
const MAX_KEYWORD_LENGTH = 25

interface Text {
  title: string
  keyword: string
  message: string
  examples: string
  pairs: string
  ciphertext: string
  plainLegend: string
  cipherLegend: string
  rules: Record<PlayfairRule, (plain: string, cipher: string) => string>
  repeated: (letter: string, filler: string) => string
  oddEnd: (filler: string) => string
  wrap: string
  empty: string
}

const TEXT: Record<Language, Text> = {
  en: {
    title: 'Playfair: the 5×5 square and the rule for each pair',
    keyword: 'Keyword',
    message: 'Message',
    examples: 'Examples from the guide',
    pairs: 'Pairs (tap one)',
    ciphertext: 'Ciphertext',
    plainLegend: 'plaintext pair',
    cipherLegend: 'ciphertext pair',
    rules: {
      row: (plain, cipher) => `Same row: each letter is replaced by the letter to its right. ${plain} becomes ${cipher}.`,
      column: (plain, cipher) => `Same column: each letter is replaced by the letter below it. ${plain} becomes ${cipher}.`,
      rectangle: (plain, cipher) => `Rectangle: each letter stays in its own row and moves to the column of the other letter. ${plain} becomes ${cipher}.`,
    },
    repeated: (letter, filler) => `Repeated letter: ${letter}${letter} cannot be a pair, so the filler ${filler} goes between them. The pair is ${letter}${filler}, and the second ${letter} starts the next pair.`,
    oddEnd: filler => `The message has an odd number of letters, so the filler ${filler} completes the last pair.`,
    wrap: 'At the edge of the square, the move wraps around to the other side.',
    empty: 'Type at least one letter.',
  },
  pt: {
    title: 'Playfair: a matriz 5×5 e a regra de cada par',
    keyword: 'Palavra-chave',
    message: 'Mensagem',
    examples: 'Exemplos do guia',
    pairs: 'Pares (toque num deles)',
    ciphertext: 'Texto cifrado',
    plainLegend: 'par do texto claro',
    cipherLegend: 'par cifrado',
    rules: {
      row: (plain, cipher) => `Mesma linha: cada letra é trocada pela letra da direita. ${plain} vira ${cipher}.`,
      column: (plain, cipher) => `Mesma coluna: cada letra é trocada pela letra de baixo. ${plain} vira ${cipher}.`,
      rectangle: (plain, cipher) => `Retângulo: cada letra fica na sua própria linha e vai para a coluna da outra letra. ${plain} vira ${cipher}.`,
    },
    repeated: (letter, filler) => `Letra repetida: ${letter}${letter} não pode formar um par, então a letra de preenchimento ${filler} entra entre elas. O par é ${letter}${filler}, e o segundo ${letter} começa o próximo par.`,
    oddEnd: filler => `A mensagem tem um número ímpar de letras, então a letra de preenchimento ${filler} completa o último par.`,
    wrap: 'Na borda da matriz, o movimento continua do outro lado.',
    empty: 'Digite pelo menos uma letra.',
  },
}

const text = TEXT[usePageLanguage()]

const keyword = ref(GUIDE_KEYWORD)
const message = ref(PRESET_MESSAGES[0])
const selectedIndex = ref(0)

const square = computed(() => playfairSquare(keyword.value))
const digrams = computed(() => playfairDigrams(message.value))
const steps = computed(() => digrams.value.map(digram => playfairEncryptDigram(square.value, digram)))
const selected = computed(() => {
  const index = Math.min(selectedIndex.value, digrams.value.length - 1)
  if (index < 0)
    return undefined
  return { index, digram: digrams.value[index], step: steps.value[index] }
})

watch(message, () => selectedIndex.value = 0)

function pairText(digram: Digram): string {
  return digram.first + digram.second
}

function cellRow(cell: number): number {
  return Math.floor(cell / PLAYFAIR_SIZE)
}

function cellColumn(cell: number): number {
  return cell % PLAYFAIR_SIZE
}

/** The cells the rule works in: the shared row, the shared column, or the rectangle of the two letters. */
const regionCells = computed(() => {
  const step = selected.value?.step
  if (!step)
    return new Set<number>()
  const [first, second] = step.plainCells
  const rows = [cellRow(first), cellRow(second)].sort((a, b) => a - b)
  const columns = [cellColumn(first), cellColumn(second)].sort((a, b) => a - b)
  const cells = new Set<number>()
  for (let cell = 0; cell < PLAYFAIR_SIZE * PLAYFAIR_SIZE; cell++) {
    const row = cellRow(cell)
    const column = cellColumn(cell)
    if (step.rule === 'row' && row === rows[0])
      cells.add(cell)
    else if (step.rule === 'column' && column === columns[0])
      cells.add(cell)
    else if (step.rule === 'rectangle' && row >= rows[0] && row <= rows[1] && column >= columns[0] && column <= columns[1])
      cells.add(cell)
  }
  return cells
})

/** True when a move crosses the edge of the square, as A R to R M does. */
const wraps = computed(() => {
  const step = selected.value?.step
  if (!step || step.rule === 'rectangle')
    return false
  return step.plainCells.some((cell, index) => {
    const target = step.cipherCells[index]
    return step.rule === 'row' ? cellColumn(target) < cellColumn(cell) : cellRow(target) < cellRow(cell)
  })
})

function cellMark(cell: number): { plain?: number, cipher?: number } {
  const step = selected.value?.step
  if (!step)
    return {}
  const plainPosition = step.plainCells.indexOf(cell)
  const cipherPosition = step.cipherCells.indexOf(cell)
  return {
    plain: plainPosition === -1 ? undefined : plainPosition + 1,
    cipher: cipherPosition === -1 ? undefined : cipherPosition + 1,
  }
}

function cellLabel(letter: string): string {
  return letter === 'I' ? 'I/J' : letter
}
</script>

<template>
  <CipherFigure :title="text.title">
    <div class="cipher-fields">
      <label class="cipher-field">
        <span>{{ text.keyword }}</span>
        <input v-model="keyword" type="text" spellcheck="false" autocomplete="off" :maxlength="MAX_KEYWORD_LENGTH">
      </label>
      <label class="cipher-field">
        <span class="cipher-plain">{{ text.message }}</span>
        <input v-model="message" type="text" spellcheck="false" autocomplete="off" :maxlength="MAX_MESSAGE_LENGTH">
      </label>
    </div>
    <div class="study-controls">
      <span class="study-label">{{ text.examples }}</span>
      <button
        v-for="preset in PRESET_MESSAGES"
        :key="preset"
        type="button"
        class="study-button"
        :aria-pressed="message === preset && keyword === GUIDE_KEYWORD"
        @click="message = preset; keyword = GUIDE_KEYWORD"
      >
        {{ preset }}
      </button>
    </div>

    <p v-if="!selected" class="cipher-error" role="alert">
      {{ text.empty }}
    </p>
    <template v-else>
      <div>
        <div class="study-label">
          {{ text.pairs }}
        </div>
        <div class="study-controls playfair-pairs">
          <button
            v-for="(digram, index) in digrams"
            :key="index"
            type="button"
            class="study-button study-mono"
            :aria-pressed="index === selected.index"
            @click="selectedIndex = index"
          >
            {{ pairText(digram) }} → {{ steps[index].cipher }}
          </button>
        </div>
      </div>

      <div class="playfair-layout">
        <div class="playfair-square study-mono" role="img" :aria-label="text.rules[selected.step.rule](pairText(selected.digram), selected.step.cipher)">
          <div
            v-for="(letter, cell) in square"
            :key="cell"
            class="playfair-cell"
            :class="{
              'is-region': regionCells.has(cell),
              'is-plain': cellMark(cell).plain,
              'is-cipher': cellMark(cell).cipher,
            }"
          >
            <span>{{ cellLabel(letter) }}</span>
            <span v-if="cellMark(cell).plain" class="playfair-tag playfair-tag-plain">{{ cellMark(cell).plain }}</span>
            <span v-if="cellMark(cell).cipher" class="playfair-tag playfair-tag-cipher">{{ cellMark(cell).cipher }}</span>
          </div>
        </div>

        <div class="playfair-explanation">
          <p class="study-mono playfair-result">
            <span class="cipher-plain">{{ pairText(selected.digram) }}</span>
            →
            <span class="cipher-result">{{ selected.step.cipher }}</span>
          </p>
          <p v-if="selected.digram.filler === 'repeated'">
            {{ text.repeated(selected.digram.first, selected.digram.second) }}
          </p>
          <p v-else-if="selected.digram.filler === 'odd-end'">
            {{ text.oddEnd(selected.digram.second) }}
          </p>
          <p>{{ text.rules[selected.step.rule](pairText(selected.digram), selected.step.cipher) }}</p>
          <p v-if="wraps" class="cipher-muted">
            {{ text.wrap }}
          </p>
          <p class="playfair-legend study-label">
            <span class="playfair-swatch playfair-swatch-plain" /> {{ text.plainLegend }}
            <span class="playfair-swatch playfair-swatch-cipher" /> {{ text.cipherLegend }}
          </p>
        </div>
      </div>

      <p>
        <span class="study-label">{{ text.ciphertext }}: </span>
        <span class="study-mono cipher-result">{{ steps.map(step => step.cipher).join(' ') }}</span>
      </p>
    </template>
  </CipherFigure>
</template>

<style scoped>
.playfair-pairs {
  margin-top: 0.3rem;
}

.playfair-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  align-items: flex-start;
}

.playfair-square {
  display: grid;
  grid-template-columns: repeat(5, 3rem);
  grid-auto-rows: 3rem;
  gap: 3px;
  flex: none;
}

.playfair-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--c-border-soft);
  color: var(--fg-muted);
  font-size: 1.05rem;
  transition:
    background-color 0.3s,
    border-color 0.3s,
    color 0.3s;

  &.is-region {
    background: var(--c-border-soft);
    color: var(--fg-deep);
  }

  &.is-plain {
    border: 2px solid var(--cipher-plain);
    color: var(--cipher-plain);
    font-weight: 700;
  }

  &.is-cipher {
    background: var(--cipher-result-soft);
    color: var(--cipher-result);
    font-weight: 700;
  }

  &.is-plain.is-cipher {
    color: var(--fg-deeper);
  }
}

.playfair-tag {
  position: absolute;
  top: 1px;
  font-size: 0.65rem;
  line-height: 1;
  font-weight: 400;
}

.playfair-tag-plain {
  left: 3px;
  color: var(--cipher-plain);
}

.playfair-tag-cipher {
  right: 3px;
  color: var(--cipher-result);
}

.playfair-explanation {
  flex: 1 1 14rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.playfair-result {
  font-size: 1.4rem;
}

.playfair-swatch {
  display: inline-block;
  width: 0.9em;
  height: 0.9em;
  margin-left: 0.4em;
  vertical-align: -0.1em;
}

.playfair-swatch-plain {
  border: 2px solid var(--cipher-plain);
}

.playfair-swatch-cipher {
  background: var(--cipher-result-soft);
  border: 1px solid var(--cipher-result);
}
</style>
