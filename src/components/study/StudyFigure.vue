<script setup lang="ts">
import type { Language } from '~/logics/languages'
import { usePageLanguage } from '~/composables/usePageLanguage'

const { unsupported = false } = defineProps<{
  title: string
  /** True when the browser lacks an API the figure needs, see useWebCrypto. */
  unsupported?: boolean
}>()

const UNSUPPORTED_TEXT: Record<Language, string> = {
  en: 'This browser has no WebCrypto API, so it cannot show this figure.',
  pt: 'Este navegador não tem a API WebCrypto, então não mostra esta figura.',
}

const unsupportedText = UNSUPPORTED_TEXT[usePageLanguage()]
</script>

<template>
  <figure class="study-figure" data-no-epub>
    <figcaption class="study-figure-title">
      {{ title }}
    </figcaption>
    <p v-if="unsupported" class="study-alert">
      {{ unsupportedText }}
    </p>
    <slot />
  </figure>
</template>

<!-- Not scoped: the figures of the study guide share these classes. -->
<style>
.study-figure {
  --study-accent: light-dark(#1d4ed8, #7ea6ff);
  --study-alert: light-dark(#dc2626, #ff7a7a);
  --study-success: light-dark(#15803d, #5fd48a);
  --study-mark: color-mix(in srgb, var(--study-accent) 18%, transparent);
  --study-alert-mark: color-mix(in srgb, var(--study-alert) 18%, transparent);
  --study-byte-gap: 0.4rem;

  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin: 2em 0;
  padding: 1rem;
  border: 1px dashed var(--c-border);
  font-size: 0.9rem;
  line-height: 1.45;

  p {
    margin: 0;
  }
}

.study-figure-title {
  margin: 0;
  font-family: var(--fonts-mono);
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

.study-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.study-button {
  min-height: 2.5rem;
  padding: 0.35rem 0.8rem;
  border: 1px dashed var(--fg);
  font-family: var(--fonts-semimono);
  font-variation-settings: var(--axis-semimono);
  color: var(--fg);
  background: transparent;
  cursor: pointer;
  opacity: 0.8;
  transition:
    opacity 0.2s,
    border-color 0.2s;

  &:hover:not(:disabled) {
    opacity: 1;
    border: 1px solid var(--fg-deeper);
    color: var(--fg-deeper);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  &[aria-pressed='true'] {
    opacity: 1;
    border-style: solid;
    color: var(--fg-deeper);
  }
}

.study-mono {
  font-family: var(--fonts-mono);
  font-variant-numeric: tabular-nums;
}

.study-label {
  font-size: 0.75rem;
  color: var(--fg-muted);
}

.study-bits {
  display: inline-flex;
  flex-wrap: wrap;
  font-family: var(--fonts-mono);
}

/* Sixteen bits per row: two bytes with a gap column between them. The rule
   on the ninth bit of each row steps over the gap column; auto placement
   then continues after it and wraps the seventeenth bit to the next row. */
.study-bit-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr)) var(--study-byte-gap) repeat(8, minmax(0, 1fr));
  row-gap: 0.3rem;
  font-family: var(--fonts-mono);

  > :nth-child(16n + 9) {
    grid-column-start: 10;
  }

  > .study-bit {
    width: auto;
  }
}

.study-bit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.15rem;
  height: 1.5rem;
  border: 1px solid var(--c-border-soft);
  color: var(--fg-deep);
  transition:
    background-color 0.3s,
    color 0.3s;

  &.is-marked {
    background: var(--study-mark);
    border-color: var(--study-accent);
    color: var(--study-accent);
  }

  &.is-alert {
    background: var(--study-alert-mark);
    border-color: var(--study-alert);
    color: var(--study-alert);
  }

  &.is-faded {
    opacity: 0.35;
  }
}

/* The bits of one byte share their side borders, and only the bytes have a
   gap. A coloured box is raised, so its border is not hidden by the next box. */
.study-bit + .study-bit:not(:nth-child(8n + 1)) {
  margin-left: -1px;
}

.study-bits > .study-bit:nth-child(8n):not(:last-child) {
  margin-right: var(--study-byte-gap);
}

.study-bit.is-marked,
.study-bit.is-alert {
  position: relative;
  z-index: 1;
}

.study-success {
  color: var(--study-success);
}

.study-alert {
  color: var(--study-alert);
}

@media (max-width: 480px) {
  .study-figure {
    padding: 0.75rem;
  }

  .study-bit {
    width: 0.95rem;
    height: 1.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .study-figure * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
