<script setup lang='ts'>
import DrawablePen from '~/components/DrawablePen.vue'

// The name across the top, then the given name on the left of the line below
// it, with the trade and what it is for stacked against the right edge.
const HEADLINE = 'Braegger'
const GIVEN_NAME = 'Bodo'
const SUBLINE = 'hard- and software'
const TAIL = 'for research, industry and the arts'

// A space of its own collapses between two inline letters, so it is set as a
// space that does not break.
const TAIL_LETTERS = [...TAIL].map(letter => (letter === ' ' ? '\u00A0' : letter))

// Seconds of phase between one letter and the next. Negative, so a letter
// starts further into the cycle than the letter before it and the wave reads
// as travelling from left to right.
const LETTER_PHASE = -0.11
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
            <span class="tail font-body">
              <!-- A copy at the widest point of the axes holds the width of
                   the line, so the wave below changes no layout. -->
              <span class="tail-sizer" aria-hidden="true">{{ TAIL }}</span>
              <span class="tail-wave">
                <span
                  v-for="(letter, position) in TAIL_LETTERS"
                  :key="position"
                  class="tail-letter"
                  :style="{ animationDelay: `${position * LETTER_PHASE}s` }"
                >{{ letter }}</span>
              </span>
            </span>
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
  position: relative;
  font-size: 3.2cqw;
  line-height: 1.1;
  opacity: 0.8;
  white-space: nowrap;
}

.tail-sizer {
  visibility: hidden;
  font-variation-settings:
    'MONO' 100,
    'wght' 700;
}

/* Bound to the right edge of the fixed box, so the line stays flush with the
   trade above it while the wave changes the width of the letters. */
.tail-wave {
  position: absolute;
  right: 0;
  top: 0;
}

/* Each letter travels the whole family: from the proportional cut to the mono
   one, from regular to bold, and from upright to the full slant. The delay on
   each letter is a step of phase, so the line reads as one wave passing along
   it rather than every letter moving together. */
.tail-letter {
  display: inline-block;
  animation: areal-wave 4.4s ease-in-out infinite;
}

@keyframes areal-wave {
  0%,
  100% {
    font-variation-settings:
      'MONO' 0,
      'wght' 400,
      'slnt' 0;
  }

  50% {
    font-variation-settings:
      'MONO' 100,
      'wght' 700,
      'slnt' -12;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tail-letter {
    animation: none;
  }
}
</style>
