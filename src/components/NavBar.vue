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
          class="logo-wrap select-none outline-none font-mono"
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
        <RouterLink to="/" title="Home">
          <span>Home</span>
        </RouterLink>
        <RouterLink to="/projects" title="Projects">
          <span>Projects</span>
        </RouterLink>
        <RouterLink to="/notes" title="Blog">
          <span>Notes</span>
        </RouterLink>
        <a href="https://github.com/bodobraegger" target="_blank" title="GitHub">
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
  font-family: Courier New, monospace;
  /* border-bottom: 1px solid rgba(125, 125, 125, 0.3); */
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav a.router-link-active {
  opacity: 1;
  text-decoration: wavy underline;
  text-decoration-skip-ink: none;
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
