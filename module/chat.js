import * as Dice from './dice.js'

/**
 * Catch interactions with Chat messages
 * @param {Text} html
 */
export function addChatListeners(html) {
  html = $(html)
  html.on('click', '[data-action="rollMove"]', async (event) => await onMoveRoll(event))
}

/**
 * Roll a stat from a chat-based Move card
 * @param {Event} event
 */
async function onMoveRoll(event) {
  event.preventDefault()
  const { moveName } = event.currentTarget.dataset

  const actor = game.user.character
  if (!actor) {
    ui.notifications.error('You need an actor to do this')
    game.user.sheet.render({ force: true })
    return
  }

  const move = actor.itemTypes.move.filter((m) => m.name == moveName)[0]
  if (!move) {
    ui.notifications.error("Your actor doesn't have this move")
    return
  }

  await Dice.rollMove(move.uuid)
}

export const showArchiveMessage = async () => {
  const chatData = {
    user: game.user._id,
    whisper: [game.user._id],
    speaker: ChatMessage.getSpeaker(),
    style: 0,
    content: `
    <h3 class="font-title color-accent-mid">Avatar Legends — continued development</h3>
    <p>This community fork continues Paul Cosgrove's (demondownload) unofficial Avatar Legends system.</p>
    <p>The original maintainer announced v2.0.0 as the final major update. See the <a href="https://gitlab.com/pacosgrove1/legends/-/wikis/Archive-Notice">original archive notice</a>.</p>
    <p>Find updates and support in <a href="https://github.com/Rhapsody-Sky/FoundryVTT-Avatar-Legends">this project's repository</a>. Thank you to the original author and contributors!</p>
    `,
  }
  return ChatMessage.create(chatData)
}
