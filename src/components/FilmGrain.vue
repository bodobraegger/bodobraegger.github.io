<script setup lang="ts">
// A layer of film grain over the box of the positioned parent, or with
// `fixed` over the window. The grain itself is plain CSS, see
// src/assets/film-grain/film-grain.css.
import '~/assets/film-grain/film-grain.css'

withDefaults(defineProps<{
  /** 0 to 1, the opacity of the grain */
  strength?: number
  /** CSS pixels for each texel of the grain tile */
  size?: number
  /** Colour grain instead of monochrome grain */
  color?: boolean
  /** New grain 24 times a second, like film. Reduced motion stops it. */
  animated?: boolean
  /** Cover the window instead of the parent */
  fixed?: boolean
}>(), { strength: 0.25, size: 1, color: false, animated: true, fixed: false })
</script>

<template>
  <div
    class="film-grain"
    :class="{ 'film-grain--fixed': fixed, 'film-grain--color': color, 'film-grain--still': !animated }"
    :style="{ '--film-grain-strength': strength, '--film-grain-size': size }"
    aria-hidden="true"
  />
</template>
