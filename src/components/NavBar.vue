<script setup lang="ts">
function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()

</script>

<template>
  <header class="header z-40">
    <button
      title="Scroll to top"
      fixed right-3 bottom-3 w-10 h-10 hover:op100 rounded-full
      hover-bg-hex-8883 transition duration-300 z-100 print:hidden
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>
    <nav class="nav">
      <div class="left">
        <RouterLink
          class="select-none outline-none font-mono w-fit hidden sm:block b-dashed b-1 router-link-exact-active"
          to="/"
          focusable="false"
        >
          <!-- <Logo /> -->
          <span class="hidden sm:block">bodobraegger</span>
            <!-- <span class="sm:hidden">b</span> -->
        </RouterLink>
      </div>
      <!-- <div class="spacer" /> -->
      <div class="right" print:op0>
        <RouterLink class="font-mono" to="/" title="Home">
          <span>Home</span>
        </RouterLink>
        <RouterLink id="projects" class="font-mono" to="/projects" title="Projects">
          <span>Projects</span>
        </RouterLink>
        <RouterLink id="notes" class="font-mono" to="/notes" title="Blog">
          <span>Notes</span>
        </RouterLink>
        <a id="github" class="select-none" href="https://github.com/bodobraegger" target="_blank" title="GitHub">
          <div i-uil-github-alt />
        </a>
        <ToggleTheme />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header h1 {
  margin-bottom: 0;
}

.logo-wrap.router-link-active {
  display: none;
}

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.nav {
  padding: 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;
  --fg: rgba(201, 201, 201, 0.4);
  --fg-deep: rgba(201, 201, 201, 0.7);
  --fg-deeper: rgba(201, 201, 201, 1);
}

.nav > *:not(:first-child) {
  margin: auto;
}

.nav img {
  margin-bottom: 0;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.nav a:not(.select-none) {
  border: 1px dashed var(--fg-deep);
}

.nav a:hover {
  opacity: 1;
  border-style: solid !important;
  text-decoration-color: inherit;
}

.nav a.router-link-active, .nav a.router-link-exact-active {
  opacity: 1;
  /* text-decoration: wavy underline; */
  /* text-decoration-skip-ink: none; */
  border: 1px dashed var(--fg-deeper);
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}
</style>
