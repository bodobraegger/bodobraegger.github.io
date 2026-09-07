<script setup lang="ts">
import { useRouter } from 'vue-router'
import { groupTranslations, resolveLanguage } from '~/logics/languages'
import type { Post } from '~/types'

const props = defineProps<{
  type?: string
  posts?: Post[]
  extra?: Post[]
}>()

const router = useRouter()
const routes: Post[] = groupTranslations(router.getRoutes()
  .filter(i => (i.name?.toString().startsWith('posts-') || i.name?.toString().startsWith('notes-')) && i.meta.frontmatter.date && !i.meta.frontmatter.draft)
  .filter(i => !i.path.includes('.html') && (i.meta.frontmatter.type || 'blog').split('+').includes(props.type))
  .map(i => ({
    path: i.meta.frontmatter.redirect || i.path,
    title: i.meta.frontmatter.title,
    date: i.meta.frontmatter.date,
    lang: resolveLanguage(i.meta.frontmatter.lang, i.path),
    duration: i.meta.frontmatter.duration,
    recording: i.meta.frontmatter.recording,
    upcoming: i.meta.frontmatter.upcoming,
    redirect: i.meta.frontmatter.redirect,
    place: i.meta.frontmatter.place,
  })))

const posts = computed(() =>
  [...(props.posts || routes), ...props.extra || []]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
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

onBeforeMount(() => {
  const hasVisited = sessionStorage.getItem('visited-notes')
  if (hasVisited)
    document.documentElement.classList.add('no-sliding')
  else sessionStorage.setItem('visited-notes', new Date().toISOString())
})
</script>

<template>
  <ul class="posts">
    <template v-if="!posts.length">
      <div class="py2 op50">
        { nothing here yet }
      </div>
    </template>

    <template v-for="post, idx in posts" :key="post.path">
      <div
        v-if="!isSameGroup(post, posts[idx - 1])"
        class="select-none relative h20 pointer-events-none slide-enter"
        :style="{
          '--enter-stage': idx - 2,
          '--enter-step': '60ms',
        }"
      >
        <span
          class="absolute left--3rem top--2rem op-40 color-transparent font-serif-extra font-italic text-8em text-stroke-1 text-shadow text-stroke-hex-aaa"
          :class="{ 'max-sm:text-5.4em': getGroupName(post) === 'Upcoming' }"
        > {{ getGroupName(post) }}
        </span>
      </div>
      <div>
        <ListPostItem :post="post" />
      </div>
    </template>
  </ul>
</template>
