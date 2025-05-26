<script setup lang="ts">
const imageModel = ref<HTMLImageElement>()
let images: HTMLImageElement[] = []
let index = -1

enum Direction {
  PREV = -1,
  NEXT = 1,
}
function findNextImageIndex(direction: Direction): number {
  const lightboxImg = document.getElementById(`lightbox`) as HTMLImageElement
  index = images.findIndex(img => img.src === lightboxImg!.src)
  const r = index + direction
  if (r < 0)
    return images.length - 1
  else return r % images.length
}

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLElement

  switch (first.tagName) {
    case 'BUTTON':
      if (!first?.parentElement?.classList.contains('lightbox'))
        return
      if (first.classList.contains('prev'))
        imageModel.value = images[findNextImageIndex(Direction.PREV)]
      else
        imageModel.value = images[findNextImageIndex(Direction.NEXT)]
      break
    case 'IMG':
      if (first.classList.contains('no-preview')) {
        imageModel.value = undefined
        return
      }
      // Do not open image when they are moving. Mainly for mobile to avoid conflict with hovering behavior.
      const pos = first.getBoundingClientRect()
      await new Promise(resolve => setTimeout(resolve, 50))
      const newPos = first.getBoundingClientRect()
      if (pos.left !== newPos.left || pos.top !== newPos.top)
        return
      imageModel.value = first as HTMLImageElement
      if (!first.dataset.folder || first.dataset.folder === 'root')
        images = Array.from(document.querySelectorAll(`main img:not(.no-preview):not(.hidden)`))
      else
        images = Array.from(document.querySelectorAll(`main img[data-folder=${first.dataset.folder}]:not(.no-preview)`))
      break
    default:
      imageModel.value = undefined
  }
})

onKeyStroke('Escape', (e) => {
  if (imageModel.value) {
    imageModel.value = undefined
    e.preventDefault()
  }
})

onKeyStroke('ArrowLeft', (e) => {
  if (imageModel.value) {
    imageModel.value = images[findNextImageIndex(-1)]
    e.preventDefault()
  }
})
onKeyStroke('ArrowRight', (e) => {
  if (imageModel.value) {
    imageModel.value = images[findNextImageIndex(1)]
    e.preventDefault()
  }
})
</script>

<template>
  <Transition name="fade">
    <div v-if="imageModel" class="lightbox  fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7 flex cursor-zoom-out ">
      <div class="absolute top-0 left-0 right-0 bottom-0 bg-white:50 dark:bg-dark:50 z--1" />
      <button v-if="images.length > 1" class="lightbox prev  text-right cursor-w-resize h-full absolute top-0 left-0 min-w-6vw lg:flex-grow-1 lg:min-w-8vw lg:pr-2">
        <span class="prev  i-bi:arrow-left w-7 h-7 bg-transparent backdrop-invert font-mono text-xl"><-</span>
      </button>
      <figure class="m-auto max-w-100vw lg:max-w-84vw">
        <img id="lightbox" :src="imageModel.src" :alt="imageModel.alt" class="no-preview max-w-fit-content max-h-90vh m-auto">
        <figcaption v-if="imageModel.dataset.caption" class="m-2 text-center">
          {{ imageModel.alt }}
        </figcaption>
      </figure>
      <button v-if="images.length > 1" class="lightbox next  text-left cursor-e-resize h-full absolute top-0 right-0 min-w-6vw lg:flex-grow-1 lg:min-w-8vw lg:pl-2 ">
        <span class="next  w-7 h-7 bg-transparent backdrop-invert font-mono text-xl i-bi:arrow-right">-></span>
      </button>
    </div>
  </Transition>
</template>
