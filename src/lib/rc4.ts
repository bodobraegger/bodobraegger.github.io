export type Rc4Phase = 'start' | 'ksa' | 'prga'

/** The state after one step of RC4. Every field is a copy, so a step can be shown on its own. */
export interface Rc4Step {
  phase: Rc4Phase
  state: number[]
  /** T, the key repeated to the length of the state. */
  expandedKey: number[]
  i?: number
  j?: number
  /** The j of the previous step, for the formula. */
  previousJ?: number
  /** The two positions this step swapped. */
  swapped?: [number, number]
  /** PRGA only: t = (S[i] + S[j]) mod N and the output k = S[t]. */
  t?: number
  output?: number
  /** The keystream produced up to and including this step. */
  keystream: number[]
}

/**
 * RC4 with a state of `size` entries instead of 256, so the arithmetic is mod
 * `size`. With size 256 it is the real RC4. Returns the start state, one step
 * per KSA iteration, and one step per keystream value.
 */
export function rc4Trace(key: number[], size: number, outputLength: number): Rc4Step[] {
  const state = Array.from({ length: size }, (_, index) => index)
  const expandedKey = state.map(index => key[index % key.length])
  const steps: Rc4Step[] = [{ phase: 'start', state: [...state], expandedKey, keystream: [] }]

  function swap(first: number, second: number) {
    [state[first], state[second]] = [state[second], state[first]]
  }

  let j = 0
  for (let i = 0; i < size; i++) {
    const previousJ = j
    j = (j + state[i] + expandedKey[i]) % size
    swap(i, j)
    steps.push({ phase: 'ksa', state: [...state], expandedKey, i, j, previousJ, swapped: [i, j], keystream: [] })
  }

  const keystream: number[] = []
  let i = 0
  j = 0
  for (let count = 0; count < outputLength; count++) {
    const previousJ = j
    i = (i + 1) % size
    j = (j + state[i]) % size
    swap(i, j)
    const t = (state[i] + state[j]) % size
    keystream.push(state[t])
    steps.push({ phase: 'prga', state: [...state], expandedKey, i, j, previousJ, swapped: [i, j], t, output: state[t], keystream: [...keystream] })
  }
  return steps
}
