import { newRollApproach } from '../dice.js'

export default class LegendsCombatant extends Combatant {
  async setApproach(approach) {
    await this.setFlag('legends', 'exchangePhase', approach)
  }

  async resetApproach() {
    this.setFlag('legends', 'exchangePhase', null)
    this.resetStance()
  }

  async rollStance() {
    if (this.isNpc) return
    if (this.currentPhase) {
      const result = await newRollApproach(this.actor, this.currentPhase)
      await this.setFlag('legends', 'stanceRoll', result.total)
      await this.update({ initiative: result.total })
    }
  }

  async resetStance() {
    if (this.isNpc) return
    this.setFlag('legends', 'stanceRoll', null)
    this.update({ initiative: null })
  }

  get rollResult() {
    switch (this.actor.type) {
      case 'npc':
        return this.actor.npcPrinciple + 1
      case 'player':
        if (this.initiative) {
          if (this.initiative >= 10) {
            return 'full'
          } else if (this.initiative >= 7) {
            return 'hit'
          } else {
            return 'miss'
          }
        }
        return null
      default:
        break
    }
  }

  get currentPhase() {
    return this.getFlag('legends', 'exchangePhase')
  }

  get effects() {
    return this.actor.effects
  }

  get canView() {
    return this.actor.type == 'player' || game.user.isGM
  }

  get canRoll() {
    return this.actor.isOwner || game.user.isGM
  }

  get isPlayer() {
    return this.actor.type == 'player'
  }
  get isNpc() {
    return this.actor.type == 'npc'
  }
}
