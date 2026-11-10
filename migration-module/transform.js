export const OLD_ID = 'legends'
export const NEW_ID = 'avatar-legends'
export const MODULE_ID = 'avatar-legends-migration'

export function rewriteString(value, { collections = {}, assets = {} } = {}) {
  let result = value
  result = result.replace(/((?:game\.settings\.(?:get|set)|(?:get|set|unset)Flag)\(\s*['"])legends(['"])/g, '$1avatar-legends$2')
  result = result.replace(/\.flags\.legends\b/g, '.flags["avatar-legends"]')
    .replace(/\.flags\[['"]legends['"]\]/g, '.flags["avatar-legends"]')
  // Longest paths first: one filename may be a prefix of another.
  for (const [oldPath, newPath] of Object.entries(assets).sort((a, b) => b[0].length - a[0].length)) {
    result = result.split(oldPath).join(newPath)
  }
  for (const [oldId, newId] of Object.entries(collections)) {
    result = result.split(`Compendium.${oldId}.`).join(`Compendium.${newId}.`)
    result = result.split(`@Compendium[${oldId}.`).join(`@Compendium[${newId}.`)
    for (const quote of ['"', "'"]) result = result.split(`${quote}${oldId}${quote}`).join(`${quote}${newId}${quote}`)
    if (result === oldId) result = newId
  }
  // Core stores sheet choices separately from flags. Old classes can differ in
  // spelling between 1.x and 2.x; use the new system's default sheet instead.
  if (/^legends\.Legends/.test(result)) return ''
  return result
}

export function transformTree(value, options = {}) {
  if (typeof value === 'string') return rewriteString(value, options)
  if (Array.isArray(value)) return value.map(entry => transformTree(entry, options))
  if (!value || typeof value !== 'object') return value
  const result = {}
  for (const [key, entry] of Object.entries(value)) {
    const newKey = options.collections?.[key] ?? key
    result[newKey] = transformTree(entry, options)
  }
  if (result.type === 'player' && result.system) migratePlayerText(result.system)
  if (Array.isArray(result.tokens)) {
    for (const token of result.tokens) {
      if (!token.actorLink && options.actorTypes?.[token.actorId] === 'player' && token.delta?.system) {
        // A token's explicit old description must override its base actor's
        // already-migrated look value, not silently inherit the base text.
        migratePlayerText(token.delta.system)
      }
    }
  }
  // Preserve the old namespace as recovery data; new code uses the copied one.
  if (result.flags?.[OLD_ID]) {
    if (result.flags[NEW_ID] && JSON.stringify(result.flags[NEW_ID]) !== JSON.stringify(result.flags[OLD_ID])) {
      throw new Error('Conflicting old and new system flags; resolve this before migrating.')
    }
    result.flags[NEW_ID] = structuredClone(result.flags[OLD_ID])
  }
  return result
}

function migratePlayerText(system) {
  if (system.legacyDescriptionMigrated || typeof system.description !== 'string' || !system.description.trim()) return
  if (system.look == null || (typeof system.look === 'string' && !system.look.trim())) system.look = system.description
  system.legacyDescriptionMigrated = true
}

export function findAssetPaths(value, result = new Set()) {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (parsed && typeof parsed === 'object') return findAssetPaths(parsed, result)
    } catch { /* Most document strings are not JSON. */ }
    if (value.startsWith('systems/legends/') && !/[<>\n"']/.test(value)) result.add(value)
    else {
      const remaining = value.replace(/(["'])(systems\/legends\/[^"']+)\1/g, (_match, _quote, path) => { result.add(path); return '' })
      for (const match of remaining.matchAll(/systems\/legends\/[^\s\\"'<>\)\]\}]+/g)) result.add(match[0])
    }
  } else if (value && typeof value === 'object') {
    for (const entry of Object.values(value)) findAssetPaths(entry, result)
  }
  return result
}

export function migrateClientSettings(storage) {
  const prefix = 'legends.'
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (!key?.startsWith(prefix)) continue
    const target = `${NEW_ID}.${key.slice(prefix.length)}`
    if (storage.getItem(target) === null) storage.setItem(target, storage.getItem(key))
  }
}
