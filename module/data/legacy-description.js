/** Persist the client-side migration with the next actor update.
 * Foundry's model migration alone does not write these fields to the server.
 */
export function persistLegacyDescription(system, changes) {
  if (!system.legacyDescriptionMigrated) return changes
  const updates = changes.system ??= {}
  updates.legacyDescriptionMigrated = true
  if (!Object.hasOwn(changes, 'system.look') && !Object.hasOwn(updates, 'look')) {
    updates.look = system.look
  }
  return changes
}
