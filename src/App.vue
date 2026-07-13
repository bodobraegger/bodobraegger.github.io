<script setup lang="ts">
import { useHead } from '@unhead/vue'

const route = useRoute()

// Strip leading date prefix like "2024-03-27_" from a slug
function stripDate(segment: string) {
  return segment.replace(/^\d{4}-\d{2}-\d{2}_?/, '')
}

// Build title as "{pageTitle} - Bodo Braegger/{parents}"
// e.g. "Drawing Board - Bodo Braegger/projects"
//      "Notes - Bodo Braegger"
function buildTitle(pageTitle: string | undefined) {
  const pathSegments = route.path.split('/').filter(Boolean)

  if (pathSegments.length === 0)
    return 'Bodo Braegger'

  const parents = pathSegments.slice(0, -1).map(stripDate).filter(Boolean)
  const title = pageTitle || stripDate(pathSegments[pathSegments.length - 1])
  const breadcrumb = ['Bodo Braegger', ...parents].join('/')

  return `${title} - ${breadcrumb}`
}

// titleTemplate intercepts every useHead({title}) call from child pages
// and replaces it with our path-based title
useHead({
  titleTemplate: title => buildTitle(title ?? undefined),
})
</script>

<template>
  <div class="page-background" />
  <div class="flex flex-col justify-start min-h-screen xl-mx-auto xl:max-w-500">
    <NavBar />
    <main class="px-7 py-10 of-x-hidden">
      <RouterView />
    </main>
    <Footer :key="route.path" />
  </div>
  <Lightbox />
</template>
