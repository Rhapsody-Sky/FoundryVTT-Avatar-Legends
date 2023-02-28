import { filter_items } from './helpers.js'

export default class LegendsActor extends Actor {
  _preCreate(data, _options, _userId) {
    const img = CONFIG.legends.defaultTokens[data.type]
    this.updateSource({ img: img })
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
