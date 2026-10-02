import { legends } from '../config.js'
import { editImage, enrich, toggleDrawer } from '../helpers.js'
import LegendsActorSheetV2 from './LegendsActorSheet.v2.js'

const TextEditor = foundry.applications.ux.TextEditor.implementation

export default class LegendsNpcActorSheetV2 extends LegendsActorSheetV2 {
  static PARTS = {
    header: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/npc/header.hbs`,
    },
    body: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/npc/body.hbs`,
      scrollable: [''],
    },
  }

  static DEFAULT_OPTIONS = {
    classes: ['legends', 'sheet', 'actor', 'npc'],
    position: {
      width: 650,
      height: 750,
    },
    window: {
      resizable: true,
      title: 'TYPES.Actor.player',
    },
    tag: 'form',
    form: {
      handler: LegendsNpcActorSheetV2.#onSubmitForm,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      addItem: this.#addItem,
      editImage: this.#editImage,
      fatigueDecrease: this.#fatigueDecrease,
      fatigueIncrease: this.#fatigueIncrease,
      itemToChat: this.#itemToChat,
      setBalance: this.#setBalance,
      setFatigue: this.#setFatigue,
      setPrinciple: this.#setPrinciple,
      toggleCondition: this.#toggleItem,
      toggleDrawer: this.#toggleDrawer,
      toggleStatus: this.#toggleItem,
    },
  }

  async prepareActorContext(context) {
    context.system.enrichedDescription = await enrich(this.document.system.description)

    context.techniques = this.document.itemTypes.technique.sort((a, b) => (a.sort > b.sort ? -1 : 1))
    context.conditions = this.document.itemTypes.condition.sort((a, b) => (a.name > b.name ? 1 : -1))
    context.statuses = this.document.itemTypes.status.sort((a, b) => {
      if (a.system.type == b.system.type) {
        return a.name > b.name ? 1 : -1
      } else {
        if (a.system.type == 'positive') return -1
        return 1
      }
    })

    context.principle = this.document.itemTypes['npc-principle'][0]

    return context
  }

  async _onRender(context, options) {
    await super._onRender(context, options)
  }

  static async #onSubmitForm(event, _form, formData) {
    event.preventDefault()
    this.document.update(formData.object)
  }

  async _onDrop(event) {
    event.preventDefault()
    const { type, uuid } = TextEditor.getDragEventData(event)
    if (type == 'Item') {
      const item = await fromUuid(uuid)
      if (!item) return

      if (item.type === 'npc-principle') {
        await this.deleteItemsByType('npc-principle')
        await this.document.createEmbeddedDocuments('Item', [item])
        return
      }
    }

    return super._onDrop(event)
  }

  // #region Actions
  static async #addItem(event, target) {
    this.addItem(event, target)
  }

  static async #editImage(event, target) {
    editImage(event, target, this.document)
  }

  static async #fatigueDecrease(event, _t) {
    event.preventDefault()
    const { max } = this.document.system.fatigue
    this.document.update({
      system: {
        fatigue: {
          max: Math.max(max - 1, 1),
        },
      },
    })
  }

  static async #fatigueIncrease(event, _t) {
    event.preventDefault()
    const { max } = this.document.system.fatigue
    this.document.update({
      system: {
        fatigue: {
          max: max + 1,
        },
      },
    })
  }

  static async #itemToChat(event, target) {
    await this.itemToChat(event, target)
  }

  static async #setBalance(event, target) {
    event.preventDefault()
    let { newValue } = target.dataset
    newValue = parseInt(newValue)

    this.document.update({
      system: {
        balance: {
          value: Math.clamp(newValue, -3, 3),
        },
      },
    })
  }

  static async #setFatigue(event, target) {
    await this.setFatigue(event, target)
  }

  static async #setPrinciple(event, target) {
    event.preventDefault()
    const { itemId, value } = target.dataset
    const principle = this.document.items.get(itemId)
    if (!principle) return

    principle.update({
      system: {
        track: {
          value: parseInt(value),
        },
      },
    })
  }

  static async #toggleDrawer(event, target) {
    event.preventDefault()
    toggleDrawer(this.document, target)
  }

  static async #toggleItem(event, target) {
    await this.toggleItem(event, target)
  }
  // #endregion
}
