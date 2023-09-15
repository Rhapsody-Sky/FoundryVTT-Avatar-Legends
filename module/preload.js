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
  ])
}

const enrichInlineMove = async (match) => {
  const uuid = match[1]
  const item = await fromUuid(uuid)
  const itemName = match[2] ?? item.name

  const container = document.createElement('div')
  container.className = 'inline-item'
  let html = ''
  if (item) {
    html = `<h3>@UUID[${uuid}]{${itemName}}</h3>${item.system.description}`
  } else {
    html = `@UUID[${uuid}]{${itemName}}`
  }

  container.innerHTML = await TextEditor.enrichHTML(html, { async: true })
  return container
}

const enrichInlineTechnique = async (match) => {
  const uuid = match[1]
  const item = await fromUuid(uuid)
  const itemName = match[2] ?? item.name

  const container = document.createElement('div')
  container.className = 'inline-item'
  let html = ''
  if (item) {
    html = `<h3>@UUID[${uuid}]{${itemName}} <small>${game.i18n.localize(
      `legends.techniques.approaches.${item.system.approach}`,
    )}</small></h3>`
    html += item.system.description
  } else {
    html = `@UUID[${uuid}]{${itemName}}`
  }

  container.innerHTML = await TextEditor.enrichHTML(html, { async: true })
  return container
}
