import { legends } from '../config.js'
import { editImage, enrich } from '../helpers.js'
import { configureEditors } from '../editor.js'

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ItemSheetV2 } = foundry.applications.sheets

export default class LegendsItemSheetV2 extends HandlebarsApplicationMixin(ItemSheetV2) {
  static PARTS = {
    header: {
      template: `${legends.rootPath}/templates/sheets/items/v2/header.hbs`,
    },
    body: {
      template: `${legends.rootPath}/templates/sheets/items/v2/body.hbs`,
    },
  }

  static DEFAULT_OPTIONS = {
    classes: ['legends', 'sheet', 'item'],
    position: {
      width: 500,
      height: 'auto',
    },
    window: {
      resizable: true,
      // title: 'TYPES.Item.player',
    },
    tag: 'form',
    form: {
      handler: LegendsItemSheetV2.#onSubmitForm,
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

    await this.prepareContext(context)

    return context
  }

  async prepareContext(context) {
    context.system.enrichedDescription = await enrich(context.system.description)
  }

  async _onRender(context, options) {
    await super._onRender(context, options)
    configureEditors(this.element)
  }

  static async #onSubmitForm(event, _form, formData) {
    event.preventDefault()
    this.document.update(formData.object)
  }

  // #region actions
  static async #editImage(event, target) {
    editImage(event, target, this.document)
  }
  // #endregion
}
