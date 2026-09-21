<script setup lang="ts">
import { useRoute } from 'vue-router'

const props = defineProps<{ folder?: string }>()

const route = useRoute()
const currentFolder = route.path.split('/').filter(Boolean).slice(-1)[0] || ''

const folder = props.folder || currentFolder

// Non-eager on purpose: only the file paths are needed, not the contents.
// One level under notes/, any extension: a folder holds notes, and the deeper
// pattern this replaces pulled every nested asset into the module graph too.
const files = import.meta.glob('../../pages/notes/*/*')

const fileNames = Object.keys(files)
  .filter(path => path.includes(`/notes/${folder}/`) && !path.endsWith('/index.md'))
  .map(path => path.split('/').pop()!)
</script>

<template>
  <div class="font-mono text-sm">
    <div v-for="name in fileNames" :key="name">
      <RouterLink :to="`${folder}/${name.replace(/\.md$/, '')}`">
        {{ name }}
      </RouterLink>
    </div>
  </div>
</template>
