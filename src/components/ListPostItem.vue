<script setup lang="ts">
import { formatDate } from '~/logics'
import { usePageViews } from '~/composables/usePageViews'
import { supabase } from '~/lib/supabase'
import type { Post } from '~/types'

const props = defineProps<{
  route: Post
}>()

// Track views for this post
const { viewCount } = usePageViews(props.route.path)

// Fetch view count on mount (non-blocking)
onMounted(() => {
  void (async () => {
    if (!supabase || !props.route.path)
      return

    try {
      const { data } = await supabase
        .from('page_views')
        .select('view_count')
        .eq('page_path', props.route.path)
        .maybeSingle()

      if (data)
        viewCount.value = data.view_count
    }
    catch {
      // Silent fail
    }
  })()
})
</script>

<template>
  <component
    :is="route.path.includes('://') ? 'a' : 'RouterLink'"
    v-bind="
      route.path.includes('://') ? {
        href: route.path,
        target: '_blank',
        rel: 'noopener noreferrer',
      } : {
        to: route.path,
      }
    "
  >
    <li>
      <span class="title">
        <span v-if="route.lang === 'zh'" class="lang hidden md:inline">中文</span>
        {{ route.title }}
      </span>

      <span class="meta">
        <span v-if="route.redirect" class="i-carbon-arrow-up-right" title="External" />
        <span v-if="route.inperson" class="i-ri:group-2-line" title="In person" />
        <span v-if="route.recording || route.video" class="i-ri:film-line" title="Provided in video" />
        <span v-if="route.radio" class="i-ri:radio-line" title="Provided in radio" />
        <span v-if="route.date">✹ {{ formatDate(route.date, true) }}</span>
        <span v-if="route.duration" class="dim">· {{ route.duration }}</span>
        <span v-if="route.platform" class="dim">· {{ route.platform }}</span>
        <span v-if="route.place" class="dim">✬ {{ route.place }}</span>
        <span class="dim">✶ {{ viewCount?.toString().padStart(3, '0') }} views</span>
        <span v-if="route.lang === 'zh'" class="lang md:hidden">中文</span>
      </span>
    </li>
  </component>
</template>
