/**
 * The letter by letter treatment a hand-set line of type gets: an angle off
 * the slnt axis, and a cut off the MONO and wght axes. Both are picked from
 * the text itself, so a line reads the same on every build and the server and
 * the browser agree.
 *
 * The angles live in src/styles/main.css as .lean-0 to .lean-<n>, the cuts as
 * .cut-0 to .cut-<n>. A letter carries classes rather than a style attribute,
 * which is what lets the Vue compiler keep a heading as one static string
 * (see scripts/shiki-classes.ts).
 */

export const LEAN_ANGLES = [0, 2, 5, 8, 11, 3]

export const CUT_COUNT = 6

/** Keeps the cut of a letter unrelated to its lean. */
const CUT_SALT = 0x5F356495

/**
 * A small deterministic hash. Two letters that sit beside each other differ by
 * one, and one is too small a change for the multiply alone to scatter. The
 * mix below spreads it, so neighbours take unrelated values rather than a
 * rising run.
 */
export function hash(text: string, position: number) {
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

export function leanClass(text: string, position: number) {
  return `lean-${hash(text, position) % LEAN_ANGLES.length}`
}

export function cutClass(text: string, position: number) {
  return `cut-${hash(text, position + CUT_SALT) % CUT_COUNT}`
}

export interface Letter {
  letter: string
  className: string
}

/**
 * One entry per letter, for the lines Vue renders. A space keeps its place in
 * the list without a class, so the line still breaks between words.
 *
 * Bradford is a set of separate faces and carries no axes, so the cuts reach
 * the lines set in it through their size and their baseline alone.
 */
export function cutLetters(text: string): Letter[] {
  return [...text].map((letter, position) => ({
    letter,
    className: letter.trim() ? cutClass(text, position) : '',
  }))
}
