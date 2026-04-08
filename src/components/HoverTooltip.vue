<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  text: string
  x: number
  y: number
  show: boolean
}

const props = defineProps<Props>()

const tooltipStyle = computed(() => {
  return {
    left: `${props.x + 12}px`,
    top: `${props.y + 12}px`,
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <span
        v-if="show && text"
        class="hover-tooltip"
        :style="tooltipStyle"
      >
        {{ text }}
      </span>
    </Transition>
  </Teleport>
</template>

<style scoped>
.hover-tooltip {
  position: fixed;
  background: var(--c-bg);
  color: var(--fg);
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
