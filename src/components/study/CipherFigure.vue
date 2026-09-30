<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <StudyFigure :title="title" class="cipher-figure">
    <slot />
  </StudyFigure>
</template>

<!-- Not scoped: the cipher figures share the text fields and the three
     colours of plaintext, keystream and result. -->
<style>
.cipher-figure {
  --cipher-plain: var(--study-accent);
  --cipher-key: light-dark(#a15c07, #f0b43c);
  --cipher-result: var(--study-alert);
  --cipher-plain-soft: var(--study-mark);
  --cipher-key-soft: color-mix(in srgb, var(--cipher-key) 18%, transparent);
  --cipher-result-soft: var(--study-alert-mark);

  min-width: 0;
  overflow-wrap: anywhere;
}

/* The paragraph reset of .study-figure outranks its own spacing rule, so the
   spacing is repeated here with a selector that wins. */
.cipher-figure.study-figure > * + * {
  margin-top: 0.9rem;
}

.cipher-muted {
  color: var(--fg-muted);
}

.cipher-plain {
  color: var(--cipher-plain);
}

.cipher-key {
  color: var(--cipher-key);
}

.cipher-result,
.cipher-error {
  color: var(--cipher-result);
}

.cipher-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
}

.cipher-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1 1 9rem;
  min-width: 0;
  font-size: 0.85rem;
  color: var(--fg-muted);
}

.cipher-figure input[type='text'],
.cipher-figure textarea {
  width: 100%;
  min-height: 2.5rem;
  padding: 0.35rem 0.5rem;
  border: 1px dashed var(--fg-deep);
  border-radius: 0;
  background: transparent;
  color: var(--fg-deep);
  font-family: var(--fonts-mono);
  font-size: 1rem;
  opacity: 0.85;

  &:focus {
    opacity: 1;
    border-color: var(--fg-deeper);
    outline: none;
  }
}

.cipher-figure textarea {
  min-height: 4.5rem;
  resize: vertical;
  field-sizing: content;
}

.cipher-figure input[type='range'] {
  width: 100%;
  min-height: 2.5rem;
  accent-color: var(--fg-deep);
}

.cipher-formula {
  padding: 0.5rem 0.6rem;
  border-left: 2px solid var(--c-border);
  font-family: var(--fonts-mono);
  white-space: pre;
  overflow-x: auto;
}

.cipher-scroll {
  max-width: 100%;
  overflow-x: auto;
}
</style>
