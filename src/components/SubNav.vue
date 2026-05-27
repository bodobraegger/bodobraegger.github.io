<script setup lang="ts">
import { useRoute } from 'vue-router'
import { englishOnly } from '../logics'

const inactiveStyle = 'op-25 hover:op-50'
const activeStyle = 'op-100 underline'

const route = useRoute()
</script>

<template>
  <div class="prose m-auto mb-8 select-none animate-none! op-100!">
    <button class="flex gap-1 items-center mb-2 op-25 text-meta" @click="englishOnly = !englishOnly">
      <div :class="englishOnly ? 'i-carbon-checkbox-checked' : 'i-carbon-checkbox'" />
      English Only
    </button>

    <div class="mb-0 flex flex-col gap-1 sm:flex-row sm:gap-3 flex-wrap text-3xl">
      <RouterLink to="/posts" class="!border-none" :class="route.path === '/posts' ? activeStyle : inactiveStyle">
        Blog
      </RouterLink>
      <RouterLink to="/notes" class="!border-none" :class="route.path === '/notes' ? activeStyle : inactiveStyle">
        Notes
      </RouterLink>
    </div>
  </div>
</template>
