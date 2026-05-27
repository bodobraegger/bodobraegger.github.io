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
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false; emit('hover', null)"
  >
    <component
      :is="isExternal ? 'a' : 'RouterLink'"
      v-bind="isExternal
        ? (item.link && item.link !== '.' ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})
        : { to: href }"
    >
      <li>
        <span class="title">
          {{ item.name }}
          <span v-if="isExternal && item.link && item.link !== '.'" class="i-carbon-arrow-up-right" title="External" />
        </span>
        <span class="meta">
          <span v-if="item.date">✹ {{ formatDate(item.date, false, 'MMM YYYY') }}</span>
          <span v-if="item.place" class="dim">✬ {{ item.place }}</span>
          <span v-if="pagePath" class="dim">✶ {{ viewCount?.toString().padStart(3, '0') }} views</span>
          <span
            v-if="category"
            class="tag"
            :class="{ active: activeCategory === category || hoveredCategory === category }"
            @mouseenter="emit('hover', category ?? null)"
            @mouseleave.stop="emit('hover', null)"
            @click.stop.prevent="emit('filter', category)"
          >{{ category }}</span>
        </span>
      </li>
    </component>
    <p v-if="item.desc" class="desc" v-html="item.desc" />
  </div>
</template>
