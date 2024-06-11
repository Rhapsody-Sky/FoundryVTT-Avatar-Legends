import { legends, registerSystemSettings } from './module/config.js'
import LegendsItem from './module/LegendsItem.js'
import LegendsActor from './module/LegendsActor.js'
import LegendsActorSheet from './module/sheets/LegendsActorSheet.js'
import LegendsNpcActorSheet from './module/sheets/LegendsNpcActorSheet.js'
import LegendsCampaignActorSheet from './module/sheets/LegendsCampaignActorSheet.js'
import LegendsItemSheet from './module/sheets/LegendsItemSheet.js'
import LegendsNpcPrincipleSheet from './module/sheets/LegendsNpcPrincipleSheet.js'
import LegendsPlaybookSheet from './module/sheets/LegendsPlaybookSheet.js'
import { preloadHandlebarsTemplates, setupEnrichers, registerHandlebarsHelpers } from './module/preload.js'
import * as Chat from './module/chat.js'
import * as Migrations from './module/migrations.js'
import LegendsJournalSheet from './module/sheets/LegendsJournalSheet.js'
import { registerDiceSoNice } from './module/dice.js'

Hooks.once('init', function () {
  console.log(
    'legends | Initialising Avatar Legends RPG (Unofficial) system...',
  )

  // Config
  CONFIG.legends = legends
  CONFIG.Actor.documentClass = LegendsActor
  CONFIG.Item.documentClass = LegendsItem

  CONFIG.Item.typeIcons = legends.typeIcons.item
  CONFIG.Actor.typeIcons = legends.typeIcons.actor

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
  registerHandlebarsHelpers()
  setupEnrichers()

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
    !currentVersion || foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion)

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
  registerDiceSoNice(dice3d)
})
