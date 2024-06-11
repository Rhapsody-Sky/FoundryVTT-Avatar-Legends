import {
  enrichInlineMove,
  enrichInlineTechnique,
  enrichNpc,
} from './helpers.js'

export const preloadHandlebarsTemplates = () => {
  const templatePaths = [
    'systems/legends/templates/partials/description-editor.hbs',
    'systems/legends/templates/partials/move-card.hbs',
    'systems/legends/templates/partials/condition-card.hbs',
    'systems/legends/templates/partials/status-card.hbs',
    'systems/legends/templates/partials/technique-card.hbs',
    'systems/legends/templates/partials/growth-question-card.hbs',
    'systems/legends/templates/partials/labelled-input.hbs',
    'systems/legends/templates/partials/npc-principle-card.hbs',
    'systems/legends/templates/sheets/actors/_balance.hbs',
    'systems/legends/templates/sheets/actors/_fatigue.hbs',
    'systems/legends/templates/sheets/actors/_stats.hbs',
    'systems/legends/templates/sheets/actors/_trainings.hbs',
    'systems/legends/templates/partials/checkbox.hbs',
    'templates/dice/roll.html',
  ]

  return loadTemplates(templatePaths)
}

export const setupEnrichers = () => {
  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      // Move
      pattern: /@InlineMove\[(.+?)\](?:{(.+?)})?/gm,
      enricher: async (match) => await enrichInlineMove(match),
    },
    {
      // Technique
      pattern: /@InlineTechnique\[(.+?)\](?:{(.+?)})?/gm,
      enricher: async (match) => await enrichInlineTechnique(match),
    },
    {
      // NPC
      pattern: /@InlineNpc\[(.+?)\](?:{(.+?)})?/gm,
      enricher: async (match) => await enrichNpc(match),
    },
  ])
}

export const registerHandlebarsHelpers = () => {
  Handlebars.registerHelper('times', function (n, content) {
    let result = ''
    for (let i = 0; i < n; i++) {
      content.data.index = i + 1
      result += content.fn(i)
    }
    return result
  })

  Handlebars.registerHelper('modulus', (mod, index, content) =>
    index % mod == 0 ? content : null,
  )
  Handlebars.registerHelper(
    'moveCategoryVisible',
    (category, movesVisible) => category === '' || movesVisible[category],
  )
  Handlebars.registerHelper('tr_path', (path, key) => path + '.' + key)
  Handlebars.registerHelper('getByKey', (object, key) => object[key])
  Handlebars.registerHelper('lengthByKey', (object, key) => object[key].length)
  Handlebars.registerHelper('eraDisplayName', (name) =>
    game.i18n.format('legends.actor-sheet.campaign.eras.eraDisplayName', {
      name: game.i18n.localize(name),
      era: game.i18n.localize('legends.actor-sheet.campaign.eras.era'),
    }),
  )

  Handlebars.registerHelper('rollApproach', (approach) => {
    let path = 'legends.roll.with'
    let params = {}
    switch (approach) {
      case 'defend-maneuver':
        params = {
          approach: game.i18n.localize(
            'legends.techniques.approaches.defend-maneuver',
          ),
          stat: 'focus',
          name: game.i18n.localize('legends.stats.focus'),
        }
        break
      case 'advance-attack':
        params = {
          approach: game.i18n.localize(
            'legends.techniques.approaches.advance-attack',
          ),
          stat: 'passion',
          name: game.i18n.localize('legends.stats.passion'),
        }
        break
      default:
        path = 'legends.roll.evade-observe'
        params = {}
        break
    }
    return game.i18n.format(path, params)
  })
}
