<script setup lang="ts">
import { formatDate } from '~/logics'
import { usePageViews } from '~/composables/usePageViews'
import type { Post } from '~/types'

const props = defineProps<{
  post: Post
}>()

const { viewCount, fetchViewCount } = usePageViews(props.post.path)

onMounted(fetchViewCount)
</script>

<template>
  <component
    :is="post.path.includes('://') ? 'a' : 'RouterLink'"
    v-bind="
      post.path.includes('://') ? {
        href: post.path,
        target: '_blank',
        rel: 'noopener noreferrer',
      } : {
        to: post.path,
      }
    "
    class="item block mb-6 mt-2 no-underline"
  >
    <li class="flex flex-col md:flex-row gap-2 md:items-center">
      <div class="title text-lg leading-1.2em flex gap-2 wrap">
        <span
          v-if="post.lang === 'zh'"
          class="align-middle flex-none text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 ml--12 mr2 my-auto hidden md:block"
        >中文</span>
        <span class="align-middle tracking-wider">{{ post.title }}</span>
      </div>

      <div class="flex gap-2 items-center op50 grow text-sm font-light font-serif-extra font-italic">
        <span
          v-if="post.redirect"
          class="align-middle op50 flex-none text-xs ml--1 mt--1 i-carbon-arrow-up-right"
          title="External"
        />
        <span
          v-if="post.inperson"
          class="i-ri:group-2-line align-middle op50 flex-none"
          title="In person"
        />
        <span
          v-if="post.recording || post.video"
          class="i-ri:film-line align-middle op50 flex-none"
          title="Provided in video"
        />
        <span
          v-if="post.radio"
          class="i-ri:radio-line align-middle op50 flex-none"
          title="Provided in radio"
        />
        <span v-if="post.date" class="ws-nowrap">✹ {{ formatDate(post.date, true) }}</span>
        <span v-if="post.duration" class="op80 ws-nowrap">· {{ post.duration }}</span>
        <span v-if="post.platform" class="op80 ws-nowrap">· {{ post.platform }}</span>
        <span v-if="post.place" class="op80 ws-nowrap">✬ {{ post.place }}</span>
        <div class="ml-auto flex gap-2 items-center">
          <span class="op80 ws-nowrap transition-opacity duration-500 tabular-nums min-w-[4ch] text-right" :class="viewCount === null ? 'opacity-0' : 'opacity-100'">✶ {{ viewCount }}</span>
          <span v-if="post.lang === 'zh'" class="align-middle flex-none text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 my-auto md:hidden">
            中文
          </span>
        </div>
      </div>
    </li>
  </component>
</template>
