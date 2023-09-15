import * as Dice from './dice.js'

/**
 * Catch interactions with Chat messages
 * @param {Text} html
 */
export function addChatListeners(html) {
  html.on('click', '.move-roll', onMoveRoll)
}

/**
 * Roll a stat from a chat-based Move card
 * @param {Event} event
 */
function onMoveRoll(event) {
  event.preventDefault()

  const target = event.currentTarget.dataset
  const character = game.user.character
  if (character === undefined || character === null) {
    let message = game.i18n.localize('legends.roll.no-actor')
    ui.notifications.error(message)
    return
  }

  const move =
    game.items.getName(target.moveName) ||
    game.packs.get('legends.common-items').index.getName(target.moveName)

  Dice.rollMove(move.uuid)
}
