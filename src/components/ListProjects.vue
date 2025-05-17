<script setup lang="ts">
defineProps<{ projects: Record<string, any[]> }>()

function slug(name: string) {
  return name.toLowerCase().replace(/[\s\\/]+/g, '-')
}

function prependLocalLink(link: string) {
  return (link.startsWith('http') || link.startsWith('/')) ? link : `/projects/${link}`
}
</script>

<template>
  <div class="prose m-auto max-w-300">
    <div
      v-for="key, in Object.keys(projects)" :key="key"
    >
      <h4 :id="slug(key)" class="mt-15 mb-2 font-medium op90">
        {{ key }}
      </h4>
      <div
        class="project-grid py-2 max-w-500 w-max"
        grid="~ cols-1 md:cols-2 gap-4"
        :class="projects[key].length === 1 ? 'flex' : projects[key].length > 2 ? 'lg:grid-cols-3' : ''"
      >
        <a
          v-for="item, idx in projects[key]"
          :key="idx"
          class="item relative flex"
          :href="prependLocalLink(item.link)"
          target="_blank"
          :class="!item.link ? 'opacity-0 pointer-events-none h-0 -mt-8 -mb-4' : ''"
          :title="item.name"
        >
          <!-- <div v-if="item.icon" class="pt-2 pr-5">
            <Logo v-if="item.icon === 'monogram'" class="text-4xl opacity-50" />
            <div v-else class="text-3xl opacity-50" :class="item.icon || 'i-carbon-unknown'" />
          </div> -->
          <div class="flex-auto b-1 p-2 b-dashed hover:b-solid">
            <div class="text-normal">{{ item.name }}</div>
            <div class="desc text-sm font-light opacity-75 font-normal prose" v-html="item.desc" />
          </div>
        </a>
      </div>
    </div>
    <!-- <div class="prose pb5 mx-auto mt10 text-center">
      <p op75>
        <em>
          Thanks for your interest in my work! If you are feeling charitable, please consider
          &nbsp;<a
            href="https://github.com/sponsors/bodobraegger"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >sponsoring me</a>&nbsp; to keep my work sustainable. Thank you!
        </em>
      </p>

      <SponsorButton />
    </div> -->
  </div>
  <div>
    <div class="table-of-contents">
      <div class="table-of-contents-anchor">
        <div class="i-ri-menu-2-fill" />
      </div>
      <ul>
        <li v-for="key of Object.keys(projects)" :key="key">
          <a :href="`#${slug(key)}`">{{ key }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.project-grid a.item {
  background: transparent;
  font-size: 1.1rem;
  width: 350px;
  max-width: 100%;
  padding: 0.5rem 0.875rem 0.875rem;
  border-radius: 6px;
}

.project-grid a.item:hover {
  background: #88888811;
}
</style>
