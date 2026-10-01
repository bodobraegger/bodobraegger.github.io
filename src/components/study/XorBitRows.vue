<script setup lang="ts">
import { BITS_PER_BYTE, byteToHex, toBinary } from '~/lib/bits'

export type BitRowTone = 'plain' | 'key' | 'result' | 'neutral'

export interface BitRow {
  label: string
  bytes: Uint8Array
  tone: BitRowTone
  /** Draws the XOR rule above the row, as in a written column sum. */
  separated?: boolean
}

const { rows, firstByteIndex = 0 } = defineProps<{
  rows: BitRow[]
  firstByteIndex?: number
}>()

const NIBBLE_LENGTH = 4

const byteCount = computed(() => Math.max(0, ...rows.map(row => row.bytes.length)))

function nibbles(byte: number): string[] {
  const bits = toBinary(byte, BITS_PER_BYTE)
  return [bits.slice(0, NIBBLE_LENGTH), bits.slice(NIBBLE_LENGTH)]
}
</script>

<template>
  <div class="xor-bit-rows">
    <div v-for="byteIndex in byteCount" :key="byteIndex" class="xor-bit-block">
      <div class="xor-bit-heading cipher-muted">
        byte {{ firstByteIndex + byteIndex }}
      </div>
      <template v-for="row in rows" :key="row.label">
        <div class="xor-bit-label" :class="[`cipher-${row.tone}`, { 'xor-bit-separated': row.separated }]">
          {{ row.label }}
        </div>
        <div class="xor-bit-value" :class="[`cipher-${row.tone}`, { 'xor-bit-separated': row.separated }]">
          <template v-if="row.bytes[byteIndex - 1] !== undefined">
            <span class="xor-bit-hex">{{ byteToHex(row.bytes[byteIndex - 1]) }}</span>
            <span v-for="(nibble, nibbleIndex) in nibbles(row.bytes[byteIndex - 1])" :key="nibbleIndex" class="xor-bit-nibble">
              <span v-for="(bit, bitIndex) in nibble" :key="bitIndex" :class="{ 'xor-bit-one': bit === '1' }">{{ bit }}</span>
            </span>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.xor-bit-rows {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  font-family: var(--fonts-mono);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}

.xor-bit-block {
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 0.6rem;
  align-items: baseline;
}

.xor-bit-heading {
  grid-column: 1 / -1;
  font-size: 0.8em;
}

.xor-bit-label {
  white-space: nowrap;
}

.xor-bit-value {
  display: flex;
  gap: 0.5ch;
  white-space: nowrap;
}

.xor-bit-hex {
  min-width: 2ch;
  margin-right: 0.5ch;
  font-weight: 600;
}

.xor-bit-one {
  font-weight: 700;
}

.xor-bit-nibble span:not(.xor-bit-one) {
  opacity: 0.55;
}

.xor-bit-separated {
  border-top: 1px solid var(--fg-muted);
  padding-top: 0.15rem;
  margin-top: 0.15rem;
}
</style>
