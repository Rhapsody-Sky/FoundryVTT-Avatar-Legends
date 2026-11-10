import test from 'node:test'
import assert from 'node:assert/strict'
import { transformTree, rewriteString, findAssetPaths } from '../migration-module/transform.js'
import { migrateClientPreferences } from '../module/client-migration.js'

const options = { collections: { 'legends.common-items': 'world.avatar-legends-legacy-common-items' },
  assets: { 'systems/legends/images/test.webp': 'worlds/test/avatar-legends-migration/images/test.webp' } }

test('rewrites nested tokens, UUIDs, table collections and flag namespaces without changing prose', () => {
  const before = { text: 'Legends and legends are stories.', tokens: [{ delta: { flags: { legends: { selected: true } },
    system: { text: '@UUID[Compendium.legends.common-items.Item.abc]{Move}' } } }],
    result: 'legends.common-items', img: 'systems/legends/images/test.webp' }
  const after = transformTree(before, options)
  assert.equal(after.text, before.text)
  assert.equal(after.tokens[0].delta.flags['avatar-legends'].selected, true)
  assert.equal(after.tokens[0].delta.flags.legends.selected, true)
  assert.match(after.tokens[0].delta.system.text, /Compendium.world.avatar-legends-legacy-common-items.Item.abc/)
  assert.equal(after.result, options.collections['legends.common-items'])
  assert.equal(after.img, options.assets[before.img])
  assert.deepEqual(transformTree(after, options), after)
  assert.equal(before.tokens[0].delta.flags['avatar-legends'], undefined)
})

test('conflicting flag namespaces fail instead of silently overwriting data', () => {
  assert.throws(() => transformTree({ flags: { legends: { value: 1 }, 'avatar-legends': { value: 2 } } }), /Conflicting/)
})

test('rewrites legacy compendium links and preserves their labels and anchors', () => {
  const before = '@Compendium[legends.common-items.abc#section]{Move} @Compendium[other.common-items.abc]{Other}'
  const after = '@Compendium[world.avatar-legends-legacy-common-items.abc#section]{Move} @Compendium[other.common-items.abc]{Other}'
  assert.equal(rewriteString(before, options), after)
  assert.equal(rewriteString(after, options), after)
})

test('unlinked player tokens retain their own description instead of inheriting the base actor look', () => {
  const scene = { tokens: [{ actorId: 'a', actorLink: false, delta: { system: { description: '<p>Token text</p>' } } }] }
  const result = transformTree(scene, { actorTypes: { a: 'player' } })
  assert.equal(result.tokens[0].delta.system.look, '<p>Token text</p>')
  assert.equal(result.tokens[0].delta.system.legacyDescriptionMigrated, true)
  assert.deepEqual(transformTree(result, { actorTypes: { a: 'player' } }), result)
})

test('updates macro API namespaces, but leaves other package namespaces untouched', () => {
  assert.equal(rewriteString('game.settings.get("legends", "x"); actor.setFlag(\'legends\', "x", 1)'),
    'game.settings.get("avatar-legends", "x"); actor.setFlag(\'avatar-legends\', "x", 1)')
  assert.equal(rewriteString('actor.setFlag("other-module", "x", 1)'), 'actor.setFlag("other-module", "x", 1)')
  assert.equal(rewriteString('legends.LegendsPlayerActorSheetV2'), '')
  assert.equal(rewriteString('game.packs.get("legends.common-items"); actor.flags.legends.x', options),
    'game.packs.get("world.avatar-legends-legacy-common-items"); actor.flags["avatar-legends"].x')
})

test('finds asset paths inside HTML and JSON-encoded settings', () => {
  const value = { html: '<img src="systems/legends/images/test.webp">', setting: JSON.stringify({ img: 'systems/legends/images/test.webp' }) }
  assert.deepEqual([...findAssetPaths(value)], ['systems/legends/images/test.webp'])
  assert.deepEqual([...findAssetPaths({ img: 'systems/legends/my image.webp', html: '<img src="systems/legends/my image.webp">' })],
    ['systems/legends/my image.webp'])
})

test('each browser migrates preferences once without overriding existing new choices', () => {
  const values = new Map([['legends.sheetColour', '"quickstart"'], ['legends.playerNotes', 'true'], ['avatar-legends.playerNotes', 'false']])
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  migrateClientPreferences(storage)
  assert.equal(values.get('avatar-legends.sheetColour'), '"quickstart"')
  assert.equal(values.get('avatar-legends.playerNotes'), 'false')
  values.delete('avatar-legends.sheetColour')
  migrateClientPreferences(storage)
  assert.equal(values.has('avatar-legends.sheetColour'), false)
})
