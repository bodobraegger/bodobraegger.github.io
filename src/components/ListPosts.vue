<script setup lang="ts">
import { useRouter } from 'vue-router'
import { englishOnly, formatDate } from '~/logics'
import type { Post } from '~/types'

const props = defineProps<{
  type?: string
  posts?: Post[]
  extra?: Post[]
}>()

const router = useRouter()
const routes: Post[] = router.getRoutes()
  .filter(i => (i.name?.toString().startsWith('posts-') || i.name?.toString().startsWith('notes-')) && i.meta.frontmatter.date && !i.meta.frontmatter.draft)
  .filter(i => !i.path.includes('.html') && (i.meta.frontmatter.type || 'blog').split('+').includes(props.type))
  .map(i => ({
    path: i.meta.frontmatter.redirect || i.path,
    title: i.meta.frontmatter.title,
    date: i.meta.frontmatter.date,
    lang: i.meta.frontmatter.lang,
    duration: i.meta.frontmatter.duration,
    recording: i.meta.frontmatter.recording,
    upcoming: i.meta.frontmatter.upcoming,
    redirect: i.meta.frontmatter.redirect,
    place: i.meta.frontmatter.place,
  }))

const posts = computed(() =>
  [...(props.posts || routes), ...props.extra || []]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .filter(i => !englishOnly.value || i.lang !== 'zh'),
)

const getYear = (a: Date | string | number) => new Date(a).getFullYear()
const isFuture = (a?: Date | string | number) => a && new Date(a) > new Date()
const isSameYear = (a?: Date | string | number, b?: Date | string | number) => a && b && getYear(a) === getYear(b)
function isSameGroup(a: Post, b?: Post) {
  return (isFuture(a.date) === isFuture(b?.date)) && isSameYear(a.date, b?.date)
}

function getGroupName(p: Post) {
  if (isFuture(p.date))
    return 'Upcoming'
  return getYear(p.date)
}
</script>

<template>
  <ul>
    <template v-if="!posts.length">
      <div class="py2 op50">
        { nothing here yet }
      </div>
    </template>

    <template v-for="route, idx in posts" :key="route.path">
      <div
        v-if="!isSameGroup(route, posts[idx - 1])"
        class="select-none relative h20 pointer-events-none"
        :style="{
          '--enter-stage': idx - 2,
          '--enter-step': '60ms',
        }"
      >
        <span
          class="absolute left--3rem top--2rem op-40 color-transparent font-serif-extra font-italic text-8em text-stroke-1 text-shadow text-stroke-hex-aaa"
          :class="{ 'max-sm:text-5.4em': getGroupName(route) === 'Upcoming' }"
        > {{ getGroupName(route) }}
        </span>
      </div>
      <div>
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
          <li class="no-underline flex col md:row gap-2 md:items-centerflex col md:row gap-2 md:items-center">
            <div class="title text-lg leading-1.2em flex gap-2 wrap">
              <span
                v-if="route.lang === 'zh'"
                class="align-middle flex-none text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 ml--12 mr2 my-auto hidden md:block"
              >中文</span>
              <span class="align-middle tracking-wider">{{ route.title }}</span>
            </div>

            <div class="flex gap-2 items-center">
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

              <span class="text-sm font-serif-extra op50 ws-nowrap">
                {{ formatDate(route.date, true) }}
              </span>
              <span v-if="route.duration" class="text-sm font-light op40 ws-nowrap">· {{ route.duration }}</span>
              <span v-if="route.platform" class="text-sm font-light op40 ws-nowrap">· {{ route.platform }}</span>
              <span v-if="route.place" class="text-sm font-light font-serif-extra font-italic op40 ws-nowrap md:hidden">{{ route.place }}</span>
              <span v-if="route.lang === 'zh'" class="align-middle flex-none text-xs bg-zinc:15 text-zinc5 rounded px-1 py-0.5 my-auto md:hidden">
                中文
              </span>
            </div>
          </li>
          <div v-if="route.place" class="op50 text-sm font-light font-serif-extra font-italic hidden mt--2 md:block">
            {{ route.place }}
          </div>
        </component>
      </div>
    </template>
  </ul>
</template>
