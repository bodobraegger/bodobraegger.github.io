// Checks the rules of the options of DifferenceFrame and of the Suzuno faces.
//   pnpm check:difference
import assert from 'node:assert/strict'
import process from 'node:process'
import { isOn, mergeTexts, opacityOption, replaceTexts } from '../src/lib/difference'
import type { TextBox } from '../src/lib/difference'

const box = (id: string, text: string): TextBox => ({ id, text, x: 0, y: 0, width: 10, height: 10, color: '#000000' })
const boxes = [box('brand', 'RIBON'), box('title', '北海道'), box('flavor', 'Rich Milk')]
const texts = (replacements: Parameters<typeof replaceTexts>[1]) => replaceTexts(boxes, replacements).map(box => box.text)
const stamp = { stamp: { top: 'Rich Milk', middle: '濃厚ミルク' }, badges: [['オリゴ糖配合!']] }

const cases: [string, () => void][] = [
  ['no texts keep the OCR text', () => assert.deepEqual(texts(undefined), ['RIBON', '北海道', 'Rich Milk'])],
  ['an empty string empties every box', () => assert.deepEqual(texts(''), ['', '', ''])],
  ['a list replaces by position and null keeps a box', () => assert.deepEqual(texts(['RIBBON', null]), ['RIBBON', '北海道', 'Rich Milk'])],
  ['an object replaces by id', () => assert.deepEqual(texts({ title: '東京都' }), ['RIBON', '東京都', 'Rich Milk'])],
  ['an unknown id is an error', () => assert.throws(() => texts({ titel: 'x' }), /no text texts\.titel/)],
  ['a list longer than the boxes is an error', () => assert.throws(() => texts(['a', 'b', 'c', 'd']), /4 entries/)],
  ['a text that is not empty is an error', () => assert.throws(() => texts('x'), /texts="" for no texts/)],
  ['objects merge key by key', () => assert.deepEqual(mergeTexts(stamp, { stamp: { middle: '抹茶' } }), { ...stamp, stamp: { top: 'Rich Milk', middle: '抹茶' } })],
  ['a list replaces the default as a whole', () => assert.deepEqual(mergeTexts(stamp, { badges: [] }).badges, [])],
  ['an unknown nested key is an error', () => assert.throws(() => mergeTexts(stamp, { stamp: { bottom: 'x' } }), /no text texts\.stamp\.bottom/)],
  ['"off" and "0" switch the difference off', () => assert.deepEqual(['off', '0', 'false', false, 'true', true].map(isOn), [false, false, false, false, true, true])],
  ['the opacity takes percentages and has a default per mode', () => assert.deepEqual([opacityOption('30%', true), opacityOption(undefined, true), opacityOption(undefined, false)], [0.3, 1, 0.5])],
  ['an opacity out of range is an error', () => assert.throws(() => opacityOption('half', false), /from 0 to 100/)],
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
