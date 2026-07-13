<script setup lang="ts">
import { useRouter } from 'vue-router'
import { englishOnly } from '~/logics'
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

const fontsLoaded = ref(false)

onBeforeMount(() => {
  // Wait for fonts to load
  if (document.fonts) {
    document.fonts.ready.then(() => {
      fontsLoaded.value = true
    })
  }
  else {
    fontsLoaded.value = true
  }

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
        :class="{ 'op0!': !fontsLoaded }"
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
