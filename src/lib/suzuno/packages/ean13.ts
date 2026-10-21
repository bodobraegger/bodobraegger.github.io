// The bars of an EAN-13 barcode (GS1 General Specifications, 5.2.1), as runs
// of modules. A barcode is 95 modules wide: a start guard, six digits of the
// left half, a centre guard, six digits of the right half and an end guard.

export const EAN13_MODULES = 95

// The patterns of the digits 0 to 9: set A (odd parity) and set C (right half);
// set B is set C read backwards
const SET_A = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const SET_C = SET_A.map(pattern => [...pattern].map(bit => (bit === '1' ? '0' : '1')).join(''))
const SET_B = SET_C.map(pattern => [...pattern].reverse().join(''))
// The first digit chooses set A or B for each digit of the left half
const PARITY = ['AAAAAA', 'AABABB', 'AABBAB', 'AABBBA', 'ABAABB', 'ABBAAB', 'ABBBAA', 'ABABAB', 'ABABBA', 'ABBABA']
const SIDE_GUARD = '101'
const CENTRE_GUARD = '01010'

export class Ean13Error extends Error {}

/** The check digit of the first 12 digits. */
function ean13CheckDigit(digits: string) {
  const sum = [...digits.slice(0, 12)].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0)
  return (10 - sum % 10) % 10
}

/** A bar: its first module, its width in modules, and whether it is a guard bar, which reaches lower. */
interface Ean13Bar {
  start: number
  width: number
  guard: boolean
}

/** The bars of a 13-digit EAN with a correct check digit. */
export function ean13Bars(digits: string): Ean13Bar[] {
  if (!/^\d{13}$/.test(digits))
    throw new Ean13Error(`An EAN-13 has 13 digits, not "${digits}"`)
  if (ean13CheckDigit(digits) !== Number(digits[12]))
    throw new Ean13Error(`The check digit of ${digits} is wrong; it must be ${ean13CheckDigit(digits)}`)
  const parity = PARITY[Number(digits[0])]
  const left = [...digits.slice(1, 7)].map((digit, index) => (parity[index] === 'A' ? SET_A : SET_B)[Number(digit)]).join('')
  const right = [...digits.slice(7)].map(digit => SET_C[Number(digit)]).join('')
  const parts = [[SIDE_GUARD, true], [left, false], [CENTRE_GUARD, true], [right, false], [SIDE_GUARD, true]] as const
  const bars: Ean13Bar[] = []
  let module = 0
  for (const [pattern, guard] of parts) {
    for (const bit of pattern) {
      const last = bars.at(-1)
      if (bit === '1') {
        if (last && last.start + last.width === module && last.guard === guard)
          last.width++
        else
          bars.push({ start: module, width: 1, guard })
      }
      module++
    }
  }
  return bars
}
