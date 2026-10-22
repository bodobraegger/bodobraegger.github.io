<script setup lang='ts'>
/*
MistyRoseTitle: a title from which rose vines of Hammerfight grow, as they
grow from behind a chapter title of the game.

  <MistyRoseTitle>

  ## A title

  </MistyRoseTitle>

The wrapper takes no space of its own, and the vines start at the sides of
the text of the title. They grow on the canvas of MistyRoseTitles, which
every page has. `mistyrosetitle: true`
in the frontmatter wraps the page title.
*/
import { roseTitles } from '~/composables/useMistyRose'

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
  <div ref="title">
    <slot />
  </div>
</template>
