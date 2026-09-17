<script setup lang='ts'>
import { readerPlace } from '~/logics/weather'
</script>

<template>
  <footer class="pt-10 p-7 mb-0 prose flex mt-auto w-full backdrop-blur-sm ">
    <span class="text-xs font-light op50">
      <a target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" style="color:inherit">
        CC BY-NC-SA 4.0</a>
      2023-PRESENT ©&nbsp;Bodo&nbsp;Braegger
    </span>
    <!-- Arrives on its own once the reading is in, and never if it is not. -->
    <span class="text-xs font-light op50 ml-auto">
      <WeatherLine :place="readerPlace()" label="◌ are you in ≈" />
    </span>
  </footer>
</template>

<style lang="css" scoped>
footer {
  mask-image: linear-gradient(to top, var(--c-bg) 50%, transparent 100%);
}
</style>
