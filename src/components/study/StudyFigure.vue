<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <figure class="study-figure" data-no-epub>
    <figcaption class="study-figure-title">
      {{ title }}
    </figcaption>
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
  gap: 2px;
  font-family: var(--fonts-mono);
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

  .study-bits {
    gap: 1px;
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
