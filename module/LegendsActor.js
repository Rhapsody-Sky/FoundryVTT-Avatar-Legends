import { filter_items } from './helpers.js'

export default class LegendsActor extends Actor {
  static getDefaultArtwork(data) {
    return {
      img: CONFIG.legends.defaultTokens[data.type],
      texture: { src: CONFIG.legends.defaultTokens[data.type] },
    }
  }

  prepareData() {
    super.prepareData()
    if (this.type !== 'npc') return

    const principle = filter_items(this.items, 'npc-principle')[0]
    if (principle) {
      this.system.principle = principle.system.track
    }
  }
}
