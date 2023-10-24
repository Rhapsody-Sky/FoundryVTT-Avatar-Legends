import { filter_items, enrich } from './helpers.js'

export default class LegendsActor extends Actor {
  static getDefaultArtwork(data) {
    return {
      img: CONFIG.legends.defaultTokens[data.type],
      texture: { src: CONFIG.legends.defaultTokens[data.type] },
    }
  }

  async prepareData() {
    super.prepareData()

    if (this.type === 'player') {
      this.system.conditions = await filter_items(
        this.items,
        'condition',
        false,
      )
    }
    if (this.type !== 'npc') return

    const principles = await filter_items(this.items, 'npc-principle', false)
    if (principles.length > 0) {
      this.system.principle = principles[0].system.track
      this.system.principleName = principles[0].name
    }

    const conditions = await filter_items(this.items, 'condition', false)
    this.system.conditionNames = conditions.map((condition) => condition.name)

    const techniques = await filter_items(this.items, 'technique', false)
    this.system.techniqueUUIDs = techniques.map((technique) => technique.uuid)
  }

  getPrincipleValue(name) {
    const key = Object.keys(this.system.balance).find(
      (key) => this.system.balance[key] === name,
    )

    switch (key) {
      case 'topTrack':
        return this.system.balance.value
      case 'bottomTrack':
        return 0 - this.system.balance.value
      default:
        return null
    }
  }

  getConditionForMove(moveName) {
    const checkedConditions = this.system.conditions.filter(
      (condition) => condition.system.checked,
    )

    const condition = checkedConditions
      .map((condition) => {
        return {
          name: condition.name,
          penalty: Object.values(condition.system.affectedMoves).filter(
            (move) =>
              move.name.toLowerCase() === (moveName || '').toLowerCase(),
          )[0],
        }
      })
      .flat()
      .filter((c) => c.penalty !== undefined)
      .sort((a, b) => (a.penalty?.penalty < b.penalty?.penalty ? -1 : 1))[0]

    return condition
  }
}
