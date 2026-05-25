<script setup lang="ts">
const props = defineProps<{ projects: Record<string, any[]> }>()

const activeCategory = ref<string | null>(null)
const hoveredCategory = ref<string | null>(null)
const ALL = null

const categories = computed(() => Object.keys(props.projects))

const flatProjects = computed(() => {
  const all: Array<{ item: any, category: string }> = []
  for (const category of categories.value) {
    for (const item of props.projects[category]) {
      all.push({ item, category })
    }
  }
  return all.sort((a, b) => +new Date(b.item.date ?? 0) - +new Date(a.item.date ?? 0))
})

function isVisible(category: string) {
  return activeCategory.value === ALL || activeCategory.value === category
}

function toggleCategory(key: string | null) {
  activeCategory.value = key === activeCategory.value ? ALL : key
}

watch(hoveredCategory, (val) => {
  document.documentElement.classList.toggle('toc-always-on', !!val)
})

onUnmounted(() => {
  document.documentElement.classList.remove('toc-always-on')
})

const getYear = (date?: string) => date ? new Date(date).getFullYear() : '?'
const isSameYear = (a?: string, b?: string) => getYear(a) === getYear(b)

// For year headers: find the first visible item before current idx
function prevVisibleItem(idx: number) {
  for (let i = idx - 1; i >= 0; i--) {
    if (isVisible(flatProjects.value[i].category))
      return flatProjects.value[i]
  }
  return undefined
}

const fontsLoaded = ref(false)

onBeforeMount(() => {
  if (document.fonts) {
    document.fonts.ready.then(() => {
      fontsLoaded.value = true
    })
  }
  else {
    fontsLoaded.value = true
  }

  const hasVisited = sessionStorage.getItem('visited-projects')
  if (hasVisited)
    document.documentElement.classList.add('no-sliding')
  else sessionStorage.setItem('visited-projects', new Date().toISOString())
})
</script>

<template>
  <ul class="posts">
    <template v-for="({ item, category }, idx) in flatProjects" :key="`${category}-${item.name}`">
      <div
        v-if="!isSameYear(item.date, prevVisibleItem(idx)?.item.date)"
        class="select-none relative h20 pointer-events-none slide-enter"
        :class="[{ 'op0!': !fontsLoaded }, !isVisible(category) ? 'hidden' : '']"
        :style="{ '--enter-stage': idx - 2, '--enter-step': '60ms' }"
      >
        <span class="absolute left--3rem top--2rem op-40 color-transparent font-serif-extra font-italic text-8em text-stroke-1 text-shadow text-stroke-hex-aaa">
          {{ getYear(item.date) }}
        </span>
      </div>
      <div
        :class="isVisible(category) ? 'op100' : 'op0 h-0 overflow-hidden pointer-events-none'"
        style="transition: opacity 0.1s ease"
      >
        <ListProjectItem :item="item" :category="category" :active-category="activeCategory" :hovered-category="hoveredCategory" @filter="toggleCategory" @hover="hoveredCategory = $event" />
      </div>
    </template>
  </ul>

  <div>
    <div class="table-of-contents">
      <div class="table-of-contents-anchor">
        <div class="i-ri-menu-2-fill" />
      </div>
      <ul>
        <li>
          <a
            href="javascript:void(0)"
            :class="activeCategory === null ? 'op100!' : ''"
            :style="activeCategory === null ? 'border-style: solid' : ''"
            @click="toggleCategory(null)"
          >all</a>
        </li>
        <li v-for="key of categories" :key="key">
          <a
            href="javascript:void(0)"
            :class="activeCategory === key || hoveredCategory === key ? 'op100!' : ''"
            :style="activeCategory === key || hoveredCategory === key ? 'border-style: solid' : ''"
            @mouseenter="hoveredCategory = key"
            @mouseleave="hoveredCategory = null"
            @click="toggleCategory(key)"
          >{{ key }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
