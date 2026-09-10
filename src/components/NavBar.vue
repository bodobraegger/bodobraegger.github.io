<script setup lang="ts">
const route = useRoute()

// vite-plugin-pages generates flat routes, so /notes/... is not a child
// record of /notes and vue-router alone never marks the section link active
function isSectionActive(section: string) {
  return route.path === section || route.path.startsWith(`${section}/`)
}
</script>

<template>
  <header class="header z-40 position-sticky top-0 backdrop-blur-sm">
    <nav class="nav font-mono select-none">
      <div class="left hidden sm:block">
        <RouterLink
          class="w-fit block b-dashed b-1 router-link-exact-active"
          to="/"
          focusable="false"
        >
          bodobraegger
        </RouterLink>
      </div>
      <div class="right print:op0">
        <RouterLink to="/" title="Home" class="justify-self-start">
          Home
        </RouterLink>
        <RouterLink
          id="projects"
          to="/projects"
          title="Projects"
          class="justify-self-center"
          :class="{ 'router-link-active': isSectionActive('/projects') }"
        >
          Projects
        </RouterLink>
        <RouterLink
          id="notes"
          to="/notes"
          title="Blog"
          class="justify-self-center"
          :class="{ 'router-link-active': isSectionActive('/notes') }"
        >
          Notes
        </RouterLink>
        <ToggleTheme class="justify-self-end" />
      </div>
    </nav>
  </header>
</template>

<style>
/* TODO:
  - introduce faded noise textures?
*/

.header {
  mask-image: linear-gradient(to bottom, var(--c-bg) 0%, var(--c-bg) 60%, rgba(0, 0, 0, 0.5) 85%, transparent 100%);
  transition:
    backdrop-filter 0.3s ease,
    -webkit-backdrop-filter 0.9s ease,
    mask-image 1s ease;
  /* content will touch the right side of the header nav at 1817px,
     and we have a gap of 1.2em=19.2px, so at 1855.4px, the nav
     spaces around the main content beautifully, no backdrop-filter needed
     */
  @media (min-width: 1817px) {
    & {
      mask-image: unset;
      backdrop-filter: unset;
      -webkit-backdrop-filter: unset;
    }
  }
}

a,
button {
  cursor: pointer;
  text-decoration: none;
  color: var(--fg);
  transition: opacity 0.2s ease;
  opacity: 0.9;
  border: 1px dashed var(--fg-deep);
  padding: 0 2px;

  &:hover {
    opacity: 1;
    border: 1px solid var(--fg-deeper);
    color: var(--fg-deeper);
  }
  &.router-link-active,
  &.router-link-exact-active {
    opacity: 1;
    border: 1px solid var(--fg-deeper);
  }
}

.nav {
  padding: 1.75rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;

  .right {
    display: grid;
    grid-gap: 1.2rem;
    grid-auto-flow: column;
  }
}
</style>
