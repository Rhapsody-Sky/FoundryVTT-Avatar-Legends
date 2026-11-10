import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = path => readFileSync(join(root, path), 'utf8')
const manifest = JSON.parse(read('system.json'))
const repo = 'https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends'
assert.equal(manifest.id, 'avatar-legends')
assert.equal(manifest.url, repo)
assert.equal(manifest.manifest, `${repo}/releases/latest/download/system.json`)
assert.equal(manifest.download, `${repo}/releases/download/v${manifest.version}/avatar-legends-v${manifest.version}.zip`)
assert.equal(manifest.compatibility.minimum, '14')
assert.equal(manifest.compatibility.maximum, '14')
assert.match(read('styles/legends.v2.css'), /\.system-avatar-legends\b/)
assert.doesNotMatch(read('styles/legends.v2.css'), /\.system-legends\b/)
const migration = JSON.parse(read('migration-module/module.json'))
assert.equal(migration.id, 'avatar-legends-migration')
assert.equal(migration.relationships.requires[0].id, manifest.id)
assert.equal(migration.relationships.requires[0].manifest, manifest.manifest)
assert.ok(manifest.documentTypes.Actor.player.htmlFields.includes('description'))
for (const path of [...manifest.esmodules, ...manifest.styles, ...manifest.packs.map(p => p.path), ...manifest.languages.map(l => l.path), manifest.license, manifest.readme]) {
  assert.ok(existsSync(join(root, path)), `Missing manifest entry: ${path}`)
}
let jsCount = 0
let jsonCount = 0
function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['.git', 'dist', 'node_modules'].includes(entry.name)) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) { check(path); continue }
    if (/\.(js|mjs)$/.test(entry.name)) {
      execFileSync(process.execPath, ['--check', path], { stdio: 'pipe' })
      jsCount++
      for (const match of readFileSync(path, 'utf8').matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)) {
        assert.ok(existsSync(resolve(dirname(path), match[1])), `Missing import: ${path}: ${match[1]}`)
      }
    }
    if (entry.name.endsWith('.json')) { JSON.parse(readFileSync(path, 'utf8')); jsonCount++ }
  }
}
check(root)
assert.match(read('LICENSE'), /Copyright \(c\) 2022 Paul Cosgrove/)
assert.match(read('LICENSE'), /Copyright \(c\) 2026 Rhapsody/)
assert.match(read('README.md'), /gitlab.com\/pacosgrove1\/legends/)
assert.match(read('module/dialog.v2.js'), /icon: 'fas fa-dice'/)
assert.match(read('module/dialog.v2.js'), /icon: 'fas fa-times'/)
const details = read('templates/sheets/actors/v2/player/details.hbs')
assert.match(details, /target="system.look"/)
assert.doesNotMatch(details, /<label\b[^>]*>(?:(?!<\/label>)[\s\S])*description\.hbs/)
assert.doesNotMatch(read('module/chat.js'), /ui\.notifications\.error\s*=/)
for (const filename of ['module/config.js', 'module/dice.js', 'module/chat.js', 'module/sheets/LegendsPlayerActorSheet.v2.js']) {
  assert.doesNotMatch(read(filename), /systems\/legends\b|['"]legends\.(?:playbooks|common-items|reference|wstag-playbooks)['"]|Compendium\.legends\./)
}
console.log(`Validated manifest, credits, regressions, ${jsCount} JS files and ${jsonCount} JSON files.`)
