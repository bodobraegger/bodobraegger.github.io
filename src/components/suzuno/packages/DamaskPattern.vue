<script setup lang="ts">
// The damask of src/lib/suzuno/patterns/damask.ts as an SVG <pattern>. Put the
// component into <defs> and fill a shape with url(#id). Each prop replaces a
// parameter of the generator; the defaults draw the damask of the front of
// the Almond Caramel bag.
import type { DamaskParameters } from '~/lib/suzuno/patterns/damask'
import { DAMASK } from '~/lib/suzuno/patterns/damask'
import { defaults } from '~/lib/suzuno/patterns/pattern'

const props = defineProps<{ id: string } & Partial<DamaskParameters>>()

const tile = computed(() => {
  const given = Object.fromEntries(Object.entries(props).filter(([name, value]) => name !== 'id' && value !== undefined))
  return DAMASK.tile(0, { ...defaults(DAMASK.parameters), ...given })
})
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- an SVG <pattern>, not a component -->
  <pattern :id="id" patternUnits="userSpaceOnUse" :width="tile.width" :height="tile.height" :patternTransform="tile.transform" v-html="tile.markup" />
</template>
