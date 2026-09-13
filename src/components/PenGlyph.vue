<script setup lang="ts">
// The pencil of the desktop pens, drawn instead of borrowed from a font. The
// character it replaces (U+1F589, lower left pencil) has no emoji form, so a
// system without it in a text font, iOS among them, shows nothing at all.
//
// The drawing keeps the geometry the tip offsets are calibrated for: a square
// box of one em, the pencil on the diagonal, and its point in the lower left
// corner at 0.1em, 1em.
</script>

<template>
  <svg class="pen-glyph" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-width="5.5" stroke-linejoin="round" stroke-linecap="round">
      <!-- body, from the point up to the squared end -->
      <path d="M10 100 L31.9 90.8 L84.2 38.5 L95.6 27.2 L82.8 14.4 L71.5 25.8 L19.2 78.1 Z" />
      <!-- where the wood of the point ends -->
      <path d="M19.2 78.1 L31.9 90.8" />
      <!-- the band before the end -->
      <path d="M71.5 25.8 L84.2 38.5" />
    </g>
    <!-- the lead itself -->
    <path d="M10 100 L18.6 95.9 L14.1 91.4 Z" fill="currentColor" />
  </svg>
</template>

<style scoped>
.pen-glyph {
  display: block;
  width: 1em;
  height: 1em;
  overflow: visible;
}
</style>
