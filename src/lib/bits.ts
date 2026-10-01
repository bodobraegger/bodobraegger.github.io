/** Bytes and bits for the figures of the study guide. Every byte sequence is a Uint8Array. */

export const BITS_PER_BYTE = 8

const HEX_DIGITS_PER_BYTE = 2
const HEX_RADIX = 16
const WHITESPACE_PATTERN = /\s+/g
const HEX_PATTERN = /^[0-9a-f]*$/i

const PRINTABLE_FIRST = 0x20
const PRINTABLE_LAST = 0x7E
export const REPLACEMENT_CHARACTER = '�'

export function toBinary(value: number, width: number): string {
  return value.toString(2).padStart(width, '0')
}

/** The bits of the bytes, most significant bit of the first byte first. */
export function bytesToBits(bytes: Uint8Array): number[] {
  const bits: number[] = []
  for (const byte of bytes) {
    for (let shift = BITS_PER_BYTE - 1; shift >= 0; shift--)
      bits.push((byte >> shift) & 1)
  }
  return bits
}

/** Flips one bit of a copy of the bytes, counted as in `bytesToBits`. */
export function flipBit(bytes: Uint8Array, bitIndex: number): Uint8Array {
  const copy = bytes.slice()
  const byteIndex = Math.floor(bitIndex / BITS_PER_BYTE)
  copy[byteIndex] ^= 0x80 >> (bitIndex % BITS_PER_BYTE)
  return copy
}

export function countOnes(value: number): number {
  let count = 0
  for (let rest = value; rest; rest >>>= 1)
    count += rest & 1
  return count
}

/** The number of bits that differ. Both inputs need the same length. */
export function hammingDistance(left: Uint8Array, right: Uint8Array): number {
  return left.reduce((count, byte, index) => count + countOnes(byte ^ right[index]), 0)
}

/** XORs byte by byte. The result has the length of the shorter input. */
export function xorBytes(left: Uint8Array, right: Uint8Array): Uint8Array {
  const length = Math.min(left.length, right.length)
  return Uint8Array.from({ length }, (_, index) => left[index] ^ right[index])
}

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

export function byteToHex(byte: number): string {
  return byte.toString(HEX_RADIX).toUpperCase().padStart(HEX_DIGITS_PER_BYTE, '0')
}

export function toHex(bytes: Uint8Array): string[] {
  return [...bytes].map(byteToHex)
}

export function bytesToHex(bytes: Uint8Array): string {
  return toHex(bytes).join('')
}

export class HexParseError extends Error {
  constructor(public readonly reason: 'not-hex' | 'odd-length') {
    super(reason === 'not-hex' ? 'The text holds a character that is not a hex digit' : 'The hex text has an odd number of digits')
    this.name = 'HexParseError'
  }
}

/** Reads hex digits into bytes. Spaces between the digits are ignored. */
export function parseHex(text: string): Uint8Array {
  const digits = text.replace(WHITESPACE_PATTERN, '')
  if (!HEX_PATTERN.test(digits))
    throw new HexParseError('not-hex')
  if (digits.length % HEX_DIGITS_PER_BYTE !== 0)
    throw new HexParseError('odd-length')
  const bytes = new Uint8Array(digits.length / HEX_DIGITS_PER_BYTE)
  for (let index = 0; index < bytes.length; index++)
    bytes[index] = Number.parseInt(digits.slice(index * HEX_DIGITS_PER_BYTE, (index + 1) * HEX_DIGITS_PER_BYTE), HEX_RADIX)
  return bytes
}

/** The printable ASCII character of a byte, or the fallback for any other byte. */
export function asciiCharacter(byte: number, fallback = REPLACEMENT_CHARACTER): string {
  return byte >= PRINTABLE_FIRST && byte <= PRINTABLE_LAST ? String.fromCharCode(byte) : fallback
}
