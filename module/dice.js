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
    rolls: [roll],
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

export const registerDiceSoNice = (dice3d) => {
  const diceDefaults = {
    category: 'Avatar Legends',
    foreground: '#111111',
    outline: '#F3EFDC',
    visibility: 'visible',
    font: 'Village',
  }

  // Colorsets
  dice3d.addColorset(
    {
      ...diceDefaults,
      name: 'airbending',
      description: game.i18n.localize('legends.training.air'),
      background: '#D4B450',
      edge: '#D4B450',
    },
    'default',
  )

  dice3d.addColorset(
    {
      ...diceDefaults,
      name: 'earthbending',
      description: game.i18n.localize('legends.training.earth'),
      background: '#3C6733',
      edge: '#3C6733',
    },
    'default',
  )

  dice3d.addColorset(
    {
      ...diceDefaults,
      name: 'firebending',
      description: game.i18n.localize('legends.training.fire'),
      background: '#B62127',
      edge: '#B62127',
    },
    'default',
  )

  dice3d.addColorset(
    {
      ...diceDefaults,
      name: 'technology',
      description: game.i18n.localize('legends.training.technology'),
      background: '#6A2E7E',
      edge: '#6A2E7E',
    },
    'default',
  )

  dice3d.addColorset(
    {
      ...diceDefaults,
      name: 'waterbending',
      description: game.i18n.localize('legends.training.water'),
      background: '#4D63A9',
      edge: '#4D63A9',
    },
    'default',
  )

  dice3d.addColorset(
    {
      ...diceDefaults,
      name: 'weapons',
      description: game.i18n.localize('legends.training.weapons'),
      background: '#4D4D4F',
      edge: '#4D4D4F',
    },
    'default',
  )

  // Systems and presets
  dice3d.addSystem(
    { id: 'legends-air', name: game.i18n.localize('legends.training.air') },
    'default',
  )
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/legends/images/dice/air.webp'],
    bumpMaps: [, , , , , 'systems/legends/images/dice/air-b.webp'],
    system: 'legends-air',
    colorset: 'airbending',
  })

  dice3d.addSystem(
    { id: 'legends-earth', name: game.i18n.localize('legends.training.earth') },
    'default',
  )
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/legends/images/dice/earth.webp'],
    bumpMaps: [, , , , , 'systems/legends/images/dice/earth-b.webp'],
    system: 'legends-earth',
    colorset: 'earthbending',
  })

  dice3d.addSystem(
    { id: 'legends-fire', name: game.i18n.localize('legends.training.fire') },
    'default',
  )
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/legends/images/dice/fire.webp'],
    bumpMaps: [, , , , , 'systems/legends/images/dice/fire-b.webp'],
    system: 'legends-fire',
    colorset: 'firebending',
  })

  dice3d.addSystem(
    {
      id: 'legends-tech',
      name: game.i18n.localize('legends.training.technology'),
    },
    'default',
  )
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/legends/images/dice/tech.webp'],
    bumpMaps: [, , , , , 'systems/legends/images/dice/tech-b.webp'],
    system: 'legends-tech',
    colorset: 'technology',
  })

  dice3d.addSystem(
    { id: 'legends-water', name: game.i18n.localize('legends.training.water') },
    'default',
  )
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/legends/images/dice/water.webp'],
    bumpMaps: [, , , , , 'systems/legends/images/dice/water-b.webp'],
    system: 'legends-water',
    colorset: 'waterbending',
  })

  dice3d.addSystem(
    {
      id: 'legends-weapons',
      name: game.i18n.localize('legends.training.weapons'),
    },
    'default',
  )
  dice3d.addDicePreset({
    type: 'd6',
    labels: [
      '1',
      '2',
      '3',
      '4',
      '5',
      'systems/legends/images/dice/weapon.webp',
    ],
    bumpMaps: [, , , , , 'systems/legends/images/dice/weapon-b.webp'],
    system: 'legends-weapons',
    colorset: 'weapons',
  })
}
