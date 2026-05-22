<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{ projects: Record<string, any[]> }>()

const projectImages = ref<Record<string, string>>({})

function slug(name: string) {
  return name.toLowerCase().replace(/[\s\\/]+/g, '-')
}

function prependLocalLink(link: string) {
  return (link.startsWith('http') || link.startsWith('/')) ? link : `/projects/${link}`
}

async function loadProjectImages() {
  const images: Record<string, string> = {}

  for (const category of Object.keys(props.projects)) {
    for (const item of props.projects[category]) {
      if (item.link && !item.link.startsWith('http') && !item.link.startsWith('//') && item.link !== '.') {
        try {
          const projectSlug = item.link.replace('./projects/', '').replace('./', '')
          const response = await fetch(`/pages/projects/${projectSlug}.md`)
          if (response.ok) {
            const content = await response.text()
            const imageMatch = content.match(/!\[.*?\]\((.*?)\)/)
            if (imageMatch && imageMatch[1]) {
              images[item.name] = imageMatch[1]
            }
          }
        }
        catch (e) {
          // Silently fail
        }
      }
    }
  }

  projectImages.value = images
}

onMounted(() => {
  loadProjectImages()
})

function getBackgroundImage(item: any): string | undefined {
  const image = projectImages.value[item.name]
  if (image) {
    return `url(${image})`
  }
  return undefined
}
</script>

<template>
  <div class="prose m-auto max-w-300 projects">
    <div
      v-for="key, in Object.keys(projects)" :key="key"
    >
      <h4 :id="slug(key)" class="mt-15 mb-2 font-medium op90">
        {{ key }}
      </h4>
      <div
        class="project-grid py-2 max-w-500 grid cols-1 md:cols-2 gap-4"
        :class="projects[key].length === 1 ? 'flex' : projects[key].length > 2 ? 'lg:grid-cols-3' : ''"
      >
        <a
          v-for="item, idx in projects[key]"
          :key="idx"
          class="item relative flex"
          :href="prependLocalLink(item.link)"
          :target="(item.link && (item.link.startsWith('http') || item.link.startsWith('//'))) ? '_blank' : undefined"
          :class="!item.link ? 'opacity-0 pointer-events-none h-0 -mt-8 -mb-4' : ''"
          :title="item.name"
        >
          <!-- <div v-if="item.icon" class="pt-2 pr-5">
            <Logo v-if="item.icon === 'monogram'" class="text-4xl opacity-50" />
            <div v-else class="text-3xl opacity-50" :class="item.icon || 'i-carbon-unknown'" />
          </div> -->
          <div class="flex-auto">
            <div class="text-normal">{{ item.name }}</div>
            <div class="desc text-sm font-light opacity-85 font-normal prose" v-html="item.desc" />
            <div v-if="getBackgroundImage(item)" class="absolute inset-0 bg-cover bg-center op-30 mix-blend-difference pointer-events-none" :style="`background-image: ${getBackgroundImage(item)}`" />
          </div>
        </a>
      </div>
    </div>
    <!-- <div class="prose pb5 mx-auto mt10 text-center">
      <p op75>
        <em>
          Thanks for your interest in my work! If you are feeling charitable, please consider
          &nbsp;<a
            href="https://github.com/sponsors/bodobraegger"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >sponsoring me</a>&nbsp; to keep my work sustainable. Thank you!
        </em>
      </p>

      <SponsorButton />
    </div> -->
  </div>
  <div>
    <div class="table-of-contents">
      <div class="table-of-contents-anchor">
        <div class="i-ri-menu-2-fill" />
      </div>
      <ul>
        <li v-for="key of Object.keys(projects)" :key="key">
          <a :href="`#${slug(key)}`">{{ key }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
