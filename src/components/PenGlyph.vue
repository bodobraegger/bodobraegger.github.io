<script setup lang="ts">
// The pencil of the desktop pens, drawn instead of borrowed from a font. The
// character it replaces (U+1F589, lower left pencil) has no emoji form, so a
// system without it in a text font, iOS among them, shows nothing at all.
//
// The pencil lies on the diagonal of a square box of one em, and its ink runs
// from 4 to 96 on both axes: centred in whatever box holds it, and as full as
// an emoji next to it. Its point is PEN_GLYPH_TIP, which the pens read back
// through the drawing itself, so the ink leaves the point whatever size or
// angle the pen is shown at.
</script>

<template>
  <svg class="pen-glyph" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <g fill="none" stroke="currentColor" stroke-width="6.2" stroke-linejoin="round" stroke-linecap="round">
      <!-- body, from the point up to the squared end -->
      <path d="M7.15 92.85 L29.37 83.34 L92.85 19.84 L80.14 7.15 L16.67 70.63 Z" />
      <!-- where the wood of the point ends -->
      <path d="M29.37 83.34 L16.67 70.63" />
      <!-- the band before the end -->
      <path d="M80.93 31.75 L68.23 19.05" />
    </g>
    <!-- the lead itself -->
    <path d="M7.15 92.85 L15.89 88.86 L11.13 84.10 Z" fill="currentColor" />
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
