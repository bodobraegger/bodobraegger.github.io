<script setup lang="ts">
import type { PowerSteps } from '~/lib/modular'

const { steps, resultLabel } = defineProps<{
  steps: PowerSteps
  resultLabel: string
}>()

interface Line {
  text: string
  /** The value at the end of the line, set apart in colour. */
  value?: number
  tone?: 'key' | 'result'
  muted?: boolean
  separated?: boolean
}

/** The lines of square-and-multiply as written by hand. The squarings that the exponent uses are in the key colour. */
const lines = computed<Line[]>(() => {
  const { base, exponent, modulus } = steps
  const squarings = steps.squarings.map((squaring): Line => ({
    text: squaring.power === 1
      ? `${base}^1 mod ${modulus} = `
      : `${base}^${squaring.power} mod ${modulus} = ${squaring.previous} × ${squaring.previous} = ${squaring.square} mod ${modulus} = `,
    value: squaring.value,
    tone: squaring.used ? 'key' : undefined,
    muted: !squaring.used,
  }))
  const products = steps.products.map((product): Line => ({
    text: `${product.accumulated} × ${product.factor} = ${product.product} mod ${modulus} = `,
    value: product.value,
  }))
  return [
    ...squarings,
    { text: `${exponent} = ${steps.usedPowers.join(' + ')}`, separated: true },
    ...products,
    { text: `${resultLabel} = ${base}^${exponent} mod ${modulus} = `, value: steps.result, tone: 'result', separated: true },
  ]
})
</script>

<template>
  <div class="cipher-formula">
    <div v-for="(line, index) in lines" :key="index" :class="{ 'cipher-muted': line.muted, 'cipher-formula-separated': line.separated }">
      {{ line.text }}<strong v-if="line.value !== undefined" :class="line.tone && `cipher-${line.tone}`">{{ line.value }}</strong>
    </div>
  </div>
</template>
