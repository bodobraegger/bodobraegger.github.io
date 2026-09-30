/**
 * A toy PRNG and two tests of NIST SP 800-22 (section 2.1, frequency, and
 * section 2.3, runs), for the figures of the study guide.
 */

/** The significance level that SP 800-22 uses by default: a test passes when p ≥ α. */
export const SIGNIFICANCE_LEVEL = 0.01

/** Constants of the linear congruential generator in Numerical Recipes. */
const LCG_MULTIPLIER = 1664525
const LCG_INCREMENT = 1013904223
const LCG_TOP_BIT_SHIFT = 31

export interface LcgOutput {
  states: number[]
  bits: number[]
}

/**
 * X(n+1) = (a × X(n) + c) mod 2^32. Each step gives one bit, the top bit of
 * the state, because the low bits of an LCG repeat with a short period.
 */
export function lcgBits(seed: number, count: number): LcgOutput {
  const states: number[] = []
  const bits: number[] = []
  let state = seed >>> 0
  for (let index = 0; index < count; index++) {
    // Math.imul keeps the low 32 bits of the product, and >>> 0 reduces mod 2^32
    state = (Math.imul(LCG_MULTIPLIER, state) + LCG_INCREMENT) >>> 0
    states.push(state)
    bits.push(state >>> LCG_TOP_BIT_SHIFT)
  }
  return { states, bits }
}

/** Coefficients of the Chebyshev fit for erfc in Numerical Recipes (erfcc), fractional error below 1.2e-7. */
const ERFC_COEFFICIENTS = [
  -1.26551223,
  1.00002368,
  0.37409196,
  0.09678418,
  -0.18628806,
  0.27886807,
  -1.13520398,
  1.48851587,
  -0.82215223,
  0.17087277,
]

/** The fit gives values slightly above 1 near 0; a p-value never exceeds 1. */
function toPValue(value: number) {
  return Math.min(1, value)
}

export function erfc(x: number): number {
  const absolute = Math.abs(x)
  const t = 1 / (1 + absolute / 2)
  const polynomial = ERFC_COEFFICIENTS.reduceRight((sum, coefficient) => coefficient + t * sum, 0)
  const result = t * Math.exp(-absolute * absolute + polynomial)
  return x >= 0 ? result : 2 - result
}

export interface FrequencyResult {
  ones: number
  zeros: number
  /** S_n: the sum of +1 for each one and -1 for each zero. */
  sum: number
  statistic: number
  pValue: number
  passed: boolean
}

export function frequencyTest(bits: number[]): FrequencyResult {
  const ones = bits.filter(bit => bit === 1).length
  const zeros = bits.length - ones
  const sum = ones - zeros
  const statistic = Math.abs(sum) / Math.sqrt(bits.length)
  const pValue = toPValue(erfc(statistic / Math.SQRT2))
  return { ones, zeros, sum, statistic, pValue, passed: pValue >= SIGNIFICANCE_LEVEL }
}

export interface RunsResult {
  /** π: the proportion of ones. */
  proportion: number
  /** The runs test is only defined when |π − 1/2| < τ = 2 / √n. */
  prerequisiteMet: boolean
  runs: number
  expectedRuns: number
  pValue: number
  passed: boolean
}

export function countRuns(bits: number[]): number {
  return bits.reduce((runs, bit, index) => index > 0 && bit !== bits[index - 1] ? runs + 1 : runs, bits.length ? 1 : 0)
}

export function runsTest(bits: number[]): RunsResult {
  const length = bits.length
  const proportion = bits.filter(bit => bit === 1).length / length
  const tolerance = 2 / Math.sqrt(length)
  const prerequisiteMet = Math.abs(proportion - 1 / 2) < tolerance
  const runs = countRuns(bits)
  const spread = proportion * (1 - proportion)
  const expectedRuns = 2 * length * spread
  const pValue = prerequisiteMet
    ? toPValue(erfc(Math.abs(runs - expectedRuns) / (2 * Math.sqrt(2 * length) * spread)))
    : 0
  return { proportion, prerequisiteMet, runs, expectedRuns, pValue, passed: pValue >= SIGNIFICANCE_LEVEL }
}
