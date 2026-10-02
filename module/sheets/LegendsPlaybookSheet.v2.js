import { legends } from '../config.js'
import { editImage, onlyUnique } from '../helpers.js'

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ItemSheetV2 } = foundry.applications.sheets
const { ContextMenu } = foundry.applications.ux
const TextEditor = foundry.applications.ux.TextEditor.implementation

export default class LegendsPlaybookSheetV2 extends HandlebarsApplicationMixin(ItemSheetV2) {
  static PARTS = {
    header: {
      template: `${legends.rootPath}/templates/sheets/items/v2/header.hbs`,
    },
    body: {
      template: `${legends.rootPath}/templates/sheets/items/v2/playbook.hbs`,
    },
  }

  static DEFAULT_OPTIONS = {
    classes: ['legends', 'sheet', 'item'],
    position: {
      width: 600,
      height: 650,
    },
    window: {
      resizable: true,
    },
    tag: 'form',
    form: {
      handler: LegendsPlaybookSheetV2.#onSubmitForm,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      editImage: this.#editImage,
    },
  }

  async _prepareContext(options) {
    const { system, flags, uuid, name, img, type, isOwner } = this.document
    const context = {
      ...(await super._prepareContext(options)),
      config: legends,
      system: { ...system },
      source: { ...this.document._source.system },
      flags,
      uuid,
      name,
      img,
      type,
      editable: this.isEditable && this.isEditMode,
      isOwner,
    }

    const attachments = {}
    for (const uuid of this.attachments) {
      attachments[uuid] = await fromUuid(uuid)
    }
    context.attachments = attachments

    return context
  }

  async _onRender(context, options) {
    await super._onRender(context, options)
    const isOwner = this.document.isOwner

    if (this.isEditable) {
      new ContextMenu(
        this.element,
        '.itemContextMenu',
        [
          {
            label: 'legends.context-menu.edit',
            icon: 'fas fa-edit color-class',
            onClick: this.editAttachment,
            visible: isOwner,
          },
          {
            label: 'legends.context-menu.delete',
            icon: 'fas fa-trash color-class',
            onClick: this.deleteAttachment,
            visble: isOwner,
          },
        ],
        { jQuery: false },
      )
    }
  }

  get attachments() {
    return this.document.system.attachedItems
  }

  static async #onSubmitForm(event, _form, formData) {
    event.preventDefault()
    this.document.update(formData.object)
  }

  async _onDrop(event) {
    event.preventDefault()
    const { type, uuid } = TextEditor.getDragEventData(event)
    if (type !== 'Item') return
    const item = await fromUuid(uuid)
    if (!item) return

    const permittedItems = [
      'condition',
      'move',
      'technique',
      'feature',
      'moment-of-balance',
      'growth-question',
      'status',
    ]

    if (!permittedItems.includes(item.type)) {
      ui.notifications.error(game.i18n.format('legends.items.not-allowed'))
      return false
    }

    let attachedItems = this.attachments
    attachedItems.push(uuid)
    attachedItems = onlyUnique(attachedItems)

    this.document.update({
      system: {
        attachedItems,
      },
    })
  }

  // #region actions
  static async #editImage(event, target) {
    editImage(event, target, this.document)
  }

  deleteAttachment = async (event, target) => {
    event.preventDefault()
    const { uuid } = target.dataset
    let attachedItems = this.attachments
    attachedItems.splice(this.attachments.indexOf(uuid), 1)
    this.document.update({
      system: {
        attachedItems,
      },
    })
  }

  editAttachment = async (event, target) => {
    event.preventDefault()
    const { uuid } = target.dataset
    const item = await fromUuid(uuid)
    item.sheet.render({ force: true })
  }
  // #endregion
}
