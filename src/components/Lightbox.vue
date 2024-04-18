<script setup lang="ts">
const imageModel = ref<HTMLImageElement>()
let images: HTMLImageElement[] = [];

useEventListener('click', async (e) => {
  const path = Array.from(e.composedPath())
  const first = path[0] as HTMLElement
  // console.log('click', first)
  function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }

  switch(first.tagName) {
    case 'BUTTON':
      if (!first?.parentElement?.classList.contains('lightbox')) return
      const lightboxImg = document.getElementById(`lightbox`)
      const index = images.findIndex(img => img.id === lightboxImg!.dataset.imgId)
      if (index === -1) return
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
</script>
    
<template>
    <Transition name="fade">
        <div v-if="imageModel" fixed top-0 left-0 right-0 bottom-0 z-500 backdrop-blur-7  class="lightbox">
            <div absolute top-0 left-0 right-0 bottom-0 bg-black:30 z--1/>
            <img :src="imageModel.src" :alt="imageModel.alt" w-80vw h-full object-contain m-auto class="no-preview" id="lightbox" :data-img-id="imageModel.id">
            <button absolute top-0 left-0 w-10vw h-full object-contain class="lightbox cursor-w-resize prev">
                <button v-if="images.length>1" w-10 h-10  class="i-bi:arrow-left prev"> </button>
            </button>
            <button absolute top-0 right-0 w-10vw h-full object-contain class="lightbox cursor-e-resize">
                <button v-if="images.length>1" w-10 h-10 class="i-bi:arrow-right">"></button>
            </button>
        </div>
    </Transition>
</template>