<script setup lang="ts">
defineProps<{
  repo: string
  name?: string
}>()
</script>

<template>
  <span class="ws-nowrap">
    <CarbonLogoGithub class="inline-block" />
    <a
      class="opacity-70 ml-1 font-mono"
      :href="`https://github.com/${repo}`"
      target="_blank"
    >{{ name || (repo.startsWith('bodobraegger/') ? repo.slice(6) : repo) }}</a>
  </span>
</template>
