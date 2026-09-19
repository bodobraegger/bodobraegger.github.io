<script setup lang='ts'>
// The name across the top, with the trade and what it is for on the two lines
// below it. Each line spans the whole column.
const HEADLINE = 'Braegger'
const SUBLINE = 'hard- and software'
const TAIL = 'for research, industry and the arts'

/**
 * The same number for the same seed on every render, so the server and the
 * browser draw the line alike and a rebuild writes the same page.
 */
function random(seed: number) {
  const value = Math.sin(seed * 12.9898) * 64756.5453
  return value - Math.floor(value)
}

function between(seed: number, low: number, high: number) {
  return low + random(seed) * (high - low)
}

/**
 * Two ends of a range that are far apart, in an order the seed decides. A pair
 * drawn at random can land close together, and a letter that travels a short
 * way reads as standing still beside one that travels the whole axis.
 */
function swing(seed: number, low: number, high: number): [number, number] {
  const reach = (high - low) / 4
  const near = between(seed, low, low + reach)
  const far = between(seed + 0.5, high - reach, high)
  return random(seed + 0.25) > 0.5 ? [near, far] : [far, near]
}

/** The curves a letter can travel on, from a slow breath to a hard snap. */
const DRIFT_CURVES = [
  'ease-in-out',
  'cubic-bezier(0.9, 0, 0.1, 1)',
  'steps(4, end)',
  'cubic-bezier(0.34, 1.56, 0.64, 1)',
]

/**
 * One letter of the tagline, with the two points of the axes it travels
 * between, the time it takes and the curve it takes it on. Nothing is shared
 * between two letters: each starts somewhere else, leans its own way and moves
 * at its own speed.
 *
 * The slnt axis of ABC Areal only leans to the right, so the lean of a letter
 * is split: as far as the axis reaches it is cut, and the rest, along with
 * every lean to the left, is a skew. A skew is drawn rather than cut, but
 * beside the others at this size it reads.
 */
function letterStyle(position: number) {
  const seed = position * 7 + 1
  const [monoFrom, monoTo] = swing(seed, 0, 100)
  const [weightFrom, weightTo] = swing(seed + 2, 400, 700)
  const [leanFrom, leanTo] = swing(seed + 4, -26, 18)

  return {
    '--mono-from': `${Math.round(monoFrom)}`,
    '--mono-to': `${Math.round(monoTo)}`,
    '--weight-from': `${Math.round(weightFrom)}`,
    '--weight-to': `${Math.round(weightTo)}`,
    '--slant-from': `${Math.max(Math.min(leanFrom, 0), -12).toFixed(1)}`,
    '--slant-to': `${Math.max(Math.min(leanTo, 0), -12).toFixed(1)}`,
    '--skew-from': `${(-Math.min(leanFrom + 20, 0) + Math.max(leanFrom, 0)).toFixed(1)}deg`,
    '--skew-to': `${(-Math.min(leanTo + 20, 0) + Math.max(leanTo, 0)).toFixed(1)}deg`,
    '--drift-time': `${between(seed + 6, 0.9, 11).toFixed(2)}s`,
    // A negative delay starts a letter part way through, so no two of them
    // begin together.
    '--drift-offset': `-${between(seed + 7, 0, 12).toFixed(2)}s`,
    '--drift-curve': DRIFT_CURVES[Math.floor(random(seed + 8) * DRIFT_CURVES.length)],
  }
}

// A space of its own collapses between two inline letters, so it is set as a
// space that does not break.
const TAIL_LETTERS = [...TAIL].map((letter, position) => ({
  letter: letter === ' ' ? '\u00A0' : letter,
  style: letterStyle(position),
}))
</script>

<template>
  <section class="plaque">
    <h1 class="masthead">
      <span class="headline font-body">{{ HEADLINE }}</span>
      <span class="subline font-serif">{{ SUBLINE }}</span>
      <span class="tail font-body">
        <!-- A copy at the widest point of the axes holds the width of the
             line, so the wave below changes no layout. -->
        <span class="tail-sizer" aria-hidden="true">{{ TAIL }}</span>
        <span class="tail-wave">
          <span
            v-for="(entry, position) in TAIL_LETTERS"
            :key="position"
            class="tail-letter"
            :style="entry.style"
          >{{ entry.letter }}</span>
        </span>
      </span>
    </h1>
  </section>
</template>

<style scoped>
/* Every size below is in cqw, so the masthead follows the width of the column
   and keeps its shape on a phone and on a wide screen. */
.plaque {
  container-type: inline-size;
  margin-bottom: 3rem;
  filter: var(--xerox);
}

.masthead {
  display: block;
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

.subline {
  display: block;
  margin-top: 1.2cqw;
  font-size: 8.56cqw;
  line-height: 0.95;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* The letters are held apart so the short line spans the column. */
.tail {
  display: block;
  position: relative;
  margin-top: 0.8cqw;
  font-size: 3.6cqw;
  line-height: 1.1;
  letter-spacing: 0.187em;
  opacity: 0.8;
  white-space: nowrap;
}

.tail-sizer {
  visibility: hidden;
  font-variation-settings:
    'MONO' 100,
    'wght' 700;
}

/* Bound to the left edge of the fixed box, so the line starts flush with the
   lines above it while the wave changes the width of the letters. */
.tail-wave {
  position: absolute;
  left: 0;
  top: 0;
}

/* Every letter drifts between two points of its own on the MONO, wght and
   slnt axes, over a time of its own, from a start of its own. Nothing about
   the line moves together. */
.tail-letter {
  display: inline-block;
  animation: areal-drift var(--drift-time) var(--drift-curve) infinite alternate;
  animation-delay: var(--drift-offset);
}

@keyframes areal-drift {
  from {
    font-variation-settings:
      'MONO' var(--mono-from),
      'wght' var(--weight-from),
      'slnt' var(--slant-from);
    transform: skewX(var(--skew-from));
  }

  to {
    font-variation-settings:
      'MONO' var(--mono-to),
      'wght' var(--weight-to),
      'slnt' var(--slant-to);
    transform: skewX(var(--skew-to));
  }
}

@media (prefers-reduced-motion: reduce) {
  .tail-letter {
    animation: none;
  }
}
</style>
