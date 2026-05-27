<script setup lang="ts">
const { copy: _copy, copied } = useClipboard()
const el = ref<HTMLElement | null>(null)

function copy() {
  _copy((el.value?.textContent || '').trim())
}
</script>

<template>
  <div ref="el" class="gap-1 items-center">
    <slot />
    <button
      title="Copy" class="inline ml-2 op-25 hover:op-100 text-meta transition"
      :class="copied ? 'i-carbon-checkmark text-green' : 'i-carbon-copy'" @click="copy()"
    />
  </div>
</template>
