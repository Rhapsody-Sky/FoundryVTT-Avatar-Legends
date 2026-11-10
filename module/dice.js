import { legends } from './config.js'
import * as DialogV2 from './dialog.v2.js'

const { renderTemplate } = foundry.applications.handlebars

/**
 * Roll a Move by UUID
 * @param {String} uuid The Item's UUID
 * @returns null
 */
export const rollMove = async (uuid) => {
  const move = await fromUuid(uuid)
  const actor = move.parent || game.user.character || canvas.tokens.controlled[0]?.actor

  const template = 'systems/avatar-legends/templates/dialog/v2/roll.hbs'

  const title = game.i18n.format('legends.roll.stat', {
    stat: move.name,
  })

  const stat = move?.system?.rollStat

  let statValue = undefined
  let statName = undefined
  let principle = false
  let principles = []

  if (stat) {
    switch (stat) {
      case 'principle':
        principle = true
        const { bottomTrack, topTrack, value } = actor.system.balance
        principles = {
          [bottomTrack]: -value,
          [topTrack]: value,
        }
        break
      default:
        statValue = actor.system.stats[stat]
        statName = statValue !== undefined ? game.i18n.localize(`legends.stats.${stat}`) : ''
        break
    }
  }
  const condition = move ? actor.getConditionForMove(move?.name) : null

  const data = {
    statName,
    statValue,
    condition,
    principle,
    principles,
  }

  const fields = ['bonus', 'penalty', 'principle']

  const rollOptions = await DialogV2.rollDialog(title, template, data, fields)
  if (!rollOptions || rollOptions == 'cancel') return
  if (principle && !rollOptions.values?.principle) {
    ui.notifications.warn(game.i18n.localize('legends.roll.principle-required'))
    return
  }

  doRoll(actor, rollOptions.values, { move })
}

/**
 * Roll a Stat by name for a specific actor
 * @param {Object} actor The Actor to roll for
 * @param {String} stat The stat name to roll
 * @returns null
 */
export const rollStat = async (actor, stat, options = {}) => {
  const template = 'systems/avatar-legends/templates/dialog/v2/roll.hbs'
  const title =
    options.title ??
    game.i18n.format('legends.roll.stat', {
      stat: game.i18n.localize(`legends.stats.${stat}`),
    })

  const statValue = actor.system.stats[stat]
  const statName = statValue !== undefined ? game.i18n.localize(`legends.stats.${stat}`) : ''
  const data = { statName, statValue }

  const fields = ['bonus', 'penalty']

  const rollOptions = await DialogV2.rollDialog(title, template, data, fields)
  if (!rollOptions || rollOptions == 'cancel') return

  doRoll(actor, rollOptions.values, { stat })
}

/**
 *
 * @param {Object} actor The Actor to roll for
 * @param {String} stat The Stat used by this Approach
 * @param {String} approach The name of the Approach
 * @returns Promise
 */
export const rollApproach = async (actor, stat, approach) => {
  const template = 'systems/avatar-legends/templates/dialog/v2/roll.hbs'
  const title = game.i18n.format('legends.roll.stat', {
    stat: approach,
  })

  const statValue = actor.system.stats[stat]
  const statName = statValue !== undefined ? game.i18n.localize(`legends.stats.${stat}`) : ''
  const data = { statName, statValue }
  const fields = ['bonus', 'penalty']

  const rollOptions = await DialogV2.rollDialog(title, template, data, fields)
  if (!rollOptions || rollOptions == 'cancel') return

  doRoll(actor, rollOptions.values, { stat: stat, approach: approach })
}

export const newRollApproach = async (actor, approach) => {
  if (!actor || !approach) return

  const approachName = game.i18n.localize(`legends.exchange.${approach}`)
  const title = game.i18n.format('legends.roll.stat', {
    stat: approachName,
  })

  const template = 'systems/avatar-legends/templates/dialog/v2/approach.hbs'
  const stats = legends.approachStats[approach].map((stat) => ({
    key: stat,
    name: game.i18n.localize(`legends.stats.${stat}`),
    value: actor.system.stats[stat],
  }))

  const data = { stats }
  const fields = ['stat', 'bonus', 'penalty']
  const rollOptions = await DialogV2.rollDialog(title, template, data, fields)
  if (!rollOptions || rollOptions == 'cancel') return

  const rollResult = await doRoll(actor, rollOptions.values, { stat: rollOptions.values.stat, approach: approachName })
  return rollResult.rolls[0]
}

export const rollPrinciple = async (actor, principle) => {
  const template = 'systems/avatar-legends/templates/dialog/v2/roll.hbs'
  const title = game.i18n.format('legends.roll.stat', {
    stat: principle,
  })

  const { bottomTrack, topTrack, value } = actor.system.balance
  const principles = {
    [bottomTrack]: -value,
    [topTrack]: value,
  }

  const data = { principle, principles }
  const fields = ['bonus', 'penalty', 'principle']

  const rollOptions = await DialogV2.rollDialog(title, template, data, fields)
  if (!rollOptions || rollOptions == 'cancel') return
  if (!rollOptions.values?.principle) {
    ui.notifications.warn(game.i18n.localize('legends.roll.principle-required'))
    return
  }

  doRoll(actor, rollOptions.values, { principle })
}

export const doRoll = async (actor, rollOptions, options = {}) => {
  const move = options.move
  const principle = rollOptions.principle ?? options.principle
  const stat = move?.system?.rollStat || options.stat || principle
  const statValue = principle ? actor.getPrincipleValue(principle) : actor.system.stats[stat]
  const statName = stat !== undefined ? (principle ? principle : game.i18n.localize(`legends.stats.${stat}`)) : null
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
    const conditionValue = condition.penalty.penalty >= 0 ? ' + @conditionValue' : ' @conditionValue'
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
  const messageTemplate = 'systems/avatar-legends/templates/chat/v2/roll.hbs'
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
    speaker: ChatMessage.getSpeaker({ actor }),
    roll: rollResult,
    rolls: [roll],
    content: await renderTemplate(messageTemplate, templateContext),
  }
  ChatMessage.applyMode(chatData, game.settings.get('core', 'messageMode'))
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
  dice3d.addSystem({ id: 'legends-air', name: game.i18n.localize('legends.training.air') }, 'default')
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/avatar-legends/images/dice/air.webp'],
    bumpMaps: [, , , , , 'systems/avatar-legends/images/dice/air-b.webp'],
    system: 'legends-air',
    colorset: 'airbending',
  })

  dice3d.addSystem({ id: 'legends-earth', name: game.i18n.localize('legends.training.earth') }, 'default')
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/avatar-legends/images/dice/earth.webp'],
    bumpMaps: [, , , , , 'systems/avatar-legends/images/dice/earth-b.webp'],
    system: 'legends-earth',
    colorset: 'earthbending',
  })

  dice3d.addSystem({ id: 'legends-fire', name: game.i18n.localize('legends.training.fire') }, 'default')
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/avatar-legends/images/dice/fire.webp'],
    bumpMaps: [, , , , , 'systems/avatar-legends/images/dice/fire-b.webp'],
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
    labels: ['1', '2', '3', '4', '5', 'systems/avatar-legends/images/dice/tech.webp'],
    bumpMaps: [, , , , , 'systems/avatar-legends/images/dice/tech-b.webp'],
    system: 'legends-tech',
    colorset: 'technology',
  })

  dice3d.addSystem({ id: 'legends-water', name: game.i18n.localize('legends.training.water') }, 'default')
  dice3d.addDicePreset({
    type: 'd6',
    labels: ['1', '2', '3', '4', '5', 'systems/avatar-legends/images/dice/water.webp'],
    bumpMaps: [, , , , , 'systems/avatar-legends/images/dice/water-b.webp'],
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
    labels: ['1', '2', '3', '4', '5', 'systems/avatar-legends/images/dice/weapon.webp'],
    bumpMaps: [, , , , , 'systems/avatar-legends/images/dice/weapon-b.webp'],
    system: 'legends-weapons',
    colorset: 'weapons',
  })
}
