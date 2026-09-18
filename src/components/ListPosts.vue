<script setup lang="ts">
import { useRouter } from 'vue-router'
import { disableSlidingIfVisited } from '~/logics'
import { groupTranslations, resolveLanguage } from '~/logics/languages'
import type { Post } from '~/types'

const props = defineProps<{
  type?: string
}>()

const router = useRouter()
const posts: Post[] = groupTranslations(router.getRoutes()
  .filter(i => (i.name?.toString().startsWith('posts-') || i.name?.toString().startsWith('notes-')) && i.meta.frontmatter.date && !i.meta.frontmatter.draft)
  .filter(i => !i.path.includes('.html') && (i.meta.frontmatter.type || 'blog').split('+').includes(props.type))
  .map(i => ({
    path: i.meta.frontmatter.redirect || i.path,
    title: i.meta.frontmatter.title,
    date: i.meta.frontmatter.date,
    lang: resolveLanguage(i.meta.frontmatter.lang, i.path),
    duration: i.meta.frontmatter.duration,
    recording: i.meta.frontmatter.recording,
    redirect: i.meta.frontmatter.redirect,
    place: i.meta.frontmatter.place,
  })))
  .sort((a, b) => +new Date(b.date) - +new Date(a.date))

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

onBeforeMount(() => disableSlidingIfVisited('visited-notes'))
</script>

<template>
  <ul class="posts">
    <template v-if="!posts.length">
      <div class="py2 op50">
        { nothing here yet }
      </div>
    </template>

    <template v-for="post, idx in posts" :key="post.path">
      <BigYear
        v-if="!isSameGroup(post, posts[idx - 1])"
        :label="getGroupName(post)"
        :stage="idx - 2"
      />
      <div>
        <ListPostItem :post="post" />
      </div>
    </template>
  </ul>
</template>
