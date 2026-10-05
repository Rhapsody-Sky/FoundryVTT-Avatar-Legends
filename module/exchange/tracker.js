import { legends } from '../config.js'
import LegendsExchange from './exchange.js'

const { CombatTracker } = foundry.applications.sidebar.tabs

export default class LegendsExchangeTracker extends CombatTracker {
  static PARTS = {
    header: {
      template: `${legends.rootPath}/templates/exchange/header.hbs`,
    },
    combatants: {
      template: `${legends.rootPath}/templates/exchange/combatants.hbs`,
      scrollable: [''],
    },
    footer: {
      template: `${legends.rootPath}/templates/exchange/footer.hbs`,
    },
  }

  static DEFAULT_OPTIONS = {
    classes: ['legends', 'sidebar', 'exchange', 'flexcol', 'gap-0'],
    actions: {
      addExchange: this.#addExchange,
      startExchange: this.#startExchange,
      endExchange: this.#endExchange,
      nextPhase: this.#nextPhase,
      prevPhase: this.#prevPhase,
      nextRound: this.#nextRound,
      prevRound: this.#prevRound,
      setApproach: this.#setCombatantApproach,
      rollStance: this.#rollStance,
    },
  }

  async _prepareContext(options) {
    const { round, turn, combatants, combatant, current, currentPhase } = this.viewed || {}
    const context = {
      ...(await super._prepareContext(options)),
      current,
      round,
      turns: this.viewed?.combatantsForApproach(),
      turn,
      combatants,
      combatant,
      currentPhase,
      config: legends,
    }

    context.phase = this.currentPhase
    context.filteredTurns = this.filterTurns(this.viewed)

    if (context.filteredTurns?.length > 0) {
      context.turnsByApproach = {}
      for (const approach of ['defend-maneuver', 'advance-attack', 'evade-observe']) {
        context.turnsByApproach[approach] = this.viewed.combatantsForApproach(approach)
      }
    }
    return context
  }

  get activeCombat() {
    return this.combats.filter((combat) => combat.active)[0]
  }

  get currentPhase() {
    return this.viewed?.currentPhase
  }

  filterTurns(conflict) {
    if (!conflict) return
    let { turns } = conflict
    if (!game.user.isGM) turns = turns.filter((turn) => !turn.hidden)

    return turns
  }

  // #region context menus
  _getEntryContextOptions() {
    const getCombatant = (target) => this.viewed.combatants.get(target.dataset.combatantId)

    return [
      {
        icon: 'fas fa-edit',
        label: 'COMBATANT.ACTIONS.Update',
        onClick: (_e, target) => getCombatant(target)?.sheet?.render({ force: true }),
        visible: () => game.user.isGM,
      },
      {
        icon: 'fas fa-dice',
        label: 'legends.exchange.clear-stance',
        onClick: (_e, target) => getCombatant(target)?.resetStance(),
        visible: () => game.user.isGM,
      },
      {
        icon: 'fas fa-trash',
        label: 'COMBATANT.ACTIONS.Remove',
        onClick: (_e, target) => getCombatant(target)?.delete(),
        visible: () => game.user.isGM,
      },
    ]
  }
  // #endregion

  // #region Actions
  static async #addExchange(event, _target) {
    event.preventDefault()
    new LegendsExchange().sheet.render({ force: true })
  }

  static async #startExchange(event, _target) {
    event.preventDefault()
    this.viewed.startCombat()
  }

  static async #endExchange(event, _target) {
    event.preventDefault()
    this.viewed?.endCombat()
  }

  static async #nextPhase(event, target) {
    event.preventDefault()
    this.viewed.nextPhase()
  }

  static async #prevPhase(event, target) {
    event.preventDefault()
    this.viewed.prevPhase()
  }

  static async #nextRound(event, _t) {
    event.preventDefault()
    if (!this.activeCombat) return
    this.viewed.nextRound()
  }

  static async #prevRound(event, _t) {
    event.preventDefault()
    if (!this.viewed) return
    this.viewed.prevRound()
  }

  static async #setCombatantApproach(event, target) {
    event.preventDefault()
    if (!this.currentPhase == 'choose') return

    const { combatantId, approach } = target.dataset
    const combatant = this.viewed.combatants.get(combatantId)

    if (combatant && (combatant.isOwner || game.user.isGM)) {
      if (Object.keys(legends.approaches).includes(approach)) {
        await combatant.setApproach(approach)
      }
    }
  }

  static async #rollStance(event, target) {
    event.preventDefault()
    const { combatantId } = target.dataset
    const combatant = this.viewed.combatants.get(combatantId)

    if (combatant && (combatant.isOwner || game.user.isGM)) {
      combatant.rollStance()
    }
  }

  /* from Foundry core */
  static async #onEditName() {
    const combat = this.viewed
    if (!combat || !game.user.isGM) return null
    const field = combat.schema.fields.name
    const inputHTML = field.toFormGroup({}, { name: 'name', value: combat.name, autofocus: true }).outerHTML
    const formData = await foundry.applications.api.DialogV2.input({
      window: { icon: 'fa-solid fa-tag', title: 'COMBAT.ACTIONS.EditNameTitle' },
      position: { width: 480 },
      content: inputHTML,
    })
    if (formData) await combat.update({ name: formData.name || '' })
  }
  // #endregion
}
