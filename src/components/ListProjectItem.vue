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
        .maybeSingle()
      if (data)
        viewCount.value = data.view_count
    }
    catch {}
  }
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
      class="item block mb-2 mt-2 no-underline font-normal"
      :class="isHovering ? 'op100!' : ''"
    >
      <li class="relative isolate flex flex-wrap gap-2 md:items-center">
        <div class="title text-lg leading-1.2em flex gap-2 wrap">
          <span class="align-middle tracking-wider">{{ item.name }}</span>
          <span v-if="isExternal && item.link && item.link !== '.'" class="align-middle op50 flex-none text-xs ml--1 mt--1 i-carbon-arrow-up-right" title="External" />
        </div>
        <div class="flex flex-wrap gap-2 items-center op70 grow text-xs md:text-sm font-light font-serif-extra font-italic">
          <span v-if="item.date" class="ws-nowrap shrink-0">✹ {{ formatDate(item.date, false, 'MMM YYYY') }}</span>
          <span v-if="item.place" class="op80 ws-nowrap overflow-hidden min-w-0 shrink hidden md:inline">&#10028; {{ item.place }}</span>
          <div class="ml-auto flex gap-2 items-center shrink-0">
            <span v-if="pagePath" class="op80 ws-nowrap" :class="viewCount === null ? 'invisible' : ''">✶ <span class="inline-block min-w-6 text-right">{{ viewCount }}</span></span>
            <span
              v-if="category"
              class="align-middle flex-none not-italic font-normal font-mono text-xs border border-current border-dashed px-px my-auto cursor-pointer transition-opacity"
              :class="activeCategory === category || hoveredCategory === category ? 'op100 border-solid' : 'op60 hover:op100 hover:border-solid'"
              @mouseenter="emit('hover', category ?? null)"
              @mouseleave.stop="emit('hover', null)"
              @click.stop.prevent="emit('filter', category)"
            >{{ category }}</span>
          </div>
        </div>
      </li>
    </component>
    <div
      v-if="item.desc"
      class="w-full transition-opacity text-sm font-light mt-1 mb-8 leading-snug"
      v-html="item.desc"
    />
  </div>
</template>
