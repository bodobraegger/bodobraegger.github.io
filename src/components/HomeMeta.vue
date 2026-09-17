<script setup lang='ts'>
import { formatDate } from '~/logics'

// The place of the newest post, read the same way the lists read it, so the
// weather here follows wherever the writing was last done.
const lastPostPlace = useRouter().getRoutes()
  .filter(route => route.meta.frontmatter?.date && route.meta.frontmatter?.place && !route.meta.frontmatter?.draft)
  .sort((a, b) => +new Date(b.meta.frontmatter.date) - +new Date(a.meta.frontmatter.date))[0]
  ?.meta.frontmatter.place ?? ''

const lastUpdate = formatDate(__LAST_UPDATE__, false, { year: 'numeric', month: 'short', day: 'numeric' })
</script>

<template>
  <p class="meta font-heading">
    <span class="meta-item">last update {{ lastUpdate }}</span>
    <WeatherLine class="meta-item" :place="lastPostPlace" label="last seen in" />
  </p>
</template>

<style scoped>
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0 1.2rem;
  margin: 3rem 0 0;
  padding-top: 0.8rem;
  border-top: 1px solid var(--fg-deeper);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  opacity: 0.8;
}

.meta-item::before {
  content: '◌ ';
}
</style>
