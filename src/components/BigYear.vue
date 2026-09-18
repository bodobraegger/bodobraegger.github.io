<script setup lang="ts">
const props = defineProps<{
  label: string | number
  stage: number
}>()

// A word such as "Upcoming" is wider than a year, so it shrinks on small screens
const isWideLabel = computed(() => String(props.label).length > 4)

const fontsLoaded = ref(false)

onBeforeMount(() => {
  if (document.fonts)
    document.fonts.ready.then(() => fontsLoaded.value = true)
  else
    fontsLoaded.value = true
})
</script>

<template>
  <div
    class="select-none relative h20 pointer-events-none slide-enter big-year"
    :class="{ 'op0!': !fontsLoaded }"
    :style="{ '--enter-stage': stage, '--enter-step': '60ms' }"
  >
    <span
      class="absolute left--3rem top--2rem op-40 color-transparent font-serif-extra font-italic text-8em text-stroke-1 text-shadow text-stroke-hex-aaa"
      :class="{ 'max-sm:text-5.4em': isWideLabel }"
    >{{ label }}</span>
  </div>
</template>

<style scoped>
.big-year {
  filter: blur(1px);
}
</style>
