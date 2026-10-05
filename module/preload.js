import { legends } from './config.js'
import { enrichInlineMove, enrichInlineTechnique, enrichNpc, enrichSkillName, trainingIcon } from './helpers.js'
const { loadTemplates } = foundry.applications.handlebars

export const preloadHandlebarsTemplates = () => {
  const templatePaths = [
    `${legends.rootPath}/templates/exchange/_approach.hbs`,
    `${legends.rootPath}/templates/exchange/_combatant.hbs`,
    `${legends.rootPath}/templates/partials/checkbox.hbs`,
    `${legends.rootPath}/templates/partials/v2/description.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_balance.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_condition.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_conditions.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_fatigue.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_move.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_stats.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_stat.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_status.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_statuses.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/player/_technique.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/npc/_condition.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/npc/_principle.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/npc/_status.hbs`,
    `${legends.rootPath}/templates/sheets/actors/v2/npc/_technique.hbs`,
    `${legends.rootPath}/templates/sheets/items/v2/_condition.hbs`,
    `${legends.rootPath}/templates/sheets/items/v2/_move.hbs`,
    `${legends.rootPath}/templates/sheets/items/v2/_npc-principle.hbs`,
    `${legends.rootPath}/templates/sheets/items/v2/_status.hbs`,
    `${legends.rootPath}/templates/sheets/items/v2/_technique.hbs`,
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
    {
      // skill name
      pattern: /#\[(.+?)\]/gm,
      enricher: async (match) => await enrichSkillName(match),
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

  Handlebars.registerHelper('drawer', function (item) {
    let result = `<div class="drawer" id="drawer-${item.id}"  style="${item.system.visible ? '' : 'display: none;'}">`
    result += item.system.enrichedDescription
    result += `</div>`
    return result
  })

  Handlebars.registerHelper('modulus', (mod, index, content) => (index % mod == 0 ? content : null))
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
          approach: game.i18n.localize('legends.techniques.approaches.defend-maneuver'),
          stat: 'focus',
          name: game.i18n.localize('legends.stats.focus'),
        }
        break
      case 'advance-attack':
        params = {
          approach: game.i18n.localize('legends.techniques.approaches.advance-attack'),
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
  Handlebars.registerHelper('template', (path) => {
    return `${legends.rootPath}/templates/${path}`
  })
  Handlebars.registerHelper('trainingIcon', (training, cssClasses = null) => {
    return trainingIcon(training, cssClasses)
  })
  Handlebars.registerHelper('not', (condition) => !condition)
  Handlebars.registerHelper('mod', (num, div) => num % div)
  Handlebars.registerHelper('join', (array, glue) => array.join(glue))
  Handlebars.registerHelper('plusOne', (value) => parseInt(value) + 1)
  Handlebars.registerHelper('any', (array) => (array?.length || array?.size) > 0)
  Handlebars.registerHelper('format', (path, options) => game.i18n.format(path, { ...options?.hash }))
  Handlebars.registerHelper('length', (array) => array.length)
}
