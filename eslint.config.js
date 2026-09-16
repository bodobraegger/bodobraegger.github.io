// @ts-check
/* eslint perfectionist/sort-objects: "error" */
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    formatters: true,
  },
  {
    // The code in a note is content, not source. A live coding sketch is
    // written dense on purpose, it is copied out to the hydra editor, and the
    // page runs the text as it stands. No rule may rewrite it.
    ignores: ['pages/**/*.md/**'],
  },
  {
    files: ['pages/**/*.md'],
    rules: {
      // Reaches inside a fenced sketch and takes the blank lines out of it.
      'style/no-multiple-empty-lines': 'off',
    },
  },
  {
    rules: {
      'no-case-declarations': 'off',
      'no-console': 'off',
      'no-eval': 'off',
      'no-labels': 'off',
      'no-lone-blocks': 'off',
      'no-restricted-syntax': 'off',
      'node/prefer-global/buffer': 'off',
      'node/prefer-global/process': 'off',
      'prefer-rest-params': 'off',
      'symbol-description': 'off',
      'ts/ban-ts-comment': 'off',
      'ts/ban-types': 'off',
      'ts/no-invalid-this': 'off',
      'ts/no-unnecessary-type-constraint': 'off',
      'unused-imports/no-unused-vars': 'off',
      'vue/no-parsing-error': [
        'error',
        {
          'invalid-first-character-of-tag-name': false,
        },
      ],
      'vue/no-template-shadow': 'off',
      'vue/no-v-text-v-html-on-component': 'off',
    },
  },
)
