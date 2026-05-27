import { defineConfig, presetIcons, presetUno, presetWebFonts, transformerDirectives } from 'unocss'

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
  ],
  rules: [
    [/^slide-enter-(\d+)$/, ([_, n]) => ({
      '--enter-stage': n,
    })],
    // Font rules reference CSS custom properties defined in main.css
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
