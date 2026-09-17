<script setup lang='ts'>
import { whenIdle } from '~/logics/idle'
import { weatherAt } from '~/logics/weather'
import type { Weather } from '~/logics/weather'

const props = defineProps<{
  /** The place to read, as it is written for a reader. */
  place: string
  /** The words in front of the reading, "it is" for one. */
  label?: string
}>()

const weather = ref<Weather | null>(null)

// The reading is an aside, so it waits for a gap in the work of the page and
// then arrives on its own. Nothing is painted until it does, and nothing is
// painted at all if the service never answers.
onMounted(() => {
  if (!props.place)
    return
  whenIdle(() => {
    void weatherAt(props.place).then((reading) => {
      weather.value = reading
    })
  })
})
</script>

<template>
  <span v-if="weather" class="weather-line">
    <span v-if="label" class="op50">{{ label }}</span>
    {{ weather.place }} ? {{ weather.celsius }}°C, {{ weather.sky }}
  </span>
</template>

<style scoped>
.weather-line {
  animation: weather-arrive 0.8s ease-out both;
}

@keyframes weather-arrive {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
