<script setup lang="ts">
import { disableSlidingIfVisited, formatDate } from '~/logics'

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

// Clearing is delayed so mouse travel between category links (and the gaps
// between them) does not flicker the chip highlights and the toc reveal
let hoverClearTimer: ReturnType<typeof setTimeout> | undefined
function setHoveredCategory(category: string | null) {
  clearTimeout(hoverClearTimer)
  if (category === null)
    hoverClearTimer = setTimeout(() => hoveredCategory.value = null, 200)
  else
    hoveredCategory.value = category
}

watch(hoveredCategory, (val) => {
  document.documentElement.classList.toggle('toc-always-on', !!val)
})

onUnmounted(() => {
  clearTimeout(hoverClearTimer)
  document.documentElement.classList.remove('toc-always-on')
})

// A project dated without a timezone is dated where it was made, so its year
// is read in Zurich rather than wherever the reader happens to be.
const PROJECT_TIME_ZONE = 'Europe/Zurich'
const hasTimezone = (date: string) => /Z|[+-]\d{2}:?\d{2}$/.test(date)

function getYear(date?: string) {
  if (!date)
    return '?'
  return Number(formatDate(date, false, {
    year: 'numeric',
    timeZone: hasTimezone(date) ? undefined : PROJECT_TIME_ZONE,
  }))
}

// Single pass: a year header appears on the first visible item of each year
const displayItems = computed(() => {
  let lastVisibleYear: number | string | undefined
  return flatProjects.value.map(({ item, category }) => {
    const visible = isVisible(category)
    const year = getYear(item.date)
    const showYearHeader = visible && year !== lastVisibleYear
    if (visible)
      lastVisibleYear = year
    return { item, category, visible, year, showYearHeader }
  })
})

onBeforeMount(() => disableSlidingIfVisited('visited-projects'))
</script>

<template>
  <ul class="projects">
    <template v-for="({ item, category, visible, year, showYearHeader }, idx) in displayItems" :key="`${category}-${item.name}`">
      <BigYear v-if="showYearHeader" :label="year" :stage="idx - 2" />
      <div
        :class="visible ? 'op100' : 'op0 h-0 overflow-hidden pointer-events-none'"
        style="transition: opacity 0.1s ease"
      >
        <ListProjectItem :item="item" :category="category" :active-category="activeCategory" :hovered-category="hoveredCategory" @filter="toggleCategory" @hover="setHoveredCategory" />
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
            @mouseenter="setHoveredCategory(key)"
            @mouseleave="setHoveredCategory(null)"
            @click="toggleCategory(key)"
          >{{ key }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
