<script setup lang="ts">
// One or more layers of the background patterns of src/lib/suzuno/patterns/ in a
// box. Without `inline` it is an <svg> of its own that covers its element,
// for example as the background of an HTML box; with `inline` a <g> to place
// inside another SVG. The drawing is in the markup, so it needs no script;
// with `grow`, the layers that can grow (the vine) grow on mount and end on
// the same drawing.
import { useId } from 'vue'
import type { Growth } from '~/lib/suzuno/ornament'
import type { Box, PatternFillValue } from '~/lib/suzuno/patterns'
import { patternLayers, resolveLayer } from '~/lib/suzuno/patterns'

const props = withDefaults(defineProps<{
  pattern: PatternFillValue
  box?: Box
  inline?: boolean
  grow?: boolean
}>(), {
  box: () => ({ x: 0, y: 0, width: 600, height: 400 }),
  inline: false,
  grow: false,
})

const id = useId()
const layers = computed(() => patternLayers(props.pattern).map((layer, index) => {
  const resolved = resolveLayer(layer, props.box)
  return { ...resolved, markup: resolved.generator.render(resolved.seed, resolved.parameters, resolved.box, `${id}-${index}`) }
}))

const groups = ref<Element[]>([])
let growths: Growth[] = []

function stop() {
  growths.forEach(growth => growth.stop())
  growths = []
}

function replay() {
  stop()
  growths = layers.value.flatMap(({ generator, seed, parameters, box }, index) =>
    generator.animate ? [generator.animate(groups.value[index], seed, parameters, box)] : [])
}

onMounted(() => {
  if (props.grow)
    replay()
})
// A growth ends on the drawing it started with, before the new one replaces it
watch(layers, stop)
onBeforeUnmount(stop)

defineExpose({ replay })
</script>

<template>
  <svg v-if="!inline" :viewBox="`${box.x} ${box.y} ${box.width} ${box.height}`" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- an SVG <g>, not a component -->
    <g v-for="(layer, index) in layers" :key="index" ref="groups" :opacity="layer.opacity" v-html="layer.markup" />
  </svg>
  <g v-else>
    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -- an SVG <g>, not a component -->
    <g v-for="(layer, index) in layers" :key="index" ref="groups" :opacity="layer.opacity" v-html="layer.markup" />
  </g>
</template>
