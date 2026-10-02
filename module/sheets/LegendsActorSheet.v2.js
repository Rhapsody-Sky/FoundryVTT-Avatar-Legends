import { legends } from '../config.js'
import { enrich, viewNotesTab } from '../helpers.js'

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets
const { ContextMenu } = foundry.applications.ux

export default class LegendsActorSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {
  async _prepareContext(options) {
    const context = {
      ...(await super._prepareContext(options)),
      config: legends,
      system: { ...this.document.system },
      source: { ...this.document._source.system },
      flags: this.document.flags,
      uuid: this.document.id,
      name: this.document.name,
      img: this.document.img,
      editable: this.isEditable && this.isEditMode,
      tabs: this._prepareTabs('sheet'),
      isOwner: this.document.isOwner,
    }
    for (const item of this.document.items) item.system.enrichedDescription = await enrich(item.system.description)

    await this.prepareActorContext(context)

    return context
  }

  _getTabsConfig(group) {
    const tabs = foundry.utils.deepClone(super._getTabsConfig(group))

    if (!tabs) return tabs

    if (viewNotesTab(this.document)) {
      tabs.tabs.push({
        id: 'notes',
        group: 'sheet',
        label: 'legends.nav.notes',
      })
    }

    return tabs
  }

  async _preparePartContext(partId, context) {
    super._preparePartContext(partId, context)

    switch (partId) {
      case 'main':
      case 'moves':
      case 'techniques':
      case 'details':
        context.tab = context.tabs[partId]
        break
      default:
    }
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
            onClick: (event, target) => {
              event.preventDefault()
              const { itemId } = target.dataset
              const item = this.document.items.get(itemId)
              item?.sheet?.render({ force: true })
            },
            visible: isOwner,
          },
          {
            label: 'legends.context-menu.delete',
            icon: 'fas fa-trash color-class',
            onClick: (event, target) => {
              event.preventDefault()
              const { itemId } = target.dataset
              this.document.deleteEmbeddedDocuments('Item', [itemId])
            },
            visble: isOwner,
          },
        ],
        { jQuery: false },
      )
    }
  }

  async prepareActorContext(context) {
    ui.notifications.warn('Not implemented')
    return context
  }

  // common actions
  async addItem(event, target) {
    event.preventDefault()
    const { itemType } = target.dataset

    const defaultData = {}

    const itemData = {
      name: game.i18n.format('legends.items.new.name', { type: itemType }),
      type: itemType,
      system: {
        description: game.i18n.localize('legends.items.new.description'),
        ...defaultData,
      },
    }

    const items = await this.actor.createEmbeddedDocuments('Item', [itemData])
    for (const item of items) {
      item.sheet.render({ force: true })
    }
  }

  async deleteItemsByType(types) {
    const items = this.actor.items.filter((item) => types.includes(item.type)).map((item) => item.id)
    await this.actor.deleteEmbeddedDocuments('Item', items)
  }

  async itemToChat(event, target) {
    event.preventDefault()
    const { itemId } = target.dataset
    this.document.items.get(itemId)?.toChatMessage()
  }

  async setFatigue(event, target) {
    event.preventDefault()
    let { newValue } = target.dataset
    newValue = parseInt(newValue)
    let { value, max } = this.document.system.fatigue

    if (newValue == value) {
      newValue = value - 1
    }

    this.document.update({
      system: {
        fatigue: {
          value: Math.clamp(newValue, 0, max),
        },
      },
    })
  }

  async toggleItem(event, target) {
    event.preventDefault()
    let { itemId } = target.dataset
    let item = this.document.items.get(itemId)

    let checked = !item.system.checked

    item.update({
      system: {
        checked,
      },
    })
  }
}
