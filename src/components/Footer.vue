<script setup lang='ts'>
import { readerPlace } from '~/logics/weather'
import { EPUB_LINK, offersEpub } from '~/logics/epub-link'

const route = useRoute()
const showEpub = computed(() => offersEpub(route.meta.frontmatter))
</script>

<template>
  <footer class="pt-10 p-7 mb-0 prose flex mt-auto w-full backdrop-blur-sm ">
    <span class="text-xs font-light op50">
      <a target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" style="color:inherit">
        CC BY-NC-SA 4.0</a>
      2023-PRESENT ©&nbsp;Bodo&nbsp;Braegger
      <RouterLink v-if="showEpub" v-slot="{ href, navigate }" :to="EPUB_LINK" custom>
        <a :href="href" rel="nofollow" style="color:inherit" @click="navigate">&nbsp;EPUB</a>
      </RouterLink>
    </span>
    <span class="text-xs font-light op50 ml-auto">
      <WeatherLine :place="readerPlace()" label="◌ are you in ≈" />
    </span>
  </footer>
</template>

<style lang="css" scoped>
footer {
  mask-image: linear-gradient(to top, var(--c-bg) 50%, transparent 100%);
  filter: url(#xerox);
}
</style>
