import { BITS_PER_BYTE, toBinary } from '~/lib/bits'

const HEX_DIGITS_PER_BYTE = 2
const HEX_RADIX = 16
const WHITESPACE_PATTERN = /\s+/g
const HEX_PATTERN = /^[0-9a-f]*$/i

export class HexParseError extends Error {
  constructor(public readonly reason: 'not-hex' | 'odd-length') {
    super(reason === 'not-hex' ? 'The text holds a character that is not a hex digit' : 'The hex text has an odd number of digits')
    this.name = 'HexParseError'
  }
}

/** Reads hex digits into bytes. Spaces between the digits are ignored. */
export function parseHex(text: string): number[] {
  const digits = text.replace(WHITESPACE_PATTERN, '')
  if (!HEX_PATTERN.test(digits))
    throw new HexParseError('not-hex')
  if (digits.length % HEX_DIGITS_PER_BYTE !== 0)
    throw new HexParseError('odd-length')
  const bytes: number[] = []
  for (let index = 0; index < digits.length; index += HEX_DIGITS_PER_BYTE)
    bytes.push(Number.parseInt(digits.slice(index, index + HEX_DIGITS_PER_BYTE), HEX_RADIX))
  return bytes
}

export function byteToHex(byte: number): string {
  return byte.toString(HEX_RADIX).toUpperCase().padStart(HEX_DIGITS_PER_BYTE, '0')
}

export function bytesToHex(bytes: number[]): string {
  return bytes.map(byteToHex).join('')
}

export function byteToBits(byte: number): string {
  return toBinary(byte, BITS_PER_BYTE)
}

/** XORs byte by byte. The result has the length of the shorter input. */
export function xorBytes(first: number[], second: number[]): number[] {
  const length = Math.min(first.length, second.length)
  return Array.from({ length }, (_, index) => first[index] ^ second[index])
}

export function randomBytes(length: number): number[] {
  return [...crypto.getRandomValues(new Uint8Array(length))]
}
