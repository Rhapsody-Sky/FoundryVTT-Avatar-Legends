import { legends } from '../config.js'

export default class LegendsExchange extends Combat {
  async startCombat() {
    await super.startCombat()
    for (const combatant of this.combatants) {
      combatant.resetApproach()
    }
  }

  get currentPhase() {
    return this.getFlag('avatar-legends', 'exchangePhase') || legends.exchangePhases[0]
  }

  get combatant() {
    null
  }

  async setPhase(phase) {
    await this.setFlag('avatar-legends', 'exchangePhase', phase)
  }

  async prevPhase() {
    const currentIndex = legends.exchangePhases.indexOf(this.currentPhase)
    const phaseIndex = currentIndex - 1
    if (phaseIndex < 0) await this.previousRound()
    if (this.round > 0) {
      const previousIndex = (legends.exchangePhases.length + phaseIndex) % legends.exchangePhases.length
      this.setPhase(legends.exchangePhases[previousIndex])
    }
  }

  async nextPhase() {
    const currentIndex = legends.exchangePhases.indexOf(this.currentPhase)
    const phaseIndex = currentIndex + 1
    if (phaseIndex >= legends.exchangePhases.length) await this.nextRound()
    const nextIndex = phaseIndex % legends.exchangePhases.length
    this.setPhase(legends.exchangePhases[nextIndex])
  }

  async nextRound() {
    await super.nextRound()
    await this.setPhase(legends.exchangePhases[0])
    for (const combatant of this.combatants) {
      combatant.resetApproach()
    }
  }

  async prevRound() {
    await super.previousRound()
    await this.setPhase(legends.exchangePhases[0])
    for (const combatant of this.combatants) {
      combatant.resetApproach()
    }
  }

  combatantsForApproach(approach = null) {
    let combatants = this.combatants.filter((c) => (game.user.isGM ? true : !c.hidden))
    if (approach) {
      combatants = combatants.filter((combatant) => combatant.currentPhase == approach)
    }
    let players = combatants.filter((combatant) => combatant.isPlayer).sort((a, b) => (a.name > b.name ? 1 : -1))
    let npcs = combatants.filter((combatant) => combatant.isNpc).sort((a, b) => (a.name > b.name ? 1 : -1))
    return players.concat(npcs)
  }
}
