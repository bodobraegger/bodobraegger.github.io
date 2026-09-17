<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { defineAsyncComponent } from 'vue'
import { chatWanted } from '~/lib/chat-widget'

const ChatWidget = defineAsyncComponent(() => import('./components/ChatWidget.vue'))

const route = useRoute()

// Strip the leading year and month prefix, "2403-", from a slug
function stripDate(segment: string) {
  return segment.replace(/^\d{4}-/, '')
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
    <main class="px-7 of-x-hidden">
      <!-- The wrapper lives here, not as the markdown wrapperComponent: Vue
           never stringifies static content placed inside a component slot
           in the same template, and every page is static content. -->
      <WrapperPost :key="route.path" :frontmatter="route.meta.frontmatter ?? {}">
        <RouterView />
      </WrapperPost>
    </main>
    <Footer />
  </div>
  <Lightbox />
  <ClientOnly>
    <ChatWidget v-if="chatWanted" />
  </ClientOnly>
</template>
