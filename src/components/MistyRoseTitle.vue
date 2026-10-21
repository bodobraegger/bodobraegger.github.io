<script setup lang='ts'>
/*
MistyRoseTitle: a title from which rose vines of Hammerfight grow, as they
grow from behind a chapter title of the game.

  <MistyRoseTitle>

  ## A title

  </MistyRoseTitle>

The wrapper is as wide as the title and takes no other space. The vines grow
in the background of MistyRose, so the page needs `mistyrose: true` or
`mistyrosetitle: true` in its frontmatter. The background plants its seeds
when the page is idle, so only a title in the window at that time gets vines.
*/
import { roseTitles } from '~/lib/mistyrose'

const title = ref<HTMLDivElement>()
// The template ref is empty again when the component unmounts
let element: HTMLDivElement
onMounted(() => {
  element = title.value!
  roseTitles.add(element)
})
onUnmounted(() => roseTitles.delete(element))
</script>

<template>
  <div ref="title" class="w-fit">
    <slot />
  </div>
</template>
