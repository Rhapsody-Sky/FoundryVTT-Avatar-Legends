import { legends } from '../config.js'
import { editImage, enrich, toggleDrawer } from '../helpers.js'
import LegendsActorSheetV2 from './LegendsActorSheet.v2.js'
import { rollApproach, rollMove, rollPrinciple, rollStat } from '../dice.js'

const TextEditor = foundry.applications.ux.TextEditor.implementation

export default class LegendsPlayerActorSheetV2 extends LegendsActorSheetV2 {
  static PARTS = {
    header: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/player/header.hbs`,
    },
    tabs: {
      template: `${legends.rootPath}/templates/partials/v2/tabs.hbs`,
    },
    main: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/player/main.hbs`,
      scrollable: [''],
    },
    moves: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/player/moves.hbs`,
      scrollable: [''],
    },
    techniques: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/player/techniques.hbs`,
      scrollable: [''],
    },
    details: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/player/details.hbs`,
      scrollable: [''],
    },
    notes: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/player/notes.hbs`,
      scrollable: [''],
    },
  }

  static TABS = {
    sheet: {
      tabs: [
        { id: 'main', group: 'sheet', label: 'legends.nav.main' },
        { id: 'moves', group: 'sheet', label: 'legends.nav.moves' },
        { id: 'techniques', group: 'sheet', label: 'legends.nav.techniques' },
        { id: 'details', group: 'sheet', label: 'legends.nav.detail' },
      ],
      initial: 'main',
    },
  }

  static DEFAULT_OPTIONS = {
    classes: ['legends', 'sheet', 'actor', 'player'],
    position: {
      width: 950,
      height: 800,
    },
    window: {
      resizable: true,
      title: 'TYPES.Actor.player',
    },
    tag: 'form',
    form: {
      handler: LegendsPlayerActorSheetV2.#onSubmitForm,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      addItem: this.#addItem,
      editImage: this.#editImage,
      itemToChat: this.#itemToChat,
      markAdvancement: this.#markAdvancement,
      markGrowth: this.#markGrowth,
      rollApproach: this.#rollApproach,
      rollMove: this.#rollMove,
      rollPrinciple: this.#rollPrinciple,
      rollStat: this.#rollStat,
      setBalance: this.#setBalance,
      setCenter: this.#setCenter,
      setFatigue: this.#setFatigue,
      setProficiency: this.#setProficiency,
      toggleCondition: this.#toggleItem,
      toggleDrawer: this.#toggleDrawer,
      toggleStatus: this.#toggleItem,
      toggleTraining: this.#toggleTraining,
    },
  }

  async _onRender(context, options) {
    await super._onRender(context, options)

    const html = $(this.element)

    const theme = game.settings.get('avatar-legends', 'sheetColour') ?? 'default'
    html.attr('data-theme', theme)

    html.find('.moveCategorySelect').change(this._onSelectMoveCategory.bind(this))
  }

  async _onDrop(event) {
    event.preventDefault()
    const { type, uuid } = TextEditor.getDragEventData(event)
    if (type == 'Item') {
      const item = await fromUuid(uuid)
      if (!item) return

      if (item.type === 'playbook') {
        this.applyPlaybook(item)
        ui.notifications.info(
          game.i18n.format('legends.items.playbook-applied', {
            name: item.name,
          }),
        )
        return
      }
    } else if (type == 'Folder') {
      const folder = await fromUuid(uuid)
      if (!folder) return

      let items = []
      for (const content of folder.contents) {
        let item = await fromUuid(content.uuid)
        if (!item) continue

        items.push(item)
      }
      if (items.length > 0) await this.document.createEmbeddedDocuments('Item', items)
    }
    return super._onDrop(event)
  }

  static async #onSubmitForm(event, _form, formData) {
    event.preventDefault()
    this.document.update(formData.object)
  }

  async prepareActorContext(context) {
    context.conditions = this.document.itemTypes.condition.sort((a, b) => (a.sort > b.sort ? -1 : 1))

    context.statuses = {
      positive: this.document.itemTypes.status
        .filter((s) => s.system.type == 'positive')
        .sort((a, b) => (a.sort > b.sort ? -1 : 1)),
      negative: this.document.itemTypes.status
        .filter((s) => s.system.type == 'negative')
        .sort((a, b) => (a.sort > b.sort ? -1 : 1)),
    }

    context.moveCategories = legends.moveCategories
    context.moves = this.document.itemTypes.move
    context.selectedMoveCategory = this.actor.getFlag('avatar-legends', 'moveCategory') || 'all'
    if (context.selectedMoveCategory !== 'all') {
      context.moves = context.moves.filter((move) => move.system.category == context.selectedMoveCategory)
    }
    context.moves = context.moves.sort((a, b) => (a.sort > b.sort ? -1 : 1))

    context.techniquesByApproach = {}
    Object.keys(CONFIG.legends.approaches).forEach((approach) => {
      const techniques = this.document.itemTypes.technique
        .filter((element) => element.system.approach === approach)
        .sort((a, b) => (a.sort > b.sort ? -1 : 1))
      context.techniquesByApproach[approach] = techniques
    })

    context.feature = this.document.itemTypes.feature[0]
    context.momentOfBalance = this.document.itemTypes['moment-of-balance'][0]
    context.system.enrichedLook = await enrich(this.document.system.look)
    context.growthQuestions = this.document.itemTypes['growth-question']

    context.system.enrichedNotes = await enrich(this.document.system.notes)

    return context
  }

  // #region actions
  static async #addItem(event, target) {
    this.addItem(event, target)
  }

  static async #editImage(event, target) {
    editImage(event, target, this.document)
  }

  static async #itemToChat(event, target) {
    await this.itemToChat(event, target)
  }

  static async #markAdvancement(event, target) {
    event.preventDefault()
    let { newValue, param } = target.dataset
    newValue = parseInt(newValue)
    let { value, max } = this.document.system.growth.advancements[param]

    if (newValue == value) {
      newValue = value - 1
    }

    this.document.update({
      system: {
        growth: {
          advancements: {
            [param]: {
              value: Math.clamp(newValue, 0, max),
            },
          },
        },
      },
    })
  }

  static async #markGrowth(event, target) {
    event.preventDefault()
    let { newValue } = target.dataset
    newValue = parseInt(newValue)

    let { value, max } = this.document.system.growth

    if (newValue == value) {
      newValue = value - 1
    }

    this.document.update({
      system: {
        growth: {
          value: Math.clamp(newValue, 0, max),
        },
      },
    })
  }

  static async #rollApproach(event, target) {
    event.preventDefault()
    let { approach, stat } = target.dataset
    rollApproach(this.document, stat, approach)
  }

  static async #rollMove(event, target) {
    event.preventDefault()
    let { uuid } = target.dataset
    const move = await fromUuid(uuid)
    if (move.parent != this.document) {
      ui.notifications.error('Item is not owned by this Document')
    }
    rollMove(uuid)
  }

  static async #rollPrinciple(event, target) {
    event.preventDefault()
    let { principle } = target.dataset

    rollPrinciple(this.document, this.document.system.balance[principle])
  }

  static async #rollStat(event, target) {
    event.preventDefault()
    let { stat } = target.dataset
    rollStat(this.actor, stat)
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

  static async #setCenter(event, target) {
    event.preventDefault()
    let { newValue } = target.dataset
    newValue = parseInt(newValue)

    this.document.update({
      system: {
        balance: {
          center: Math.clamp(newValue, -3, 3),
        },
      },
    })
  }

  static async #setFatigue(event, target) {
    await this.setFatigue(event, target)
  }

  static async #setProficiency(event, target) {
    event.preventDefault()
    let { techniqueId, level } = target.dataset
    let technique = this.document.items.get(techniqueId)

    if (technique?.type !== 'technique') return

    let mastered = false
    let practiced = false

    switch (level) {
      case 'mastered':
        mastered = true
        practiced = true
        break
      case 'practiced':
        practiced = true
        break
    }
    technique.update({
      system: {
        learned: true,
        practiced: practiced,
        mastered: mastered,
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

  static async #toggleTraining(event, target) {
    event.preventDefault()
    let { training } = target.dataset
    let newValue = !this.document.system.training[training]

    this.document.update({
      system: {
        training: {
          [training]: newValue,
        },
      },
    })
  }

  _onSelectMoveCategory(event) {
    event.preventDefault()
    this.actor.setFlag('avatar-legends', 'moveCategory', event.currentTarget.value ?? 'all')
  }
  // #endregion

  async applyPlaybook(playbook) {
    // Overwrite text fields for Playbook name, default stats and Principles
    this.actor.update({
      system: {
        playbook: playbook.name,
        stats: playbook.system.stats,
        balance: playbook.system.balance,
      },
    })

    // Delete existing unique items
    this.deleteItemsByType(['feature', 'moment-of-balance', 'growth-question'])

    // Re-add default Growth Questions
    const growthQuestions = game.packs
      .get('avatar-legends.common-items')
      .index.filter((item) => item.type === 'growth-question')
      .sort((a, b) => (a.name > b.name ? 1 : -1))

    for (const growthQuestion of growthQuestions) {
      const question = await fromUuid(`Compendium.avatar-legends.common-items.${growthQuestion._id}`)
      if (question) {
        // We await this to make sure they're added in the correct order
        await this.actor.createEmbeddedDocuments('Item', [question])
      }
    }

    for (const uuid of playbook.system.attachedItems) {
      const attachment = await fromUuid(uuid)
      this.actor.createEmbeddedDocuments('Item', [attachment])
    }
  }
}
