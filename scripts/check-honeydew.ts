// Checks the rule of the honeydew background: in the candy snakes of a phone
// window and of a desktop window, no packet covers a packet of another snake
// or a packet of its own snake other than its neighbours.
//   pnpm check:honeydew
import process from 'node:process'
import { candySnakes, overlappingPieces } from '../src/lib/honeydew'

const WINDOWS = [[360, 844], [1410, 900]]
const SEEDS = 10

const point = ({ x, y }: { x: number, y: number }) => `${x.toFixed(1)} ${y.toFixed(1)}`
let failures = 0
for (const [width, height] of WINDOWS) {
  for (let seed = 1; seed <= SEEDS; seed++) {
    const begin = performance.now()
    const snakes = candySnakes(width, height, seed)
    const time = performance.now() - begin
    const found = overlappingPieces(snakes)
    for (const [a, b] of found)
      console.error(`${width} x ${height}, seed ${seed}: the packet at ${point(a)} covers the packet at ${point(b)}`)
    failures += found.length
    const pieces = snakes.reduce((sum, snake) => sum + snake.pieces.length, 0)
    console.log(`${width} x ${height}, seed ${seed}: ${snakes.length} snakes, ${pieces} pieces in ${time.toFixed(0)} ms, ${found.length} overlaps`)
  }
}
console.log(failures ? `${failures} overlaps` : 'No packet covers another')
if (failures)
  process.exit(1)
