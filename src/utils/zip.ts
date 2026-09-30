/**
 * A ZIP archive writer with the store method only: every entry keeps its
 * bytes as they are, which is what an EPUB needs for its first entry and is
 * enough for the rest of a small book.
 */

export interface ZipEntry {
  name: string
  data: Uint8Array<ArrayBuffer>
}

const LOCAL_FILE_HEADER_SIGNATURE = 0x04034B50
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014B50
const END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054B50

const LOCAL_FILE_HEADER_SIZE = 30
const CENTRAL_DIRECTORY_HEADER_SIZE = 46
const END_OF_CENTRAL_DIRECTORY_SIZE = 22

const VERSION_NEEDED_TO_EXTRACT = 10
const COMPRESSION_METHOD_STORE = 0
const FLAG_UTF8_NAME = 0x0800

const MAXIMUM_ENTRY_COUNT = 0xFFFF
const MAXIMUM_ARCHIVE_SIZE = 0xFFFFFFFF

const DOS_EPOCH_YEAR = 1980

const CRC32_POLYNOMIAL = 0xEDB88320

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let index = 0; index < table.length; index++) {
    let value = index
    for (let bit = 0; bit < 8; bit++)
      value = value & 1 ? (value >>> 1) ^ CRC32_POLYNOMIAL : value >>> 1
    table[index] = value >>> 0
  }
  return table
})()

function crc32(data: Uint8Array) {
  let value = 0xFFFFFFFF
  for (const byte of data)
    value = CRC32_TABLE[(value ^ byte) & 0xFF] ^ (value >>> 8)
  return (value ^ 0xFFFFFFFF) >>> 0
}

export class ZipLimitError extends Error {
  name = 'ZipLimitError'
}

/** The time and date fields of MS-DOS, in local time with two second steps. */
function dosDateTime(date: Date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  const day = ((date.getFullYear() - DOS_EPOCH_YEAR) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  return { time, day }
}

/**
 * Writes the entries in the given order. The fields that tell a reader how
 * an entry is stored are the same in the local header and in the central
 * directory, so one function writes both.
 */
export function createZip(entries: ZipEntry[], modified = new Date()): Blob {
  if (entries.length > MAXIMUM_ENTRY_COUNT)
    throw new ZipLimitError(`A ZIP archive without ZIP64 holds at most ${MAXIMUM_ENTRY_COUNT} entries`)

  const encoder = new TextEncoder()
  const { time, day } = dosDateTime(modified)
  const localParts: Uint8Array<ArrayBuffer>[] = []
  const centralParts: Uint8Array<ArrayBuffer>[] = []
  let offset = 0

  for (const entry of entries) {
    const name = encoder.encode(entry.name)
    const checksum = crc32(entry.data)
    const size = entry.data.length

    const writeCommonFields = (view: DataView, start: number) => {
      view.setUint16(start, VERSION_NEEDED_TO_EXTRACT, true)
      view.setUint16(start + 2, FLAG_UTF8_NAME, true)
      view.setUint16(start + 4, COMPRESSION_METHOD_STORE, true)
      view.setUint16(start + 6, time, true)
      view.setUint16(start + 8, day, true)
      view.setUint32(start + 10, checksum, true)
      view.setUint32(start + 14, size, true)
      view.setUint32(start + 18, size, true)
      view.setUint16(start + 22, name.length, true)
      // The extra field stays empty: a reader of the EPUB mimetype entry
      // expects the file content right after the name.
      view.setUint16(start + 24, 0, true)
    }

    const localHeader = new Uint8Array(LOCAL_FILE_HEADER_SIZE + name.length)
    const localView = new DataView(localHeader.buffer)
    localView.setUint32(0, LOCAL_FILE_HEADER_SIGNATURE, true)
    writeCommonFields(localView, 4)
    localHeader.set(name, LOCAL_FILE_HEADER_SIZE)

    const centralHeader = new Uint8Array(CENTRAL_DIRECTORY_HEADER_SIZE + name.length)
    const centralView = new DataView(centralHeader.buffer)
    centralView.setUint32(0, CENTRAL_DIRECTORY_SIGNATURE, true)
    centralView.setUint16(4, VERSION_NEEDED_TO_EXTRACT, true)
    writeCommonFields(centralView, 6)
    // Comment length, disk number, internal and external attributes stay zero.
    centralView.setUint32(42, offset, true)
    centralHeader.set(name, CENTRAL_DIRECTORY_HEADER_SIZE)

    localParts.push(localHeader, entry.data)
    centralParts.push(centralHeader)
    offset += localHeader.length + size
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0)
  if (offset + centralSize > MAXIMUM_ARCHIVE_SIZE)
    throw new ZipLimitError('A ZIP archive without ZIP64 holds at most 4 GiB')

  const end = new Uint8Array(END_OF_CENTRAL_DIRECTORY_SIZE)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, END_OF_CENTRAL_DIRECTORY_SIGNATURE, true)
  endView.setUint16(8, entries.length, true)
  endView.setUint16(10, entries.length, true)
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, offset, true)

  return new Blob([...localParts, ...centralParts, end])
}
