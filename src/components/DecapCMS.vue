<script setup lang='ts'>
import { useScriptTag } from '@vueuse/core';

const script = useScriptTag(
  'https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js',
  () => {
    console.log('decap-cms loaded');
  });
</script>
