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
