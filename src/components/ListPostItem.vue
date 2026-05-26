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
    class="item block mb-6 mt-2 no-underline"
  >
    <li class="flex flex-col md:flex-row gap-2 md:items-center">
      <div class="title text-lg leading-1.2em flex gap-2 wrap">
        <span
          v-if="route.lang === 'zh'"
          class="align-middle flex-none text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 ml--12 mr2 my-auto hidden md:block"
        >中文</span>
        <span class="align-middle tracking-wider">{{ route.title }}</span>
      </div>

      <div class="flex gap-2 items-center op50 grow [&>*:last-child]:ml-auto text-sm font-light font-serif-extra font-italic">
        <span
          v-if="route.redirect"
          class="align-middle op50 flex-none text-xs ml--1 mt--1 i-carbon-arrow-up-right"
          title="External"
        />
        <span
          v-if="route.inperson"
          class="i-ri:group-2-line align-middle op50 flex-none"
          title="In person"
        />
        <span
          v-if="route.recording || route.video"
          class="i-ri:film-line align-middle op50 flex-none"
          title="Provided in video"
        />
        <span
          v-if="route.radio"
          class="i-ri:radio-line align-middle op50 flex-none"
          title="Provided in radio"
        />
        <span v-if="route.date" class="ws-nowrap">✹ {{ formatDate(route.date, true) }}</span>
        <span v-if="route.duration" class="op80 ws-nowrap">· {{ route.duration }}</span>
        <span v-if="route.platform" class="op80 ws-nowrap">· {{ route.platform }}</span>
        <span v-if="route.place" class="op80 ws-nowrap">✬ {{ route.place }}</span>
        <span class="op80 ws-nowrap">✶ <span class="w-9 inline-block text-right">{{ viewCount?.toString().padStart(3, '0') }}</span> view(s)</span>
        <span v-if="route.lang === 'zh'" class="align-middle flex-none text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 my-auto md:hidden">
          中文
        </span>
      </div>
    </li>
  </component>
</template>
