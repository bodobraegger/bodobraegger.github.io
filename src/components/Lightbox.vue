<script setup lang="ts">
const imageModel = ref<HTMLImageElement>()
let images: HTMLImageElement[] = [];
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLElement

  switch(first.tagName) {
    case 'BUTTON':
      if (!first?.parentElement?.classList.contains('lightbox')) return
      const lightboxImg = document.getElementById(`lightbox`) as HTMLImageElement
      // TODO: Refactor this to use a computed property, make sure property is unique
      const index = images.findIndex(img => img.src === lightboxImg!.src)
      let nextIndex = index
      if (first.classList.contains('prev')) nextIndex = mod((index - 1), images.length)
      else nextIndex = (index + 1) % images.length
      imageModel.value = images[nextIndex]
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
        images = Array.from(document.querySelectorAll(`main img:not(.no-preview)`))
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

enum Direction {
  PREV = -1,
  NEXT = 1
}

function findNextImageIndex(direction: Direction): number {
  const lightboxImg = document.getElementById(`lightbox`) as HTMLImageElement
  const index = images.findIndex(img => img.src === lightboxImg!.src)
  return mod((index + direction), images.length)
}
onKeyStroke('ArrowLeft', (e) => {
  if (imageModel.value) {
    imageModel.value = images[findNextImageIndex(-1)]
    e.preventDefault()
  }
})
onKeyStroke('ArrowRight', (e) => {
  if (imageModel.value) {
    imageModel.value = images[findNextImageIndex( 1)]
    e.preventDefault()
  }
})
</script>
    
<template>
    <Transition name="fade">
        <div v-if="imageModel" fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7 flex class="lightbox">
            <div absolute top-0 left-0 right-0 bottom-0 bg-white:50 dark:bg-dark:50 z--1/>
            <figure m-auto max-w-100vw lg:max-w-84vw>
              <img :src="imageModel.src" :alt="imageModel.alt" max-h-90vh m-auto class="no-preview cursor-zoom-out" id="lightbox">
              <figcaption v-if="imageModel.dataset.caption" m-2>
                  {{ imageModel.dataset.caption }}
              </figcaption>
            </figure>
            <button v-if="images.length>1" absolute top-0 left-0 w-6vw lg:pr-2 lg:w-8vw h-full class="lightbox cursor-w-resize text-right prev">
                <button w-5 h-5 bg-transparent backdrop-invert i-bi:arrow-left class="prev"> </button>
            </button>
            <button v-if="images.length>1" absolute top-0 right-0 w-6vw lg:pl-2 lg:w-8vw h-full class="lightbox cursor-e-resize text-left">
                <button w-5 h-5 bg-transparent backdrop-invert i-bi:arrow-right align-left />
            </button>
        </div>
    </Transition>
</template>

<style scoped>
figcaption {
  color: var(--fg-deeper);
  text-align: center;
}
</style>