<script setup lang="ts">
const imageModel = ref<HTMLImageElement>()
let images: HTMLImageElement[] = [];
function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLElement
  // console.log('click', first)

  switch(first.tagName) {
    case 'BUTTON':
      if (!first?.parentElement?.classList.contains('lightbox')) return
      const lightboxImg = document.getElementById(`lightbox`)
      const index = images.findIndex(img => img.id === lightboxImg!.dataset.imgId)
      let nextIndex = index
      if (first.classList.contains('prev')) nextIndex = mod((index - 1), images.length)
      else nextIndex = (index + 1) % images.length
      // console.log('nextIndex', nextIndex)
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
      imageModel.value
      images = Array.from(document.querySelectorAll(`main img:not(.no-preview)`))
      // console.log(images)
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
    const lightboxImg = document.getElementById(`lightbox`)
    const index = images.findIndex(img => img.id === lightboxImg!.dataset.imgId)
    const nextIndex = mod((index - 1), images.length)
    imageModel.value = images[nextIndex]
    e.preventDefault()
  }
})
onKeyStroke('ArrowRight', (e) => {
  if (imageModel.value) {
    const lightboxImg = document.getElementById(`lightbox`)
    const index = images.findIndex(img => img.id === lightboxImg!.dataset.imgId)
    const nextIndex = (index + 1) % images.length
    imageModel.value = images[nextIndex]
    e.preventDefault()
  }
})
</script>
    
<template>
    <Transition name="fade">
        <div v-if="imageModel" fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7 class="lightbox">
            <div absolute top-0 left-0 right-0 bottom-0 bg-black:30 z--1/>
            <img :src="imageModel.src" :alt="imageModel.alt" w-full lg:w-84vw h-full object-contain m-auto class="no-preview cursor-zoom-out" id="lightbox" :data-img-id="imageModel.id">
            <button v-if="images.length>1" absolute top-0 left-0 w-6vw lg:pr-2 lg:w-8vw h-full class="lightbox cursor-w-resize text-right prev">
                <button w-5 h-5 bg-transparent backdrop-invert i-bi:arrow-left class="prev"> </button>
            </button>
            <button v-if="images.length>1" absolute top-0 right-0 w-6vw lg:pl-2 lg:w-8vw h-full class="lightbox cursor-e-resize text-left">
                <button w-5 h-5 bg-transparent backdrop-invert i-bi:arrow-right align-left />
            </button>
        </div>
    </Transition>
</template>