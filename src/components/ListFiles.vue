<script setup lang="ts">
import { useRoute } from 'vue-router'

const props = defineProps<{ folder?: string }>()

const route = useRoute()
const currentFolder = route.path.split('/').filter(Boolean).slice(-1)[0] || ''

const folder = props.folder || currentFolder

// Non-eager on purpose: only the file paths are needed, not the contents
const files = import.meta.glob('../../pages/notes/**')

const fileList = Object.keys(files)
  .filter((path) => { return path.includes(`/notes/${folder}/`) && !path.includes('index.md') })
  .filter((path) => {
    const name = path.split('/').pop() || ''
    return name !== 'index.md'
  })
  .map((path) => {
    const name = path.split('/').pop() || ''
    return { name }
  })
</script>

<template>
  <div class="font-mono text-sm">
    <div v-for="file in fileList" :key="file.name">
      <RouterLink :to="`${folder}/${file.name.replace('.md', '')}`">
        {{ file.name }}
      </RouterLink>
    </div>
  </div>
</template>
