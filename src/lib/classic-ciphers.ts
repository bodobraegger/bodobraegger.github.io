export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
export const ALPHABET_LENGTH = ALPHABET.length

const CODE_OF_A = 'A'.charCodeAt(0)
const COMBINING_MARKS_PATTERN = /[\u0300-\u036F]/g
const LETTER_PATTERN = /^[A-Z]$/

/** Upper case, with the accents removed, so "ção" becomes "CAO". */
export function foldAccents(text: string): string {
  return text.normalize('NFD').replace(COMBINING_MARKS_PATTERN, '').toUpperCase()
}

export function isLetter(character: string): boolean {
  return LETTER_PATTERN.test(character)
}

export function letterIndex(letter: string): number {
  return letter.charCodeAt(0) - CODE_OF_A
}

export function letterAt(index: number): string {
  return ALPHABET[((index % ALPHABET_LENGTH) + ALPHABET_LENGTH) % ALPHABET_LENGTH]
}

export function onlyLetters(text: string): string {
  return [...foldAccents(text)].filter(isLetter).join('')
}

/** Shifts one letter, C = (p + k) mod 26. */
export function shiftLetter(letter: string, shift: number): string {
  return letterAt(letterIndex(letter) + shift)
}

export interface SubstitutedCharacter {
  plain: string
  cipher: string
  /** The shift applied to this character, or undefined for a character that is not a letter. */
  shift?: number
  /** The position in the key, for Vigenère. The key advances only on letters. */
  keyPosition?: number
}

/**
 * Vigenère with the key shifts: C_i = (p_i + k_(i mod m)) mod 26. A key of one
 * shift is the Caesar cipher. Characters that are not letters pass through.
 */
export function substitute(text: string, shifts: number[]): SubstitutedCharacter[] {
  let letterCount = 0
  return [...foldAccents(text)].map((plain) => {
    if (!isLetter(plain) || shifts.length === 0)
      return { plain, cipher: plain }
    const keyPosition = letterCount % shifts.length
    letterCount++
    const shift = shifts[keyPosition]
    return { plain, cipher: shiftLetter(plain, shift), shift, keyPosition }
  })
}

export function keywordShifts(keyword: string): number[] {
  return [...onlyLetters(keyword)].map(letterIndex)
}

export function letterCounts(text: string): number[] {
  const counts = Array.from({ length: ALPHABET_LENGTH }, () => 0)
  for (const letter of onlyLetters(text))
    counts[letterIndex(letter)]++
  return counts
}

export const PLAYFAIR_SIZE = 5
const PLAYFAIR_MERGED = 'J'
const PLAYFAIR_MERGED_INTO = 'I'
const PLAYFAIR_FILLER = 'X'
const PLAYFAIR_SECOND_FILLER = 'Q'

function playfairLetters(text: string): string {
  return onlyLetters(text).replaceAll(PLAYFAIR_MERGED, PLAYFAIR_MERGED_INTO)
}

/** The 25 cells, row by row: the keyword without repeats, then the rest of the alphabet. I and J share a cell. */
export function playfairSquare(keyword: string): string[] {
  const letters = new Set(playfairLetters(keyword + ALPHABET))
  return [...letters]
}

export type PlayfairFiller = 'repeated' | 'odd-end'

export interface Digram {
  first: string
  second: string
  /** Why the second letter is a filler, if it is one. */
  filler?: PlayfairFiller
}

function fillerAfter(letter: string): string {
  return letter === PLAYFAIR_FILLER ? PLAYFAIR_SECOND_FILLER : PLAYFAIR_FILLER
}

/** Splits the message into pairs: `balloon` becomes `ba lx lo on`. */
export function playfairDigrams(text: string): Digram[] {
  const letters = playfairLetters(text)
  const digrams: Digram[] = []
  let index = 0
  while (index < letters.length) {
    const first = letters[index]
    const second = letters[index + 1]
    if (second === undefined) {
      digrams.push({ first, second: fillerAfter(first), filler: 'odd-end' })
      index += 1
    }
    else if (second === first) {
      digrams.push({ first, second: fillerAfter(first), filler: 'repeated' })
      index += 1
    }
    else {
      digrams.push({ first, second })
      index += 2
    }
  }
  return digrams
}

export type PlayfairRule = 'row' | 'column' | 'rectangle'

export interface PlayfairStep {
  rule: PlayfairRule
  /** Cell indexes in the square of the two plaintext letters. */
  plainCells: [number, number]
  cipherCells: [number, number]
  cipher: string
}

function cellOf(square: string[], letter: string): { row: number, column: number } {
  const index = square.indexOf(letter)
  return { row: Math.floor(index / PLAYFAIR_SIZE), column: index % PLAYFAIR_SIZE }
}

function cellIndex(row: number, column: number): number {
  const wrap = (value: number) => (value + PLAYFAIR_SIZE) % PLAYFAIR_SIZE
  return wrap(row) * PLAYFAIR_SIZE + wrap(column)
}

export function playfairEncryptDigram(square: string[], digram: Digram): PlayfairStep {
  const first = cellOf(square, digram.first)
  const second = cellOf(square, digram.second)
  const plainCells: [number, number] = [cellIndex(first.row, first.column), cellIndex(second.row, second.column)]
  let rule: PlayfairRule
  let cipherCells: [number, number]
  if (first.row === second.row) {
    rule = 'row'
    cipherCells = [cellIndex(first.row, first.column + 1), cellIndex(second.row, second.column + 1)]
  }
  else if (first.column === second.column) {
    rule = 'column'
    cipherCells = [cellIndex(first.row + 1, first.column), cellIndex(second.row + 1, second.column)]
  }
  else {
    rule = 'rectangle'
    cipherCells = [cellIndex(first.row, second.column), cellIndex(second.row, first.column)]
  }
  return { rule, plainCells, cipherCells, cipher: square[cipherCells[0]] + square[cipherCells[1]] }
}
