<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="page-background" />
  <div class="flex flex-col justify-start min-h-screen xl-mx-auto xl:max-w-500">
    <NavBar />
    <main class="px-7 py-10 of-x-hidden">
      <RouterView />
    </main>
    <Footer :key="route.path" />
  </div>
  <Lightbox />
</template>
