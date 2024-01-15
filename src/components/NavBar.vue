<script setup lang="ts">
function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()

var word = "bodobraegger";
var length = word.length;
for (let i = 0; i < length-1; i++) {
  // alert(word.charAt(i));
  word += '<br>'
  word += word.slice(i + 1, length) + word.slice(0, i + 1);
}

console.log(word);

</script>

<template>
  <header class="header z-40">
    <RouterLink
      class="logo-wrap w-12 h-12 absolute xl:fixed m-7 mt-9.2 select-none outline-none font-mono line-height-0.9em font-size-1em"
      to="/"
      focusable="false"
    >
      <!-- <Logo /> -->
      bodobraegger
      <!--
      <pre>
    bodo
 <span class="op-30">gge</span>r
    a<span class="op-30">egger</span>
<span class="op-30">aegg</span>e<span class="op-10">r</span>
    gger
      </pre> -->
    </RouterLink>
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
      <div class="spacer" />
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

.nav > * {
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
