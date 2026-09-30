export const BITS_PER_BYTE = 8

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

export function toHex(bytes: Uint8Array): string[] {
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0'))
}
