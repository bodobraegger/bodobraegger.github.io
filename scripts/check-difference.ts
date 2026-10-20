// Checks the rules of the `texts` prop of DifferenceFrame.
//   pnpm check:difference
import assert from 'node:assert/strict'
import process from 'node:process'
import { replaceTexts } from '../src/lib/difference'
import type { TextBox } from '../src/lib/difference'

const box = (id: string, text: string): TextBox => ({ id, text, x: 0, y: 0, width: 10, height: 10, color: '#000000' })
const boxes = [box('brand', 'RIBON'), box('title', '北海道'), box('flavor', 'Rich Milk')]
const texts = (replacements: Parameters<typeof replaceTexts>[2]) => replaceTexts('check', boxes, replacements).map(box => box.text)

const cases: [string, () => void][] = [
  ['no texts keep the OCR text', () => assert.deepEqual(texts(undefined), ['RIBON', '北海道', 'Rich Milk'])],
  ['an empty string empties every box', () => assert.deepEqual(texts(''), ['', '', ''])],
  ['a list replaces by position and null keeps a box', () => assert.deepEqual(texts(['RIBBON', null]), ['RIBBON', '北海道', 'Rich Milk'])],
  ['an object replaces by id', () => assert.deepEqual(texts({ title: '東京都' }), ['RIBON', '東京都', 'Rich Milk'])],
  ['an unknown id is an error', () => assert.throws(() => texts({ titel: 'x' }), /no text box "titel"/)],
  ['a list longer than the boxes is an error', () => assert.throws(() => texts(['a', 'b', 'c', 'd']), /4 entries/)],
  ['a text that is not empty is an error', () => assert.throws(() => texts('x'), /empty string, a list or an object/)],
]

let failures = 0
for (const [name, check] of cases) {
  try {
    check()
    console.log(`ok    ${name}`)
  }
  catch (error) {
    failures++
    console.error(`FAIL  ${name}\n${error instanceof Error ? error.message : error}`)
  }
}
if (failures)
  process.exit(1)
