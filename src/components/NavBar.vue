<script setup lang="ts">
function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()
import WebringLogo from '/src/assets/logos/webring.icon.white.svg';

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
        <!-- <a title="Webring" href="https://webring.xxiivv.com/#bodo" target="_blank" rel="noopener" 
        class="select-none b-none! hover:b-none! w-19px h-24px">
          <WebringLogo stroke="var(--fg)" transform="translate(-140, -138) scale(0.08)"/>
        </a> -->
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
  outline: none;
  border: none;
}

.nav a:not(.select-none) {
  border: 1px dashed var(--fg-deep);
}

.nav a:not(.select-none):hover {
  border: 1px solid var(--fg-deeper);
}

.nav a.router-link-active, .nav a.router-link-exact-active {
  opacity: 1;
  /* text-decoration: wavy underline; */
  /* text-decoration-skip-ink: none; */
  border: 1px solid var(--fg-deeper);
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}

.nav:has(a:hover) .right a:not(:hover) {
  opacity: 0.6;
}

</style>
