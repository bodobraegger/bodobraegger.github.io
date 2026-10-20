<script setup lang="ts">
// The grain of a 35 mm film photo over the box of the positioned parent, or
// with `fixed` over the window. The grain itself is plain CSS, see
// src/assets/film-grain/film-grain.css.
import '~/assets/film-grain/film-grain.css'

type FilmStock = 'ektar-100' | 'portra-400' | 'gold-200' | 'superia-400' | 'tri-x-400' | 'hp5'

withDefaults(defineProps<{
  /** The film: its grain, colour or monochrome, and its strength */
  stock?: FilmStock
  /** 0 to 1, replaces the strength of the stock */
  strength?: number
  /** The enlargement of the grain. Whole numbers keep it sharp. */
  size?: number
  /** Cover the window instead of the parent */
  fixed?: boolean
}>(), { stock: 'portra-400', size: 1, fixed: false })
</script>

<template>
  <div
    class="film-grain"
    :class="[`film-grain--${stock}`, { 'film-grain--fixed': fixed }]"
    :style="{ '--film-grain-strength': strength, '--film-grain-size': size }"
    aria-hidden="true"
  />
</template>
