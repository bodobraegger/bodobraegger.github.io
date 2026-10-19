<script setup lang="ts">
// The plum logo of the banner, in its own coordinates: a five-lobed outline of
// radius 50 around the origin, white petals softened like the print, with a
// bluish centre, a bluish diagonal and a light-blue rim inside the outline
// that fades inwards. Place it with a transform.
import { useId } from 'vue'

// From plumPath in tools/fits/logo.mjs (depth 0.23, sharpness 1.25)
const PLUM_OUTLINE = 'M0 -50L3.1 -49.9L6.2 -49.3L9.2 -48.4L12.1 -47L14.7 -45.2L17 -43L19 -40.4L20.6 -37.5L21.8 -34.4L22.6 -31.1L25.9 -31.4L29.3 -31.2L32.5 -30.5L35.6 -29.4L38.4 -27.9L41 -26L43.2 -23.7L45 -21.2L46.4 -18.4L47.6 -15.5L48.4 -12.4L48.9 -9.3L48.9 -6.2L48.5 -3L47.5 0L46.1 2.9L44.3 5.6L42 8L39.4 10.1L36.6 11.9L37.8 15L38.7 18.2L39.1 21.5L39 24.8L38.4 27.9L37.4 30.9L35.9 33.7L34 36.3L31.8 38.5L29.4 40.5L26.8 42.2L24 43.6L21 44.6L17.9 45.1L14.7 45.2L11.5 44.8L8.4 43.8L5.4 42.4L2.6 40.6L0 38.5L-2.6 40.6L-5.4 42.4L-8.4 43.8L-11.5 44.8L-14.7 45.2L-17.9 45.1L-21 44.6L-24 43.6L-26.8 42.2L-29.4 40.5L-31.8 38.5L-34 36.3L-35.9 33.7L-37.4 30.9L-38.4 27.9L-39 24.8L-39.1 21.5L-38.7 18.2L-37.8 15L-36.6 11.9L-39.4 10.1L-42 8L-44.3 5.6L-46.1 2.9L-47.5 0L-48.5 -3L-48.9 -6.2L-48.9 -9.3L-48.4 -12.4L-47.6 -15.5L-46.4 -18.4L-45 -21.2L-43.2 -23.7L-41 -26L-38.4 -27.9L-35.6 -29.4L-32.5 -30.5L-29.3 -31.2L-25.9 -31.4L-22.6 -31.1L-21.8 -34.4L-20.6 -37.5L-19 -40.4L-17 -43L-14.7 -45.2L-12.1 -47L-9.2 -48.4L-6.2 -49.3L-3.1 -49.9Z'

const id = useId()
const plum = `${id}-plum`
const clip = `${id}-clip`
const blur = `${id}-blur`
const rimBlur = `${id}-rim-blur`
const soft = `${id}-soft`
</script>

<template>
  <g :filter="`url(#${soft})`">
    <defs>
      <path :id="plum" :d="PLUM_OUTLINE" />
      <clipPath :id="clip">
        <use :href="`#${plum}`" />
      </clipPath>
      <filter :id="blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1" />
      </filter>
      <filter :id="rimBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1" />
      </filter>
      <filter :id="soft" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    </defs>
    <use :href="`#${plum}`" fill="#f2f3f3" />
    <g :clip-path="`url(#${clip})`">
      <use :href="`#${plum}`" transform="scale(0.38)" fill="#b6def6" :filter="`url(#${blur})`" />
      <rect x="-60" y="-10.75" width="120" height="21.5" transform="rotate(-61.25) translate(0 0.5)" fill="#aad6f2" opacity="0.94" :filter="`url(#${blur})`" />
      <use :href="`#${plum}`" fill="none" stroke="#a7d5f8" stroke-width="19.5" opacity="0.86" :filter="`url(#${rimBlur})`" />
    </g>
  </g>
</template>
