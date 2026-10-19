<script setup lang="ts">
// The cover of the Suzuno Financial Holdings brochure on its reference
// screenshot. texts, difference, opacity, a class and a style go on to
// SuzunoFace. src/lib/suzuno/README.md lists the texts.
import SuzunoFace from '~/components/suzuno/SuzunoFace.vue'
import { FINANCIAL_FACE } from '~/lib/suzuno/faces'
</script>

<template>
  <SuzunoFace :face="FINANCIAL_FACE" />
</template>
