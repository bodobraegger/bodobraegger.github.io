<script setup lang='ts'>
import DrawablePen from '~/components/DrawablePen.vue'

// The name across the top, then the given name on the left of the line below
// it, with the trade and what it is for stacked against the right edge.
const HEADLINE = 'Braegger'
const GIVEN_NAME = 'Bodo'
const SUBLINE = 'hard- and software'
const TAIL = 'for research, industry and the arts'
</script>

<template>
  <section class="home-hero">
    <h1 class="masthead">
      <span class="headline font-body">{{ HEADLINE }}</span>
      <span class="second-line">
        <span class="given-name font-serif-extra font-italic">{{ GIVEN_NAME }}</span>
        <span class="trade">
          <span class="subline font-serif">{{ SUBLINE }}</span>
          <span class="tail-line">
            <span class="tail font-serif-extra font-italic">{{ TAIL }}</span>
            <DrawablePen drag-and-draw />
          </span>
        </span>
      </span>
    </h1>
  </section>
</template>

<style scoped>
/* Every size below is in cqw, so the masthead follows the width of the column
   and keeps its shape on a phone and on a wide screen. */
.home-hero {
  container-type: inline-size;
  margin-bottom: 3rem;
}

.masthead {
  display: grid;
  margin: 0;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--fg-deeper);
  font-weight: normal;
  line-height: 1;
  color: var(--fg-deeper);
}

/* The name spans the column at the heaviest weight of ABC Areal, set tight
   so the letters read as one block. */
.headline {
  display: block;
  font-size: 18.5cqw;
  font-weight: 700;
  line-height: 0.82;
  letter-spacing: -0.045em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* The given name holds the left edge and the trade the right. Both end on the
   same line, so the two stacked lines of the trade rise beside the one tall
   line of the given name. */
.second-line {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0 3cqw;
  margin-top: 1.2cqw;
}

/* Filled with the colour of the page and edged in the colour of the text, so
   the given name reads as an outline against the solid name above it. */
.given-name {
  font-size: 11cqw;
  line-height: 0.9;
  color: var(--c-bg);
  -webkit-text-stroke: 0.025em var(--fg-deeper);
  paint-order: stroke fill;
}

.trade {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.subline {
  /* Sized so the given name, the gap and the trade together span the column. */
  font-size: 5.6cqw;
  line-height: 0.95;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* The pen sits at the right end of the line it belongs to. */
.tail-line {
  display: flex;
  align-items: center;
  gap: 0 1.4cqw;
  margin-top: 0.6cqw;
}

.tail {
  font-size: 3.2cqw;
  line-height: 1.1;
  opacity: 0.8;
  white-space: nowrap;
}
</style>
