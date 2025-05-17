<script setup lang="ts">
// function toTop() {
//   window.scrollTo({
//     top: 0,
//     behavior: 'smooth',
//   })
// }

// const { y: scroll } = useWindowScroll()
// import WebringLogo from '/src/assets/logos/webring.icon.white.svg';
</script>

<template>
  <header class="header z-40 position-sticky top-0 backdrop-blur-sm">
    <!-- mask-b-to-50%" -->
    <!-- <button
      title="Scroll to top"
      fixed right-3 bottom-3 w-10 h-10 hover:op100 rounded-full
      hover-bg-hex-8883 transition duration-300 z-100 print:hidden
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button> -->
    <nav class="nav font-mono select-none">
      <div class="left hidden sm:block">
        <RouterLink
          class="w-fit hidden sm:block b-dashed b-1 router-link-exact-active"
          to="/"
          focusable="false"
        >
          <!-- <Logo /> -->
          <span class="hidden sm:block">bodobraegger</span>
          <!-- <span class="sm:hidden">b</span> -->
        </RouterLink>
      </div>
      <!-- <div class="spacer" /> -->
      <div class="right print:op0">
        <RouterLink to="/" title="Home" class="justify-self-start">
          <span>Home</span>
        </RouterLink>
        <RouterLink id="projects" to="/projects" title="Projects" class="justify-self-center">
          <span>Projects</span>
        </RouterLink>
        <RouterLink id="notes" to="/notes" title="Blog" class="justify-self-center">
          <span>Notes</span>
        </RouterLink>
        <!-- <a title="Webring" href="https://webring.xxiivv.com/#bodo" target="_blank" rel="noopener"
        class="select-none b-none! hover:b-none! w-19px h-24px">
          <WebringLogo stroke="var(--fg)" transform="translate(-140, -138) scale(0.08)"/>
        </a>
        <a id="github" class="select-none" href="https://github.com/bodobraegger" target="_blank" title="GitHub">
          <div i-uil-github-alt />
        </a> -->
        <ToggleTheme class="justify-self-end" />
      </div>
    </nav>
  </header>
</template>

<style scoped>
/*
.md-backdrop-blur-custom {
  @media (min-width: 640px) {
    backdrop-filter:
      blur(2px)
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b' x='0' y='0'%3E%3CfeFlood x='4' y='4' height='2' width='2'/%3E%3CfeComposite width='5' height='5'/%3E%3CfeTile result='a'/%3E%3CfeComposite in='SourceGraphic' in2='a' operator='in'/%3E%3CfeMorphology operator='dilate' radius='2'/%3E%3C/filter%3E%3C/svg%3E#b");
  }
}
*/

.header {
  mask-image: linear-gradient(to bottom, var(--c-bg) 50%, transparent 100%);
}

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

.nav img {
  margin-bottom: 0;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.7;
  border: 1px dashed var(--fg-deep);
  padding: 0 2px;
}

.nav a:hover {
  opacity: 1;
  border: 1px solid var(--fg-deeper);
}

.nav a.router-link-active,
.nav a.router-link-exact-active {
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
</style>
