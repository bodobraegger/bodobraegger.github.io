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

const rootEl = ref<HTMLElement | null>(null)

function onFilter(category: string) {
  emit('filter', category)
  nextTick(() => {
    rootEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const isExternal = computed(() =>
  !props.item.link || props.item.link === '.' || props.item.link.startsWith('http') || props.item.link.startsWith('//'),
)

const href = computed(() =>
  isExternal.value
    ? (props.item.link ?? '.')
    : `/projects/${props.item.link!.replace('./projects/', '').replace('./', '')}`,
)

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
    ref="rootEl"
    class="group"
    @mouseleave="emit('hover', null)"
  >
    <li class="relative isolate flex flex-wrap gap-2 md:items-center mb-2 mt-2">
      <component
        :is="isExternal ? 'a' : 'RouterLink'"
        v-bind="isExternal
          ? (item.link && item.link !== '.' ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})
          : { to: href }"
        class="item no-underline color-inherit font-normal"
      >
        <div class="title text-lg leading-1.2em flex gap-2 wrap">
          <span class="align-middle tracking-wider">{{ item.name }}</span>
          <span v-if="isExternal && item.link && item.link !== '.'" class="align-middle flex-none text-xs ml--1 mt--1 i-carbon-arrow-up-right" title="External" />
        </div>
      </component>
      <div class="flex gap-2 items-center grow op-70 text-sm font-light font-serif-extra font-italic">
        <span v-if="item.date" class="ws-nowrap">✹ {{ formatDate(item.date, false, 'MMM YYYY') }}</span>
        <span v-if="item.place" class="ws-nowrap ml-auto">&#10028; {{ item.place }}</span>
        <span
          v-if="category"
          class="category-badge not-italic font-normal font-mono text-xs border border-current border-dashed px-px my-auto cursor-pointer transition-opacity"
          :class="[
            activeCategory === category || hoveredCategory === category ? 'op100 border-solid' : 'op70 hover:op100 hover:border-solid',
            !item.place ? 'ml-auto' : '',
          ]"
          @mouseenter="emit('hover', category ?? null)"
          @mouseleave="emit('hover', null)"
          @click.stop.prevent="onFilter(category)"
        >{{ category }}</span>
      </div>
    </li>
    <div
      v-if="item.desc"
      class="w-full op70 text-sm font-light mt-1 mb-8 leading-snug"
      v-html="item.desc"
    /> <!--  group-hover:op60 transition-opacity -->
  </div>
</template>
