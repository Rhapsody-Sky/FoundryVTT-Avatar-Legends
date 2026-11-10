import { OLD_ID, NEW_ID, MODULE_ID, transformTree, findAssetPaths, migrateClientSettings } from './transform.js'

const de = () => game.i18n.lang === 'de'
const text = (en, german) => de() ? german : en
let running = false
const state = () => game.settings.get(MODULE_ID, 'state')
const checkpoint = value => game.settings.set(MODULE_ID, 'state', value)
const plain = doc => doc.toObject()
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b)

Hooks.once('init', () => {
  game.settings.register(MODULE_ID, 'state', { scope: 'world', config: false, type: Object, default: {} })
  game.settings.registerMenu(MODULE_ID, 'assistant', {
    name: 'Avatar Legends Migration', label: 'Open / Öffnen', icon: 'fas fa-exchange-alt', restricted: true,
    type: class extends foundry.applications.api.ApplicationV2 {
      render() { showAssistant(); return this }
    },
  })
  if (game.system.id === NEW_ID) migrateClientSettings(localStorage)
})

Hooks.once('ready', () => {
  game.modules.get(MODULE_ID).api = { preflight, migrate, showAssistant }
  if (!game.user.isGM) return
  if (game.system.id === OLD_ID) showAssistant()
  else if (game.system.id === NEW_ID && state().phase === 'switching') {
    if (Object.values(state().collections ?? {}).some(id => !game.packs.has(id))) {
      ui.notifications.error(text('Migration needs attention: an inherited world compendium is missing. Keep your backup and do not remove the old system.',
        'Die Umstellung muss geprüft werden: Ein übernommenes Welt-Kompendium fehlt. Bewahre deine Sicherung auf und entferne das alte System noch nicht.'), { permanent: true })
      return
    }
    checkpoint({ ...state(), phase: 'complete' }).then(() => {
      ui.notifications.info(text('Migration complete. You can now disable Avatar Legends Migration. Update the new system normally in Setup.',
        'Umstellung abgeschlossen. Du kannst Avatar Legends Migration jetzt deaktivieren. Das neue System lässt sich normal im Setup aktualisieren.'))
    })
  }
})

async function targetManifest() {
  const response = await fetch(foundry.utils.getRoute(`systems/${NEW_ID}/system.json`), { cache: 'no-store' })
  if (!response.ok) throw new Error(text('Install the new Avatar Legends RPG system (ID avatar-legends) in Setup first.',
    'Installiere zuerst das neue System Avatar Legends RPG (ID avatar-legends) im Setup.'))
  const manifest = await response.json()
  if (manifest.id !== NEW_ID || foundry.utils.isNewerVersion('2.2.0', manifest.version)) throw new Error('Unsupported target system version.')
  return manifest
}

export async function preflight() {
  if (!game.user.isGM || game.system.id !== OLD_ID) throw new Error('Run this assistant as a GM in a Legends world.')
  if (game.users.some(user => user.active && user.id !== game.user.id)) {
    throw new Error(text('Ask other users to disconnect before migrating.', 'Alle anderen Nutzer müssen sich vor der Umstellung abmelden.'))
  }
  const manifest = await targetManifest()
  const incompatible = game.modules.filter(module => module.active && module.id !== MODULE_ID
    && module.relationships.systems.size && !module.relationships.systems.has(NEW_ID))
  if (incompatible.length) throw new Error(text('Disable modules restricted to the old system first: ',
    'Deaktiviere zuerst Module, die nur das alte System unterstützen: ') + incompatible.map(m => m.title).join(', '))
  const packs = game.packs.filter(pack => pack.metadata.packageName === OLD_ID)
  const collections = Object.fromEntries(packs.map(pack => [pack.collection, `world.avatar-legends-legacy-${pack.metadata.name}`]))
  if (!state().phase) {
    for (const id of Object.values(collections)) if (game.packs.has(id)) throw new Error(`Compendium ${id} already exists; migration will not overwrite it.`)
  }
  return { manifest, packs, collections }
}

export async function showAssistant() {
  if (running || !game.user.isGM || game.system.id !== OLD_ID) return
  const D = foundry.applications.api.DialogV2
  const content = text(
    '<p>This assistant moves this world to the new Avatar Legends RPG system. Future updates will come from the new repository through Foundry.</p><p>Install the new system first. Back up this world and the old system, including custom compendiums. All other users must disconnect. The world will close when finished.</p>',
    '<p>Dieser Assistent stellt diese Welt auf das neue System Avatar Legends RPG um. Danach kommen Updates über Foundry aus dem neuen Repository.</p><p>Installiere zuerst das neue System. Sichere diese Welt und das alte System einschließlich eigener Kompendien. Alle anderen Nutzer müssen sich abmelden. Nach Abschluss wird die Welt geschlossen.</p>')
    + `<label><input type="checkbox" name="backup"> ${text('I have a current backup of the world and old system.', 'Ich habe eine aktuelle Sicherung der Welt und des alten Systems.')}</label>`
    + (state().phase ? `<p>${text('An unfinished migration will be resumed.', 'Eine unterbrochene Umstellung wird fortgesetzt.')}</p>` : '')
  await D.wait({ window: { title: 'Avatar Legends Migration' }, content,
    buttons: [
      { action: 'migrate', label: text('Migrate world', 'Welt umstellen'), icon: 'fas fa-exchange-alt', callback: async (_event, button) => {
        if (!button.form.querySelector('[name="backup"]').checked) {
          ui.notifications.warn(text('Confirm your backup first.', 'Bestätige zuerst deine Sicherung.')); return
        }
        try { await migrate({ backupConfirmed: true }) }
        catch (error) { console.error(MODULE_ID, error); ui.notifications.error(error.message, { permanent: true }) }
      } },
      { action: 'cancel', label: text('Later', 'Später'), default: true },
    ], rejectClose: false,
  })
}

async function documents() {
  const result = []
  for (const collection of game.collections.values()) {
    if (collection.documentName === 'Setting') continue
    for (const doc of collection.contents) result.push(doc)
  }
  return result
}

async function copyAssets(paths, migration) {
  const pending = [...paths].filter(path => !migration.assets[path])
  if (!pending.length) return
  const FilePicker = foundry.applications.apps.FilePicker.implementation
  const dirs = new Set()
  const mkdir = async path => {
    if (dirs.has(path)) return
    // Existing directories are allowed; other errors must still surface on upload.
    try { await FilePicker.createDirectory('data', path, {}, { notify: false }) }
    catch { await FilePicker.browse('data', path) }
    dirs.add(path)
  }
  const parent = `worlds/${game.world.id}/avatar-legends-migration`
  await mkdir(parent)
  // Foundry's media upload overwrites existing files. Create a fresh directory
  // for this run and keep any paths already recorded by a previous attempt.
  const root = `${parent}/${foundry.utils.randomID()}`
  await FilePicker.createDirectory('data', root, {}, { notify: false })
  for (const oldPath of pending) {
    const relative = decodeURIComponent(oldPath.slice('systems/legends/'.length).split(/[?#]/)[0])
    if (relative.split('/').some(p => p === '.' || p === '..' || !p) || relative.includes('\\')) throw new Error(`Unsafe asset path: ${oldPath}`)
    const response = await fetch(foundry.utils.getRoute(oldPath))
    if (!response.ok) throw new Error(`Cannot preserve missing asset: ${oldPath}`)
    const blob = await response.blob()
    const segments = relative.split('/')
    const filename = segments.pop()
    let folder = root
    for (const segment of segments) { folder += '/' + encodeURIComponent(segment); await mkdir(folder) }
    const uploaded = await FilePicker.upload('data', folder, new File([blob], filename, { type: blob.type }), {}, { notify: false })
    if (!uploaded?.path) throw new Error(`Could not preserve asset: ${oldPath}`)
    const saved = await fetch(foundry.utils.getRoute(uploaded.path), { cache: 'no-store' })
    const expectedBytes = new Uint8Array(await blob.arrayBuffer())
    const actualBytes = new Uint8Array(await saved.arrayBuffer())
    if (!saved.ok || expectedBytes.length !== actualBytes.length || expectedBytes.some((value, index) => value !== actualBytes[index])) {
      throw new Error(`Asset verification failed: ${oldPath}`)
    }
    migration.assets[oldPath] = uploaded.path
    await checkpoint(migration)
  }
}

async function updateDocument(doc, options) {
  const before = plain(doc)
  const after = transformTree(before, options)
  const changes = foundry.utils.diffObject(before, after, { deletionKeys: true })
  if (!foundry.utils.isEmpty(changes)) await doc.update(changes, { render: false })
}

async function migrateSettings(options) {
  const storage = game.settings.storage.get('world')
  for (const setting of [...storage.contents]) {
    if (setting.key.startsWith(MODULE_ID + '.')) continue
    const before = setting.toObject()
    let value = before.value
    if (typeof value === 'string') {
      try { value = JSON.stringify(transformTree(JSON.parse(value), options)) }
      catch (error) { if (error instanceof SyntaxError) value = transformTree(value, options); else throw error }
    } else value = transformTree(value, options)
    if (setting.key.startsWith(OLD_ID + '.')) {
      const key = NEW_ID + setting.key.slice(OLD_ID.length)
      const existing = storage.contents.find(s => s.key === key && s.user === setting.user)
      if (existing && !equal(existing.toObject().value, value)) throw new Error(`Conflicting setting: ${key}`)
      if (!existing) await storage.documentClass.create({ key, value, user: before.user })
    } else if (!equal(before.value, value)) await setting.update({ value })
  }
}

export async function migrate({ backupConfirmed = false } = {}) {
  if (!backupConfirmed) throw new Error('A current backup must be confirmed.')
  if (running) throw new Error('Migration is already running.')
  running = true
  try {
    const { manifest, packs, collections } = await preflight()
    const migration = state().phase ? structuredClone(state()) : {
      phase: 'copying', version: 1, started: new Date().toISOString(), collections, assets: {},
    }
    await checkpoint(migration)
    ui.notifications.info(text('Migrating world. Keep this window open.', 'Die Welt wird umgestellt. Lass dieses Fenster geöffnet.'))
    const worldDocs = await documents()
    const packData = []
    const paths = findAssetPaths(game.world.toObject())
    for (const doc of worldDocs) findAssetPaths(plain(doc), paths)
    for (const pack of game.packs.filter(p => p.metadata.packageName === OLD_ID || p.metadata.packageType === 'world')) {
      const docs = await pack.getDocuments()
      for (const doc of docs) findAssetPaths(plain(doc), paths)
      packData.push({ pack, docs })
    }
    for (const setting of game.settings.storage.get('world').contents) {
      if (!setting.key.startsWith(MODULE_ID + '.')) findAssetPaths(setting.toObject(), paths)
    }
    await copyAssets(paths, migration)
    const options = { collections: migration.collections, assets: migration.assets,
      actorTypes: Object.fromEntries(game.actors.map(actor => [actor.id, actor.type])) }
    const Compendiums = foundry.documents.collections.CompendiumCollection
    for (const { pack, docs } of packData) {
      let target = pack
      if (pack.metadata.packageName === OLD_ID) {
        const id = migration.collections[pack.collection]
        target = game.packs.get(id)
        if (target) {
          // A retry can find a copy made by an earlier version of the assistant.
          // Keep a migrated override if the source setting has already moved.
          const ownership = pack.config.ownership ?? target.config.ownership ?? pack.ownership
          if (!equal(target.ownership, ownership)) await target.configure({ ownership })
        } else {
          target = await Compendiums.createCompendium({
            name: id.slice('world.'.length), label: `${pack.title} (Legacy)`, type: pack.documentName,
            package: 'world', ownership: pack.ownership,
          })
        }
        const locked = target.locked
        try {
          if (locked) await target.configure({ locked: false })
          const folders = pack.folders?.contents ?? []
          for (const folder of folders) {
            if (!target.folders.has(folder.id)) await Folder.createDocuments([plain(folder)], { pack: target.collection, keepId: true })
          }
          for (const doc of docs) {
            const data = transformTree(plain(doc), options)
            const existing = await target.getDocument(doc.id)
            if (existing) await existing.update(data, { diff: false, recursive: false })
            else await target.documentClass.createDocuments([data], { pack: target.collection, keepId: true, keepEmbeddedIds: true })
          }
        } finally { if (locked) await target.configure({ locked: true }) }
        if ((await target.getIndex()).size !== docs.length) throw new Error(`Incomplete compendium copy: ${pack.collection}`)
      } else {
        const locked = target.locked
        try {
          if (locked) await target.configure({ locked: false })
          for (const doc of docs) await updateDocument(doc, options)
        } finally { if (locked) await target.configure({ locked: true }) }
      }
    }
    migration.phase = 'documents'; await checkpoint(migration)
    for (const doc of worldDocs) await updateDocument(doc, options)
    await migrateSettings(options)
    migrateClientSettings(localStorage)
    // The world assignment changes last. Until here the original system remains
    // installed and the operation can be resumed from its saved checkpoint.
    migration.phase = 'switching'; await checkpoint(migration)
    const worldData = transformTree(game.world.toObject(), options)
    const changes = foundry.utils.diffObject(game.world.toObject(), worldData)
    // Newly created packs are not reflected in the client's World manifest.
    // Include their live metadata explicitly when persisting the system change.
    const worldPacks = game.packs.filter(p => p.metadata.packageType === 'world').map(pack => {
      const metadata = pack.metadata
      return { name: metadata.name, label: metadata.label, path: `packs/${metadata.name}`,
        type: pack.documentName, system: NEW_ID, ownership: metadata.ownership, flags: metadata.flags }
    })
    const response = await foundry.utils.fetchJsonWithTimeout(foundry.utils.getRoute('setup'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...changes, packs: worldPacks, action: 'editWorld', id: game.world.id, system: NEW_ID, systemVersion: manifest.version }),
    })
    if (response.error || response.system !== NEW_ID) throw new Error(response.error ?? 'World system change was not confirmed.')
    await game.shutDown()
  } finally { running = false }
}
