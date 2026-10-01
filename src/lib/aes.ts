/**
 * AES-128 on the WebCrypto API, for the figures of the study guide. WebCrypto
 * has no ECB mode and always pads CBC, so both are built here from AES-CBC.
 */

export const AES_BLOCK_BYTES = 16
export const AES_KEY_BYTES = 16
/** The 96 bit nonce of GCM, and the random part of a CTR counter block. */
export const NONCE_BYTES = 12
/** The counter block is 96 random bits followed by 32 incrementing bits, as in the guide. */
export const CTR_COUNTER_BITS = 32

/** PKCS#7 fills a whole extra block with this byte when the data fills its last block. */
const FULL_PADDING_BYTE = AES_BLOCK_BYTES
const ZERO_IV = new Uint8Array(AES_BLOCK_BYTES)

export interface AesKeys {
  raw: Uint8Array
  cbc: CryptoKey
  ctr: CryptoKey
  gcm: CryptoKey
}

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}

/** One raw key, imported once for each mode, because a CryptoKey is bound to one algorithm. */
export async function importAesKeys(raw: Uint8Array): Promise<AesKeys> {
  const usages: KeyUsage[] = ['encrypt', 'decrypt']
  const [cbc, ctr, gcm] = await Promise.all(
    (['AES-CBC', 'AES-CTR', 'AES-GCM'] as const).map(name => crypto.subtle.importKey('raw', raw, name, false, usages)),
  )
  return { raw, cbc, ctr, gcm }
}

function assertWholeBlocks(data: Uint8Array) {
  if (data.length % AES_BLOCK_BYTES !== 0)
    throw new RangeError(`Data length ${data.length} is not a multiple of ${AES_BLOCK_BYTES} bytes`)
}

function xorBytes(left: Uint8Array, right: Uint8Array): Uint8Array {
  return left.map((byte, index) => byte ^ right[index])
}

/** AES on one block: CBC with a zero IV, without the padding block that WebCrypto adds. */
export async function encryptBlock(keys: AesKeys, block: Uint8Array): Promise<Uint8Array> {
  const output = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: ZERO_IV }, keys.cbc, block)
  return new Uint8Array(output, 0, AES_BLOCK_BYTES)
}

export async function encryptEcb(keys: AesKeys, data: Uint8Array): Promise<Uint8Array> {
  assertWholeBlocks(data)
  const blockCount = data.length / AES_BLOCK_BYTES
  const blocks = await Promise.all(Array.from({ length: blockCount }, (_, index) =>
    encryptBlock(keys, data.subarray(index * AES_BLOCK_BYTES, (index + 1) * AES_BLOCK_BYTES))))
  const output = new Uint8Array(data.length)
  blocks.forEach((block, index) => output.set(block, index * AES_BLOCK_BYTES))
  return output
}

/** CBC on whole blocks, with no padding. */
export async function encryptCbc(keys: AesKeys, iv: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  assertWholeBlocks(data)
  const output = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, keys.cbc, data)
  return new Uint8Array(output, 0, data.length)
}

/**
 * CBC decryption on whole blocks, with no padding check. WebCrypto always
 * checks PKCS#7 padding, so one more block is appended that decrypts to a
 * full padding block: its plaintext is the last ciphertext block XOR the
 * next ciphertext block, and WebCrypto removes it again.
 */
export async function decryptCbc(keys: AesKeys, iv: Uint8Array, ciphertext: Uint8Array): Promise<Uint8Array> {
  assertWholeBlocks(ciphertext)
  const previous = ciphertext.length ? ciphertext.subarray(-AES_BLOCK_BYTES) : iv
  const padding = new Uint8Array(AES_BLOCK_BYTES).fill(FULL_PADDING_BYTE)
  const paddingBlock = await encryptBlock(keys, xorBytes(padding, previous))
  const extended = new Uint8Array(ciphertext.length + AES_BLOCK_BYTES)
  extended.set(ciphertext)
  extended.set(paddingBlock, ciphertext.length)
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, keys.cbc, extended))
}

export async function encryptCtr(keys: AesKeys, counter: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const output = await crypto.subtle.encrypt({ name: 'AES-CTR', counter, length: CTR_COUNTER_BITS }, keys.ctr, data)
  return new Uint8Array(output)
}

/** The ciphertext followed by the 16 byte tag. */
export async function encryptGcm(keys: AesKeys, nonce: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, keys.gcm, data))
}

/** Rejects with an `OperationError` when the tag does not match. */
export async function decryptGcm(keys: AesKeys, nonce: Uint8Array, sealed: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: nonce }, keys.gcm, sealed))
}

/** A counter block for CTR: 96 random bits and a 32 bit counter that starts at zero. */
export function newCounterBlock(): Uint8Array {
  const counter = new Uint8Array(AES_BLOCK_BYTES)
  counter.set(randomBytes(NONCE_BYTES))
  return counter
}
