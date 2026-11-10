const configured = new WeakSet()

/** Let the menu finish its focus handling before a toggled editor is destroyed. */
export function configureEditors(root) {
  for (const editor of root.querySelectorAll('prose-mirror')) {
    if (configured.has(editor)) continue
    configured.add(editor)
    editor.addEventListener('plugins', event => {
      event.plugins.menu = ProseMirror.ProseMirrorMenu.build(ProseMirror.defaultSchema, {
        destroyOnSave: editor.hasAttribute('toggled'),
        onSave: () => queueMicrotask(() => {
          if (editor.isConnected) editor.save()
        }),
      })
    })
  }
}
