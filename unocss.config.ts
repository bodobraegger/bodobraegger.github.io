import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts, transformerDirectives } from 'unocss'

export default defineConfig({
  preflights: [
    {
      getCSS: () => `
        html {
          font-family: var(--fonts-body);
        }
        .font-phonetics {
          font-size: smaller;
        }
      `,
    },
  ],
  shortcuts: [
    {
      'bg-base': 'bg-white dark:bg-black',
      'border-base': 'border-[#8884]',
    },
    [/^btn-(\w+)$/, ([_, color]) => `op50 px2.5 py1 transition-all duration-200 ease-out no-underline! hover:(op100 text-${color} bg-${color}/10) border border-base! rounded`],
  ],
  rules: [
    [/^slide-enter-(\d+)$/, ([_, n]) => ({
      '--enter-stage': n,
    })],
    /* Stacks are single-sourced as custom properties in styles/main.css */
    ['font-body', { 'font-family': 'var(--fonts-body)', 'font-variation-settings': 'var(--axis-proportional)' }],
    ['font-heading', { 'font-family': 'var(--fonts-heading)', 'font-variation-settings': 'var(--axis-mono)' }],
    ['font-semimono', { 'font-family': 'var(--fonts-semimono)', 'font-variation-settings': 'var(--axis-semimono)' }],
    ['font-serif', { 'font-family': 'var(--fonts-serif)', 'font-variation-settings': 'normal' }],
    ['font-serif-extra', { 'font-family': 'var(--fonts-serif-extra)', 'font-variation-settings': 'normal' }],
    ['font-mono', { 'font-family': 'var(--fonts-mono)', 'font-variation-settings': 'normal' }],
  ],
  presets: [
    presetIcons({
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetAttributify(),
    presetUno(),
    presetWebFonts({
      fonts: {
        phonetics: {
          name: 'Noto Serif',
          weights: [300],
        },
        almendra: {
          name: 'Almendra',
          weights: [400, 700],
          italic: true,
        },
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  safelist: [
    'i-ri-menu-2-fill',
  ],
})
