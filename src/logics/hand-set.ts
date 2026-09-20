/**
 * The letter by letter treatment a hand-set line of type gets. ABC Areal
 * carries three axes, MONO from 0 to 100, wght from 400 to 700 and slnt from
 * -12 to 0, and a letter takes a value of its own on each of them, plus a step
 * of its own off the line. Every value is picked from the text itself, so a
 * line reads the same on every build and the server and the browser agree.
 *
 * Each table below is a set of classes in src/styles/main.css, which holds the
 * values. The classes set a custom property each, and one declaration there
 * reads them all: font-variation-settings is a single property, so a class
 * that named one axis on its own would reset the other two.
 *
 * A letter carries classes rather than a style attribute, which is what lets
 * the Vue compiler keep a heading as one static string (see
 * scripts/shiki-classes.ts).
 */

interface LetterTable {
  /** The prefix of the class, and of the custom property it sets. */
  name: string
  /** How many classes of this name src/styles/main.css holds. */
  count: number
  /** Keeps the value a letter takes here unrelated to the other tables. */
  salt: number
}

const LETTER_TABLES: LetterTable[] = [
  { name: 'mono', count: 6, salt: 0 },
  { name: 'wght', count: 6, salt: 0x5F356495 },
  { name: 'slnt', count: 6, salt: 0x27D4EB2F },
  { name: 'step', count: 4, salt: 0x165667B1 },
]

/**
 * A small deterministic hash. Two letters that sit beside each other differ by
 * one, and one is too small a change for the multiply alone to scatter. The
 * mix below spreads it, so neighbours take unrelated values rather than a
 * rising run.
 */
function hash(text: string, position: number) {
  let value = 0x811C9DC5
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 0x01000193)
  }
  value = Math.imul(value ^ (position + 0x9E3779B9), 0x85EBCA6B)
  value ^= value >>> 13
  value = Math.imul(value, 0xC2B2AE35)
  return Math.abs(value ^ (value >>> 16))
}

/** The classes of one letter: the base class and one out of every table. */
export function letterClasses(text: string, position: number) {
  const picks = LETTER_TABLES.map(table =>
    `${table.name}-${hash(text, position + table.salt) % table.count}`,
  )
  return ['cut', ...picks].join(' ')
}

export interface Letter {
  letter: string
  className: string
}

/**
 * One entry per letter, for the lines Vue renders. A space keeps its place in
 * the list without a class, so the line still breaks between words.
 *
 * Bradford is a set of separate faces and reads no axis, so of the four tables
 * only the step reaches the lines set in it.
 */
export function cutLetters(text: string): Letter[] {
  return [...text].map((letter, position) => ({
    letter,
    className: letter.trim() ? letterClasses(text, position) : '',
  }))
}
