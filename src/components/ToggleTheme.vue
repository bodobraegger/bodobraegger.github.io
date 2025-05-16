<script setup lang='ts'>
import { toggleDark } from '~/logics'
</script>

<template>
  <a class="select-none" title="Toggle Color Scheme" @click="toggleDark">
    <!-- <div i-ri-sun-line dark:i-ri-moon-line /> -->
    <span class="dark:hidden text-xs">dark?</span>
    <span class="hidden dark:inline text-xs">light?</span>
  </a>
</template>
