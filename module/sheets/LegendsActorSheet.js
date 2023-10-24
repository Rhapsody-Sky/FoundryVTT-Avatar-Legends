import {
  enrich,
  filter_items,
  filter_statuses,
  filter_techniques,
} from '../helpers.js'
import * as Dice from '../dice.js'

export default class LegendsActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 900,
      height: 850,
      tabs: [
        {
          navSelector: '.tabs',
          contentSelector: '.body',
          initial: 'main',
        },
      ],
    })
  }

  get template() {
    return `systems/legends/templates/sheets/actors/${this.actor.type}-sheet.hbs`
  }

  /**
   * Define the options in the Item context menu
   */
  itemContextMenu = [
    {
      name: game.i18n.localize('legends.context-menu.edit'),
      icon: '<i class="fas fa-edit"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        const item = this.actor.items.get(itemId)
        item.sheet.render(true)
      },
    },
    {
      name: game.i18n.localize('legends.context-menu.delete'),
      icon: '<i class="fas fa-trash"></i>',
      callback: (element) => {
        const itemId = element.closest('.item').data('item-id')
        this.actor.deleteEmbeddedDocuments('Item', [itemId])
      },
    },
  ]

  /**
   * Run validation on an Item before adding it to an Actor's sheet.
   * @param {Object} itemData Data of the dropped item
   * @returns
   */
  async _onDropItemCreate(itemData) {
    const items = Array.isArray(itemData) ? itemData : [itemData]

    if (this.actor.type === 'npc') {
      const permittedNpcItems = [
        'technique',
        'npc-principle',
        'condition',
        'status',
      ]

      for (const item of items) {
        if (!permittedNpcItems.includes(item.type)) {
          ui.notifications.error(game.i18n.format('legends.items.not-allowed'))
          return null
        }
      }
    }

    if (this.actor.type === 'player') {
      for (const item of items) {
        if (item.type === 'playbook') {
          this.applyPlaybook(item)
          ui.notifications.info(
            game.i18n.format('legends.items.playbook-applied', {
              name: item.name,
            }),
          )
          return null
        }
      }
    }
    return await super._onDropItemCreate(itemData)
  }

  async getData() {
    const context = super.getData()
    context.config = CONFIG.legends
    context.cssClass = [
      game.settings.get('legends', 'sheetColour') || 'default',
    ]
      .join(' ')
      .trim()

    context.system = this.actor.system

    let features = await filter_items(context.items, 'feature')
    context.feature = features[0]

    context.conditions = await filter_items(context.items, 'condition')

    context.moves = await filter_items(context.items, 'move')
    let momentsOfBalance = await filter_items(
      context.items,
      'moment-of-balance',
    )
    context.momentOfBalance = momentsOfBalance[0]

    let statuses = await filter_items(context.items, 'status')
    context.statuses = {
      positive: filter_statuses(statuses, 'positive'),
      negative: filter_statuses(statuses, 'negative'),
    }
    context.techniques = await filter_items(context.items, 'technique')

    if (this.actor.type === 'player') {
      context.displayTabbed = game.settings.get('legends', 'tabbedPlayerSheet')
      context.growthQuestions = await filter_items(
        context.items,
        'growth-question',
      )
      context.playerNotes = game.settings.get('legends', 'playerNotes')

      context.techniquesByApproach = {}
      Object.keys(CONFIG.legends.approaches).forEach((k) => {
        context.techniquesByApproach[k] ||= []
        context.techniquesByApproach[k] = filter_techniques(
          context.techniques,
          k,
        )
      })

      context.moveCategories = ['basic', 'balance', 'playbook']
      context.selectedMoveCategory =
        this.actor.getFlag('legends', 'moveCategory') || 'all'
    }
    context.system.enrichedDescription = await enrich(
      this.actor.system.description,
    )
    return context
  }

  activateListeners(html) {
    if (this.isEditable) {
      //Generic value tracks
      html.find('.set-value').click(this._onSetValue.bind(this))
      html.find('.set-value').contextmenu(this._onClearValue.bind(this))

      // Fatigue tracks
      html.find('.set-fatigue').click(this._onSetFatigue.bind(this))
      html.find('.set-fatigue').contextmenu(this._onClearFatigue.bind(this))

      if (this.actor.type == 'player') {
        //trainings
        html.find('.training-type').click(this._onToggleTrainingType.bind(this))

        // Set balance and center
        html.find('.set-balance').click(this._onSetBalanceValue.bind(this))
        html
          .find('.set-balance-center')
          .click(this._onSetBalanceCenter.bind(this))

        // Techniques proficiency
        html
          .find('.set-proficiency')
          .click(this._onSetTechniqueProficiency.bind(this))

        // Advancements
        html
          .find('.set-adv-value')
          .click(this._onSetAdvancementValue.bind(this))
        html
          .find('.set-adv-value')
          .contextmenu(this._onClearAdvancement.bind(this))

        // Filter Moves
        html
          .find('.moveCategorySelect')
          .change(this._onSelectMoveCategory.bind(this))
      } else if (this.actor.type == 'npc') {
        // add item button
        html.find('.add-item').click(this._onItemCreate.bind(this))
      }

      // toggle collapsible moves
      html.find('.toggle-drawer').click(this._onToggleCollapsible.bind(this))

      //Remove and Toggle Conditions
      html.find('.condition-toggle').click(this._onConditionToggle.bind(this))

      // Create, Edit and Delete Moves and Techniques
      html.find('.item-edit').click(this._onItemEdit.bind(this))
      html.find('.item-delete').click(this._onItemDelete.bind(this))

      // Context Menus
      new ContextMenu(html, '.item .menu', this.itemContextMenu)
    }

    if (this.actor.isOwner) {
      if (this.actor.type == 'player') {
        // Only players need to roll
        html.find('.stat-roll').click(this._onStatRoll.bind(this))
        html.find('.principle-roll').click(this._onPrincipleRoll.bind(this))
        html.find('.move-roll').click(this._onMoveRoll.bind(this))
        html.find('.approach-roll').click(this._onApproachRoll.bind(this))
      }
      // TODO: Maybe rename this as it's not actually rolling anything.
      html.find('.item-roll').click(this._onItemRoll.bind(this))
    }

    super.activateListeners(html)
  }

  /**
   * Update the Actor's Balance value (used for both tracks)
   * @param {Event} event
   */
  _onSetBalanceValue(event) {
    event.preventDefault()

    const element = event.currentTarget
    this.actor.update({
      system: {
        balance: {
          value: parseInt(element.dataset.currentBalance),
        },
      },
    })
  }

  /**
   * Update the Actor's Center on the Balance track
   * @param {Event} event
   */
  _onSetBalanceCenter(event) {
    event.preventDefault()

    const element = event.currentTarget
    this.actor.update({
      system: {
        balance: {
          center: parseInt(element.dataset.currentCenter),
        },
      },
    })
  }

  /**
   * Send an Item's description to the chat
   * @param {Event} event
   */
  _onItemRoll(event) {
    event.preventDefault()
    const element = event.currentTarget
    const dataset = element.closest('.item').dataset
    const itemId = dataset.itemId
    const item = this.actor.items.get(itemId)
    const npc = dataset.npc

    item.roll(npc)
  }

  /**
   * Roll the stat for a Move. Calls the Dice#RollStat method with the name of the Move for display.
   * @param {Event} event
   */
  _onMoveRoll(event) {
    event.preventDefault()

    const uuid = event.currentTarget.dataset.uuid
    Dice.rollMove(uuid)
  }

  /**
   * Send an Actor's stat roll to the Chat.
   * @param {Event} event
   */
  _onStatRoll(event) {
    event.preventDefault()

    const stat = event.currentTarget.dataset.statName

    Dice.rollStat(this.actor, stat)
  }

  /**
   * Roll with a Principle and send it to the Chat.
   * @param {Event} event
   */
  _onPrincipleRoll(event) {
    event.preventDefault()
    Dice.rollPrinciple(this.actor, event.currentTarget.dataset.name)
  }

  _onApproachRoll(event) {
    event.preventDefault()
    const target = event.currentTarget.dataset
    Dice.rollApproach(this.actor, target.stat, target.approach)
  }

  /**
   * Toggle a plsyer Actor's training
   * @param {Event} event
   */
  _onToggleTrainingType(event) {
    event.preventDefault()
    const element = event.currentTarget
    const type = element.dataset.type
    const newValue = !this.actor.system.training[type]

    this.actor.update({
      system: {
        training: {
          [type]: newValue,
        },
      },
    })
  }

  /**
   * Set the fatigue and fatigueRemaining values when Fatigue is
   * adjusted on this Actor.
   * @param {Event} event The triggering event
   */
  _onSetFatigue(event) {
    event.preventDefault()
    const element = event.currentTarget
    const checked = element.classList.contains('filled')
    const currentValue = parseInt(this.actor.system.fatigue.value)

    const max = this.actor.system.fatigue.max

    const newValue = checked ? currentValue - 1 : currentValue + 1
    const newRemaining = max - newValue

    this.actor.update({
      system: {
        fatigue: {
          value: newValue,
        },
        fatigueRemaining: {
          value: newRemaining,
          max: max,
        },
      },
    })
  }

  /**
   * Set an Actor's Fatigue to 0 and fatigueRemaining to max.
   * @param {Event} event The triggering Event
   */
  _onClearFatigue(event) {
    event.preventDefault()
    let max = this.actor.system.fatigue.max

    this.actor.update({
      system: {
        fatigue: {
          value: 0,
        },
        fatigueRemaining: {
          value: max,
          max: max,
        },
      },
    })
  }

  /**
   * Set the value of an arbitrary Actor or Item parameter, depending on
   * the triggering event's target's data attributes.
   * @param {Event} event The triggering Event
   */
  _onSetValue(event) {
    event.preventDefault()
    let element = event.currentTarget
    let param = element.dataset.param
    let obj = null
    let newValue = null

    if (element.dataset.type == 'item') {
      let dataset = element.closest('.item').dataset
      let itemId = dataset.itemId

      obj = this.actor.items.get(itemId)
      newValue = element.dataset.newValue
    } else {
      let checked = element.classList.contains('filled')
      let currentValue = this.actor.system[param].value

      newValue = checked ? currentValue - 1 : currentValue + 1
      obj = this.actor
    }

    obj.update({
      system: {
        [param]: {
          value: parseInt(newValue),
        },
      },
    })
  }

  /**
   * Set an arbitrary parameter's value to zero.
   * @param {Event} event The triggering Event
   */
  _onClearValue(event) {
    event.preventDefault()
    let element = event.currentTarget
    let param = element.dataset.param

    if (element.dataset.type == 'item') {
      // Currently only used for NPC Principle tracks
      let dataset = element.closest('.item').dataset
      let itemId = dataset.itemId
      let item = this.actor.items.get(itemId)

      item.update({
        system: {
          [param]: {
            value: 0,
          },
        },
      })
    } else {
      this.actor.update({
        system: {
          [param]: {
            value: 0,
          },
        },
      })
    }
  }

  /**
   * Update the progress on a Growth Advancement track.
   *
   * This needed its own custom method due to nesting in the
   * object template.
   * @param {Event} event
   */
  _onSetAdvancementValue(event) {
    event.preventDefault()
    let element = event.currentTarget
    let name = element.dataset.param
    let checked = element.classList.contains('filled')
    let currentValue = this.actor.system.growth.advancements[name].value
    let newValue = checked ? currentValue - 1 : currentValue + 1

    this.actor.update({
      system: {
        growth: {
          advancements: {
            [name]: {
              value: newValue,
            },
          },
        },
      },
    })
  }

  /**
   * Clear the progress on a Growth Advancement track.
   *
   * This needed its own custom method due to nesting in the
   * object template.
   * @param {Event} event
   */
  _onClearAdvancement(event) {
    event.preventDefault()
    let element = event.currentTarget
    let name = element.dataset.param

    this.actor.update({
      system: {
        growth: {
          advancements: {
            [name]: {
              value: 0,
            },
          },
        },
      },
    })
  }

  /**
   * Toggle a Condition
   * @param {Event} event
   */
  _onConditionToggle(event) {
    event.preventDefault()

    let element = event.currentTarget
    let itemId = element.closest('.item').dataset.itemId
    let item = this.actor.items.get(itemId)

    let state = !item.system.checked

    item.update({
      system: { checked: state },
    })
  }

  /**
   * Add a new item to the Actor
   * @param {Event} event
   */
  _onItemCreate(event) {
    event.preventDefault()
    const element = event.currentTarget
    const itemType = element.dataset.itemType
    const defaultData = {}

    const itemData = {
      name: game.i18n.format('legends.items.new.name', { type: itemType }),
      type: itemType,
      data: {
        description: game.i18n.localize('legends.items.new.description'),
        ...defaultData,
      },
    }

    this.actor.createEmbeddedDocuments('Item', [itemData])
  }

  /**
   * Show the sheet for an Item
   * @param {Event} event
   */
  _onItemEdit(event) {
    event.preventDefault()
    let element = event.currentTarget
    let itemId = element.closest('.item').dataset.itemId
    let item = this.actor.items.get(itemId)

    item.sheet.render(true)
  }

  /**
   * Delete an owned item
   * @param {Event} event
   */
  _onItemDelete(event) {
    event.preventDefault()
    let element = event.currentTarget
    let itemId = element.closest('.item').dataset.itemId
    this.actor.deleteEmbeddedDocuments('Item', [itemId])
  }

  /**
   * Update the Proficiency level on an Actor's owned Technique
   * @param {Event} event
   */
  _onSetTechniqueProficiency(event) {
    event.preventDefault()
    let element = event.currentTarget
    let itemId = element.closest('.item').dataset.itemId
    let item = this.actor.items.get(itemId)
    let level = element.dataset.level

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
    item.update({
      system: {
        learned: true,
        practiced: practiced,
        mastered: mastered,
      },
    })
  }

  /**
   * Toggle the content drawer for a move or technique
   * @param {Event} event
   */
  _onToggleCollapsible(event) {
    event.preventDefault()

    const itemElement = event.currentTarget.closest('.item')
    const itemId = itemElement.dataset.itemId

    $(itemElement)
      .find('.drawer')
      .slideToggle({
        done: () => {
          this.toggleVisibility(itemId)
        },
      })
  }

  toggleVisibility(itemId) {
    const item = this.actor.items.get(itemId)

    if (item) {
      const visible = !item.system.visible ? false : true

      item.update({
        system: {
          visible: !visible,
        },
      })
    }
  }

  /**
   * Select move category to display
   * @param {Event} event
   */
  _onSelectMoveCategory(event) {
    this.actor.setFlag('legends', 'moveCategory', event.currentTarget.value)
  }

  /**
   * Apply a playbook to the Actor
   * @param {LegendsItem} playbook
   */
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
      .get('legends.common-items')
      .index.filter((item) => item.type === 'growth-question')
      .sort((a, b) => (a.name > b.name ? 1 : -1))

    for (const growthQuestion of growthQuestions) {
      const question = await fromUuid(
        `Compendium.legends.common-items.${growthQuestion._id}`,
      )
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

  /**
   * Delete items from an Actor based on their type
   * @param {Array} types An array of strings indicating the types to delete
   */
  deleteItemsByType(types) {
    const items = this.actor.items
      .filter((item) => types.includes(item.type))
      .map((item) => item.id)
    this.actor.deleteEmbeddedDocuments('Item', items)
  }
}
