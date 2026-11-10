import test from 'node:test'
import assert from 'node:assert/strict'
import { configureEditors } from '../module/editor.js'

test('saving leaves the view alive until the menu has finished focusing it', async () => {
  let configure
  let saves = 0
  let listeners = 0
  const editor = {
    isConnected: true,
    hasAttribute: () => true,
    addEventListener: (_, callback) => { configure = callback; listeners++ },
    save: () => { saves++ },
  }
  const root = { querySelectorAll: () => [editor] }
  globalThis.ProseMirror = { defaultSchema: {}, ProseMirrorMenu: { build: (_, options) => options } }
  try {
    configureEditors(root)
    configureEditors(root)
    assert.equal(listeners, 1)
    const event = { plugins: {} }
    configure(event)
    event.plugins.menu.onSave()
    assert.equal(saves, 0, 'menu must still be able to focus its view')
    await Promise.resolve()
    assert.equal(saves, 1)
    editor.isConnected = false
    event.plugins.menu.onSave()
    await Promise.resolve()
    assert.equal(saves, 1, 'do not save again after a sheet was removed')
  } finally {
    delete globalThis.ProseMirror
  }
})
