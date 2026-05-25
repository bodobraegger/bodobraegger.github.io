<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { formatDate } from '~/logics'
import { usePageViews } from '~/composables/usePageViews'
import { supabase } from '~/lib/supabase'

const props = defineProps<{
  item: { name: string, link?: string, desc?: string, date?: string, place?: string }
  category?: string
  activeCategory?: string | null
  hoveredCategory?: string | null
}>()

const emit = defineEmits<{ filter: [category: string], hover: [category: string | null] }>()

const primaryImage = ref<string | null>(null)

const isExternal = computed(() =>
  !props.item.link || props.item.link === '.' || props.item.link.startsWith('http') || props.item.link.startsWith('//'),
)

const href = computed(() =>
  isExternal.value
    ? (props.item.link ?? '.')
    : `/projects/${props.item.link!.replace('./projects/', '').replace('./', '')}`,
)

const isHovering = ref(false)

const pagePath = computed(() =>
  !isExternal.value && props.item.link && props.item.link !== '.'
    ? `/projects/${props.item.link!.replace('./projects/', '').replace('./', '')}`
    : null,
)

const { viewCount } = usePageViews(pagePath.value ?? '')

onMounted(async () => {
  if (pagePath.value && supabase) {
    try {
      const { data } = await supabase
        .from('page_views')
        .select('view_count')
        .eq('page_path', pagePath.value)
        .single()
      if (data)
        viewCount.value = data.view_count
    }
    catch {}
  }
  if (isExternal.value)
    return
  try {
    const slug = props.item.link!.replace('./projects/', '').replace('./', '')
    const res = await fetch(`/pages/projects/${slug}.md`)
    if (!res.ok)
      return
    const text = await res.text()
    const m = text.match(/!\[.*?\]\((.*?)\)/)
    if (m?.[1])
      primaryImage.value = m[1]
  }
  catch {}
})
</script>

<template>
  <div
    class="group"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false; emit('hover', null)"
  >
    <component
      :is="isExternal ? 'a' : 'RouterLink'"
      v-bind="isExternal
        ? (item.link && item.link !== '.' ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})
        : { to: href }"
      class="item block mb-2 mt-2 no-underline color-inherit font-normal"
      :class="isHovering ? 'op100!' : ''"
    >
      <li class="relative isolate flex flex-wrap gap-2 md:items-center">
        <img
          v-if="primaryImage"
          :src="primaryImage"
          :alt="item.name"
          class="absolute right-0 top-0 h-full w-40 object-cover op-30 mix-blend-difference pointer-events-none z--1"
          aria-hidden="true"
        >
        <div class="title text-lg leading-1.2em flex gap-2 wrap">
          <span class="align-middle tracking-wider">{{ item.name }}</span>
          <span v-if="isExternal && item.link && item.link !== '.'" class="align-middle op50 flex-none text-xs ml--1 mt--1 i-carbon-arrow-up-right" title="External" />
        </div>
        <div class="flex gap-2 items-center op50 grow text-sm font-light font-serif-extra font-italic">
          <span v-if="item.date" class="ws-nowrap">✹ {{ formatDate(item.date, false, 'MMM YYYY') }}</span>
          <span v-if="item.place" class="op80 ws-nowrap ml-auto">&#10028; {{ item.place }}</span>
          <span
            v-if="category"
            class="align-middle flex-none not-italic font-normal font-mono text-xs border border-current border-dashed px-px my-auto cursor-pointer transition-opacity"
            :class="[
              activeCategory === category || hoveredCategory === category ? 'op100 border-solid' : 'op60 hover:op100 hover:border-solid',
              !item.place ? 'ml-auto' : '',
            ]"
            @mouseenter="emit('hover', category ?? null)"
            @click.stop.prevent="emit('filter', category)"
          >{{ category }}</span>
        </div>
      </li>
    </component>
    <div
      v-if="item.desc"
      class="w-full op30 group-hover:op60 transition-opacity text-sm font-light mt-1 mb-8 leading-snug"
      :class="primaryImage ? 'pr-28' : ''"
      v-html="item.desc"
    />
  </div>
</template>
