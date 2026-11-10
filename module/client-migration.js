// Client preferences live in each browser, so every player performs this once.
export function migrateClientPreferences(storage) {
  if (storage.getItem('avatar-legends.clientPreferencesMigrated')) return
  for (const key of ['sheetColour', 'playerNotes', 'archiveMessageDisplayed']) {
    const old = storage.getItem(`legends.${key}`)
    if (old !== null && storage.getItem(`avatar-legends.${key}`) === null) storage.setItem(`avatar-legends.${key}`, old)
  }
  storage.setItem('avatar-legends.clientPreferencesMigrated', 'true')
}
