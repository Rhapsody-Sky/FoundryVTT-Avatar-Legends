import { ClassicLevel } from 'classic-level'
import { readFileSync, mkdirSync, cpSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { transformTree } from '../migration-module/transform.js'

const [source, destination] = process.argv.slice(2)
const manifest = JSON.parse(readFileSync(join(source, 'system.json'), 'utf8'))
const collections = Object.fromEntries(manifest.packs.map(p => [`legends.${p.name}`, `avatar-legends.${p.name}`]))
for (const pack of manifest.packs) {
  const scratch = mkdtempSync(join(tmpdir(), 'avatar-pack-source-'))
  cpSync(join(source, pack.path), scratch, { recursive: true })
  const input = new ClassicLevel(scratch, { valueEncoding: 'json', createIfMissing: false })
  mkdirSync(join(destination, pack.path), { recursive: true })
  const output = new ClassicLevel(join(destination, pack.path), { valueEncoding: 'json' })
  try {
    const entries = await input.iterator().all()
    for (const [key, value] of entries) {
      const transformed = transformTree(value, { collections })
      const data = JSON.parse(JSON.stringify(transformed).replaceAll('systems/legends/', 'systems/avatar-legends/'))
      await output.put(key, data)
    }
    if ((await output.iterator().all()).length !== entries.length) throw new Error(`Pack conversion failed: ${pack.name}`)
  } finally { await input.close(); await output.close(); rmSync(scratch, { recursive: true }) }
}
