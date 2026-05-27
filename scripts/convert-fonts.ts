import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import ttf2woff2 from 'ttf2woff2'

const fontsDir = join(import.meta.dirname, '../src/assets/fonts')

const files = readdirSync(fontsDir).filter(f => (extname(f) === '.otf' || extname(f) === '.ttf'))

for (const file of files) {
  const input = readFileSync(join(fontsDir, file))
  const output = ttf2woff2(input)
  const outFile = join(fontsDir, `${basename(file, extname(file))}.woff2`)
  writeFileSync(outFile, output)
  console.log(`✓ ${file} → ${basename(outFile)}`)
}
