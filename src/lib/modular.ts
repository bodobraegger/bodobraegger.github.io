/**
 * Modular arithmetic for the RSA and Diffie-Hellman figures of the study guide.
 * The numbers are small enough for hand work: below MAXIMUM_MODULUS, every
 * product of two residues stays below 2^53, so plain numbers stay exact.
 */

export const MAXIMUM_MODULUS = 1_000_000

export function isPrime(value: number): boolean {
  if (!Number.isInteger(value) || value < 2)
    return false
  for (let divisor = 2; divisor * divisor <= value; divisor++) {
    if (value % divisor === 0)
      return false
  }
  return true
}

export function greatestCommonDivisor(left: number, right: number): number {
  let [a, b] = [Math.abs(left), Math.abs(right)]
  while (b !== 0)
    [a, b] = [b, a % b]
  return a
}

/** The non-negative residue, also for a negative value such as -17 mod 40 = 23. */
export function modulo(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus
}

/**
 * One row of the extended Euclidean algorithm in table form:
 * dividend = quotient * divisor + remainder, and the coefficient t of the
 * remainder, with remainder ≡ t * value (mod modulus).
 */
export interface EuclidStep {
  dividend: number
  quotient: number
  divisor: number
  remainder: number
  previousCoefficient: number
  divisorCoefficient: number
  coefficient: number
}

export interface InverseResult {
  steps: EuclidStep[]
  greatestCommonDivisor: number
  /** The coefficient t of the last non-zero remainder, before the reduction mod the modulus. */
  coefficient: number
  /** Undefined when the greatest common divisor is not 1, because no inverse exists. */
  inverse?: number
}

/** The inverse of value modulo modulus, with the table a student writes by hand. */
export function modularInverse(value: number, modulus: number): InverseResult {
  const steps: EuclidStep[] = []
  let [dividend, divisor] = [modulus, modulo(value, modulus)]
  let [previousCoefficient, divisorCoefficient] = [0, 1]
  while (divisor !== 0) {
    const quotient = Math.floor(dividend / divisor)
    const remainder = dividend - quotient * divisor
    const coefficient = previousCoefficient - quotient * divisorCoefficient
    steps.push({ dividend, quotient, divisor, remainder, previousCoefficient, divisorCoefficient, coefficient })
    ;[dividend, divisor] = [divisor, remainder]
    ;[previousCoefficient, divisorCoefficient] = [divisorCoefficient, coefficient]
  }
  return {
    steps,
    greatestCommonDivisor: dividend,
    coefficient: previousCoefficient,
    inverse: dividend === 1 ? modulo(previousCoefficient, modulus) : undefined,
  }
}

/** base^power mod modulus, for power = 2^k: the previous value squared. */
export interface SquaringStep {
  power: number
  previous: number
  square: number
  value: number
  used: boolean
}

/** The running product of the used squarings, reduced after each multiplication. */
export interface ProductStep {
  accumulated: number
  factor: number
  product: number
  value: number
}

export interface PowerSteps {
  base: number
  exponent: number
  modulus: number
  squarings: SquaringStep[]
  /** The powers of two whose sum is the exponent, largest first. */
  usedPowers: number[]
  products: ProductStep[]
  result: number
}

/** Square-and-multiply: base^exponent mod modulus, with every intermediate value. */
export function modularPower(base: number, exponent: number, modulus: number): PowerSteps {
  const reducedBase = modulo(base, modulus)
  const squarings: SquaringStep[] = []
  let value = reducedBase
  for (let power = 1; power <= exponent; power *= 2) {
    const previous = squarings.at(-1)?.value ?? reducedBase
    const square = power === 1 ? reducedBase : previous * previous
    value = modulo(square, modulus)
    squarings.push({ power, previous, square, value, used: (exponent & power) !== 0 })
  }
  const used = squarings.filter(step => step.used).reverse()
  const products: ProductStep[] = []
  let result = modulo(1, modulus)
  for (const [index, step] of used.entries()) {
    if (index === 0) {
      result = step.value
      continue
    }
    const product = result * step.value
    const next = modulo(product, modulus)
    products.push({ accumulated: result, factor: step.value, product, value: next })
    result = next
  }
  return { base, exponent, modulus, squarings, usedPowers: used.map(step => step.power), products, result }
}

function primeFactors(value: number): number[] {
  const factors: number[] = []
  let rest = value
  for (let divisor = 2; divisor * divisor <= rest; divisor++) {
    if (rest % divisor !== 0)
      continue
    factors.push(divisor)
    while (rest % divisor === 0)
      rest /= divisor
  }
  if (rest > 1)
    factors.push(rest)
  return factors
}

/** True when the powers of alpha mod the prime give every value from 1 to prime - 1. */
export function isPrimitiveRoot(alpha: number, prime: number): boolean {
  if (alpha <= 1 || alpha >= prime)
    return false
  return primeFactors(prime - 1).every(factor => modularPower(alpha, (prime - 1) / factor, prime).result !== 1)
}
