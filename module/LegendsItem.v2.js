import { legends } from './config.js'
import { enrich } from './helpers.js'

const { renderTemplate } = foundry.applications.handlebars

export default class LegendsItemV2 extends Item {
  static getDefaultArtwork(data) {
    return {
      img: legends.defaultTokens[data.type],
      texture: { src: legends.defaultTokens[data.type] },
    }
  }

  async prepareData() {
    super.prepareData()

    this.system.enrichedDescription = await enrich(this.system.description)
  }

  async toChatMessage() {
    let content = await renderTemplate(this.chatMessageTemplate, await this.chatMessageContext())

    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content,
    }
    ChatMessage.applyMode(chatData, game.settings.get('core', 'messageMode'))
    ChatMessage.create(chatData)
  }

  get chatMessageTemplate() {
    return `${legends.rootPath}/templates/chat/v2/item.hbs`
  }

  async chatMessageContext() {
    return {
      name: this.name,
      type: this.type,
      system: {
        ...this.system,
        enrichedDescription: await enrich(this.system.description),
      },
    }
  }
}
