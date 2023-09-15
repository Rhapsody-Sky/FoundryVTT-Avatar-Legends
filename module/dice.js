/**
 * Roll a Move by UUID
 * @param {String} uuid The Item's UUID
 * @returns null
 */
export const rollMove = async (uuid) => {
  const move = await fromUuid(uuid)
  const actor = move.parent || game.user.character

  const title = game.i18n.format('legends.roll.stat', {
    stat: move.name,
  })
  const rollOptions = await newGetRollOptions(actor, {
    title: title,
    move: move,
  })

  if (rollOptions.cancelled) return

  doRoll(actor, rollOptions, { move: move })
}

/**
 * Roll a Stat by name for a specific actor
 * @param {Object} actor The Actor to roll for
 * @param {String} stat The stat name to roll
 * @returns null
 */
export const rollStat = async (actor, stat) => {
  const title = game.i18n.format('legends.roll.stat', {
    stat: game.i18n.localize(`legends.stats.${stat}`),
  })
  const rollOptions = await newGetRollOptions(actor, {
    title: title,
    stat: stat,
  })

  if (rollOptions.cancelled) return

  doRoll(actor, rollOptions, { stat: stat })
}

export const rollApproach = async (actor, stat, approach) => {
  const title = game.i18n.format('legends.roll.stat', {
    stat: approach,
  })
  const rollOptions = await newGetRollOptions(actor, {
    title: title,
    stat: stat,
    approach: approach,
  })

  if (rollOptions.cancelled) return

  doRoll(actor, rollOptions, { stat: stat, approach: approach })
}

export const rollPrinciple = async (actor, principle) => {
  const title = game.i18n.format('legends.roll.stat', {
    stat: principle,
  })
  const rollOptions = await newGetRollOptions(actor, {
    title: title,
    principle: principle,
  })

  if (rollOptions.cancelled) return

  doRoll(actor, rollOptions, { principle: principle })
}

const newGetRollOptions = async (actor, options = {}) => {
  const template = 'systems/legends/templates/partials/dialog/roll-dialog.hbs'

  const move = options.move
  const principle = options.principle
  const stat = options.stat || move?.system?.rollStat
  const title = options.title || game.i18n.localize('legends.roll.no-stat')

  const statValue = principle
    ? actor.getPrincipleValue(principle)
    : actor.system.stats[stat]

  const condition = move ? actor.getConditionForMove(move?.name) : null

  const statName = principle
    ? principle
    : statValue !== undefined
    ? game.i18n.localize(`legends.stats.${stat}`)
    : ''

  const html = await renderTemplate(template, {
    statName: statName,
    moveName: move?.name,
    statValue: statValue,
    condition: condition,
  })

  return new Promise((resolve) => {
    const data = {
      title: title,
      content: html,
      buttons: {
        normal: {
          label: `<i class="fas fa-dice"></i> ${game.i18n.localize(
            'legends.roll.dialog.submit',
          )}`,
          callback: (html) => resolve(_processRollOptions(html)),
        },
        cancel: {
          label: `<i class="fas fa-times"></i> ${game.i18n.localize(
            'legends.dialog.cancel',
          )}`,
          callback: (_html) => resolve({ cancelled: true }),
        },
      },
      default: 'normal',
      close: () => resolve({ cancelled: true }),
    }
    new Dialog(data, { classes: ['dialog', 'legends-dialog'] }).render(true)
  })
}

const doRoll = async (actor, rollOptions, options = {}) => {
  const move = options.move
  const principle = options.principle
  const stat = move?.system?.rollStat || options.stat

  const statValue = principle
    ? actor.getPrincipleValue(principle)
    : actor.system.stats[stat]

  const statName =
    stat !== undefined
      ? principle
        ? principle
        : game.i18n.localize(`legends.stats.${stat}`)
      : null

  const condition = move ? actor.getConditionForMove(move?.name) : null

  const neg = statValue < 0
  const absStat = Math.abs(statValue || 0)

  const rollData = {
    oStat: neg ? '-' : '+',
    vStat: absStat,
  }

  // Basic roll formula
  let rollFormula = '2d6 @oStat @vStat'

  // Condition
  if (condition) {
    rollData.conditionValue = condition.penalty.penalty
    const conditionValue =
      condition.penalty.penalty >= 0 ? ' + @conditionValue' : ' @conditionValue'
    rollFormula += conditionValue
  }

  // If a non-zero bonus was set
  const bonus = rollOptions.bonus
  if (bonus != 0) {
    rollData.vBonus = Math.abs(bonus) // Ignore negatives
    rollFormula += ' + @vBonus' // Always add
  }

  // If a non-zero penalty was set
  const penalty = rollOptions.penalty
  if (penalty != 0) {
    rollData.vPenalty = Math.abs(penalty) // Ignore negatives
    rollFormula += ' - @vPenalty' // Always subtract
  }

  // Roll the dice and render the result
  const roll = new Roll(rollFormula, rollData)
  const rollResult = await roll.roll({ async: true })
  const renderedRoll = await rollResult.render()

  // Setup the roll template
  const messageTemplate =
    'systems/legends/templates/partials/chat/stat-roll.hbs'
  const templateContext = {
    name: statName,
    move: move?.name || options.approach,
    roll: renderedRoll,
    total: rollResult._total,
    approach: options.approach,
  }

  // Setup the chat message
  const chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    content: await renderTemplate(messageTemplate, templateContext),
    sound: CONFIG.sounds.dice,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
  }

  return ChatMessage.create(chatData)
}

/**
 * A callback to parse and format the values returned from the dialog
 * @param {String} html The HTML returned from the form
 * @returns A hash of the relevant values from the form.
 */
function _processRollOptions(html) {
  const form = html[0].querySelector('form')

  return {
    penalty: parseInt(form.penalty.value),
    bonus: parseInt(form.bonus.value),
  }
}
