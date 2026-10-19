// Checks the rule of the orchid background: in the vines of a phone window
// and of a desktop window, no blossom comes closer than the gap to another
// blossom of any vine, and no stem of its own vine runs through it.
//   pnpm check:orchid
import process from 'node:process'
import { collisions, vines } from '../src/lib/orchid'

const WINDOWS = [[360, 844], [1410, 900]]
const SEEDS = 10

const point = ([x, y]: number[]) => `${x.toFixed(1)} ${y.toFixed(1)}`
let failures = 0
for (const [width, height] of WINDOWS) {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const begin = performance.now()
    const plants = vines(width, height, seed)
    const time = performance.now() - begin
    const found = plants.flatMap((plant, index) => collisions(plant, {}, plants.slice(0, index)))
    for (const { blossom, other } of found)
      console.error(`${width} x ${height}, seed ${seed}: the blossom at ${point(blossom)} collides with the blossom or stem at ${point(other)}`)
    failures += found.length
    console.log(`${width} x ${height}, seed ${seed}: ${plants.length} vines in ${time.toFixed(0)} ms, ${found.length} collisions`)
  }
}
console.log(failures ? `${failures} collisions` : 'No blossom collides')
if (failures)
  process.exit(1)
