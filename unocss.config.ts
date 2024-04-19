import { defineConfig, presetAttributify, presetIcons, presetUno, presetWebFonts, transformerDirectives } from 'unocss'

export default defineConfig({
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
    ['font-sans', {'font-family': 'ModernGothic, Inter,Helvetica,"Helvetica Neue",Arial,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans",sans-serif'}],
    ['font-mono', {'font-family': 'ModernGothicMono, ui-monospace,"Fragment Mono","Fira Code","SF Mono","Cascadia",monospace'}],
    
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
    // presetWebFonts({
    //   fonts: {
    //     sans: 'Inter:400,600,800',
    //     mono: 'Fira Code:400,600',
    //     // sans: 'Fragment Mono:400',
    //   },
    // }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  safelist: [
    'i-ri-menu-2-fill',
  ],
})
