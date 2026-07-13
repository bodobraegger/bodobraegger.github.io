import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts, transformerDirectives } from 'unocss'

export default defineConfig({
  preflights: [
    {
      getCSS: () => `
        html {
          font-family: var(--fonts-serif);
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
    ['font-sans', { 'font-family': 'var(--fonts-sans)' }],
    ['font-serif', { 'font-family': 'var(--fonts-serif)' }],
    ['font-serif-extra', { 'font-family': 'var(--fonts-serif-extra)' }],
    ['font-mono', { 'font-family': 'var(--fonts-mono)' }],
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
