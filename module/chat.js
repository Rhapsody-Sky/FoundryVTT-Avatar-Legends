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
  const character = game.user.character || canvas.tokens.controlled[0]?.actor
  if (character === undefined || character === null) {
    return ui.notifications.error(game.i18n.localize('legends.roll.no-actor'))
  }

  const move =
    game.items.getName(target.moveName) ||
    game.packs.get('legends.common-items').index.getName(target.moveName) ||
    game.packs.get('legends.playbooks').index.getName(target.moveName) ||
    game.packs.get('legends.wstag-playbooks').index.getName(target.moveName)

  if (!move)
    return ui.notifications.error(game.i18n.localize('legends.roll.no-move'))

  Dice.rollMove(move.uuid)
}
