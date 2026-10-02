import { legends } from './config.js'
import { enrich } from './helpers.js'

export default class LegendsActorV2 extends Actor {
  static getDefaultArtwork(data) {
    return {
      img: legends.defaultTokens[data.type],
      texture: { src: legends.defaultTokens[data.type] },
    }
  }

  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user)
    if (allowed === false) return false

    let prototypeToken = {}

    switch (data.type) {
      case 'player':
        prototypeToken = {
          sight: { enabled: true },
          actorLink: true,
          disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
          displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
        }
        break

      case 'npc':
        prototypeToken = {
          sight: { enabled: true },
          actorLink: false,
          disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
          displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
        }
        break

      case 'campaign':
        prototypeToken = {
          sight: { enabled: true },
          actorLink: true,
          disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
          displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        }
        break
    }

    return this.updateSource({ prototypeToken })
  }

  async prepareData() {
    super.prepareData()

    switch (this.type) {
      case 'player':
        this.system.conditions = this.itemTypes.condition
        break
      case 'npc':
        this.system.conditionNames = this.itemTypes.condition.map((condition) => condition.name)
        this.system.techniqueUUIDs = this.itemTypes.technique.map((technique) => technique.uuid)
        this.system.principle = this.itemTypes['npc-principle'][0]
        this.system.enrichedDescription = await enrich(this.system.description)
        break
      default:
        break
    }
  }

  getConditionForMove(moveName) {
    const checkedConditions = this.system.conditions?.filter((condition) => condition.system.checked)

    const condition = checkedConditions
      .map((condition) => {
        return {
          name: condition.name,
          description: condition.system.description,
          penalty: Object.values(condition.system.affectedMoves).filter(
            (move) => move.name.toLowerCase() === (moveName || '').toLowerCase(),
          )[0],
        }
      })
      .flat()
      .filter((c) => c.penalty !== undefined)
      .sort((a, b) => (a.penalty?.penalty < b.penalty?.penalty ? -1 : 1))[0]

    return condition
  }

  getPrincipleValue(name) {
    const key = Object.keys(this.system.balance).find((key) => this.system.balance[key] === name)

    switch (key) {
      case 'topTrack':
        return this.system.balance.value
      case 'bottomTrack':
        return 0 - this.system.balance.value
      default:
        return null
    }
  }
}
