import { legends } from './module/config.js'
import LegendsItem from './module/LegendsItem.js'
import LegendsActor from './module/LegendsActor.js'
import LegendsActorSheet from './module/sheets/LegendsActorSheet.js'
import LegendsNpcActorSheet from './module/sheets/LegendsNpcActorSheet.js'
import LegendsCampaignActorSheet from './module/sheets/LegendsCampaignActorSheet.js'
import LegendsItemSheet from './module/sheets/LegendsItemSheet.js'
import LegendsNpcPrincipleSheet from './module/sheets/LegendsNpcPrincipleSheet.js'
import LegendsPlaybookSheet from './module/sheets/LegendsPlaybookSheet.js'
import preloadHandlebarsTemplates from './module/preload.js'
import * as Chat from './module/chat.js'
import * as Migrations from './module/migrations.js'
import LegendsJournalSheet from './module/sheets/LegendsJournalSheet.js'

function registerSystemSettings() {
  game.settings.register('legends', 'systemMigrationVersion', {
    config: false,
    scope: 'world',
    type: String,
    default: '',
  })

  game.settings.register('legends', 'tabbedPlayerSheet', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.tabbedPlayerSheet.label',
    hint: 'SETTINGS.tabbedPlayerSheet.hint',
    type: Boolean,
    default: true,
  })

  game.settings.register('legends', 'sheetColour', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.sheetColour.label',
    hint: 'SETTINGS.sheetColour.hint',
    type: String,
    choices: {
      default: 'SETTINGS.sheetColour.default',
      quickstart: 'SETTINGS.sheetColour.quickstart',
    },
    default: 'default',
  })

  game.settings.register('legends', 'playerNotes', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.playerNotes.label',
    hint: 'SETTINGS.playerNotes.hint',
    type: Boolean,
    default: false,
  })

  game.settings.register('legends', 'start-collapsed', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.startCollapsed.label',
    hint: 'SETTINGS.startCollapsed.hint',
    type: Boolean,
    default: false,
  })
}

Hooks.once('init', function () {
  console.log(
    'legends | Initialising Avatar Legends RPG (Unofficial) system...',
  )

  // Config
  CONFIG.legends = legends
  CONFIG.Actor.documentClass = LegendsActor
  CONFIG.Item.documentClass = LegendsItem

  // Item sheets
  Items.registerSheet('legends', LegendsItemSheet, { makeDefault: true })
  Items.registerSheet('legends', LegendsNpcPrincipleSheet, {
    makeDefault: true,
    types: ['npc-principle'],
  })
  Items.registerSheet('legends', LegendsPlaybookSheet, {
    makeDefault: true,
    types: ['playbook'],
  })

  // Actor sheets
  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('legends', LegendsActorSheet, {
    types: ['player'],
    makeDefault: true,
  })
  Actors.registerSheet('legends', LegendsNpcActorSheet, {
    types: ['npc'],
    makeDefault: true,
  })
  Actors.registerSheet('legends', LegendsCampaignActorSheet, {
    types: ['campaign'],
    makeDefault: true,
  })

  // Journal sheet
  Journal.registerSheet('legends', LegendsJournalSheet, { makeDefault: true })

  preloadHandlebarsTemplates()
  registerSystemSettings()

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

  Handlebars.registerHelper('enrichHTML', (html) => {
    return TextEditor.enrichHTML(html, { async: false })
  })

  CONFIG.TinyMCE.content_css = 'systems/legends/styles/tinymce.css'
  CONFIG.TinyMCE.style_formats.push({
    title: 'Legends',
    items: [{ title: 'Skill name', inline: 'span', classes: 'skill-name' }],
  })
})

// Allow buttons in chat messages
Hooks.on('renderChatLog', (_app, html, _data) => Chat.addChatListeners(html))

Hooks.once('ready', () => {
  if (!game.user.isGM) return

  const currentVersion = game.settings.get('legends', 'systemMigrationVersion')
  const NEEDS_MIGRATION_VERSION = '1.0.10'

  const needsMigration =
    !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion)

  if (needsMigration) {
    Migrations.migrateWorld()
    game.settings.set(
      'legends',
      'systemMigrationVersion',
      NEEDS_MIGRATION_VERSION,
    )
  }
})

Hooks.on('renderSettings', (_app, html) => {
  const url = 'https://gitlab.com/pacosgrove1/legends/-/wikis/home'
  const label = game.i18n.localize('legends.common.documentation')

  let helpButton = $(
    `<button id="legends-help-btn" data-action="legends-help"><i class="fas fa-question-circle"></i> ${label}</button>`,
  )
  html.find('button[data-action="support"]').before(helpButton)

  helpButton.on('click', (e) => {
    e.preventDefault()
    window.open(url, 'legends-help', 'width=1032,height=720')
  })
})

Hooks.once('diceSoNiceReady', (dice3d) => {
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
})
