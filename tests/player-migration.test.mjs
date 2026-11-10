import test from 'node:test'
import assert from 'node:assert/strict'

// Exercise the actual model migration without launching or writing a Foundry world.
// This is deliberately not a replacement for an in-Foundry schema/UI smoke test.
class Field { constructor(options = {}) { this.options = options } }
globalThis.foundry = {
  abstract: { TypeDataModel: class { static migrateData(source) { return source } } },
  data: { fields: Object.fromEntries(['StringField', 'NumberField', 'SchemaField', 'ArrayField', 'BooleanField', 'HTMLField'].map(k => [k, Field])) },
}
const { default: Player } = await import('../module/data/player_model.js')

for (const look of [undefined, null, '', '  ']) {
  test(`copies old description into empty look (${String(look)})`, () => {
    const source = { description: '<p>A traveller &amp; friend.</p>', look, notes: 'Keep notes' }
    assert.equal(Player.migrateData(source), source)
    assert.equal(source.look, source.description)
    assert.equal(source.notes, 'Keep notes')
    assert.equal(source.legacyDescriptionMigrated, true)
  })
}
test('retains both texts when look is already populated', () => {
  const source = { description: '<p>Old text</p>', look: '<p>New text</p>' }
  Player.migrateData(source)
  assert.equal(source.look, '<p>New text</p>')
  assert.equal(source.description, '<p>Old text</p>')
})
test('does not overwrite an image-only HTML description', () => {
  const source = { description: 'Old', look: '<p><img src="portrait.webp"></p>' }
  Player.migrateData(source)
  assert.equal(source.look, '<p><img src="portrait.webp"></p>')
})
test('migration is idempotent and respects a later intentional clear', () => {
  const source = { description: '<p>Legacy</p>' }
  Player.migrateData(source)
  const snapshot = structuredClone(source)
  assert.deepEqual(Player.migrateData(source), snapshot)
  source.look = ''
  assert.equal(Player.migrateData(source).look, '')
  assert.equal(source.description, '<p>Legacy</p>')
})
test('new V2 characters and empty legacy fields remain unchanged', () => {
  for (const source of [{ look: 'New' }, {}, { description: '' }, { description: null }, { description: 42 }]) {
    const expected = structuredClone(source)
    assert.deepEqual(Player.migrateData(source), expected)
  }
})
test('legacy content and migration marker remain in the schema', () => {
  const schema = Player.defineSchema()
  assert.ok(schema.description instanceof Field)
  assert.ok(schema.look instanceof Field)
  assert.equal(schema.legacyDescriptionMigrated.options.initial, false)
})
