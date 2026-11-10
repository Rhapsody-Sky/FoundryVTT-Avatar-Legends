import test from 'node:test'
import assert from 'node:assert/strict'
import { persistLegacyDescription } from '../module/data/legacy-description.js'

const migrated = { look: '<p>Old text</p>', legacyDescriptionMigrated: true }
test('persists migration fields with an unrelated actor update', () => {
  assert.deepEqual(persistLegacyDescription(migrated, { name: 'Edited' }), {
    name: 'Edited', system: { look: migrated.look, legacyDescriptionMigrated: true },
  })
})
test('preserves an explicit nested empty look update', () => {
  assert.deepEqual(persistLegacyDescription(migrated, { system: { look: '' } }), {
    system: { look: '', legacyDescriptionMigrated: true },
  })
})
test('preserves an explicit flattened empty look update', () => {
  assert.deepEqual(persistLegacyDescription(migrated, { 'system.look': '' }), {
    'system.look': '', system: { legacyDescriptionMigrated: true },
  })
})
test('does not mark fresh characters as migrated', () => {
  const update = { 'system.look': 'New' }
  assert.deepEqual(persistLegacyDescription({ look: '', legacyDescriptionMigrated: false }, update), update)
  assert.equal(Object.hasOwn(update, 'system'), false)
})
