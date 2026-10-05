import { legends, registerSystemSettings } from './module/config.js'
import LegendsItemV2 from './module/LegendsItem.v2.js'
import LegendsActorV2 from './module/LegendsActor.v2.js'
import LegendsPlayerActorSheetV2 from './module/sheets/LegendsPlayerActorSheet.v2.js'
import LegendsNpcActorSheetV2 from './module/sheets/LegendsNpcActorSheet.v2.js'
import LegendsCampaignActorSheetV2 from './module/sheets/LegendsCampaignActorSheet.v2.js'
import LegendsItemSheetV2 from './module/sheets/LegendsItemSheet.v2.js'
import LegendsPlaybookSheetV2 from './module/sheets/LegendsPlaybookSheet.v2.js'
import { preloadHandlebarsTemplates, setupEnrichers, registerHandlebarsHelpers } from './module/preload.js'
import * as Chat from './module/chat.js'
import * as Migrations from './module/migrations.js'
import { registerDiceSoNice } from './module/dice.js'

import LegendsPlayerDataModel from './module/data/player_model.js'
import LegendsNpcDataModel from './module/data/npc_model.js'
import LegendsCampaignDataModel from './module/data/campaign_model.js'

import LegendsCommonItemDataModel from './module/data/items/common_model.js'
import LegendsConditionItemDataModel from './module/data/items/condition_model.js'
import LegendsMoveItemDataModel from './module/data/items/move_model.js'
import LegendsNpcPrincipleItemDataModel from './module/data/items/npc_principle_model.js'
import LegendsPlaybookItemDataModel from './module/data/items/playbook_model.js'
import LegendsStatusItemDataModel from './module/data/items/status_model.js'
import LegendsTechniqueItemDataModel from './module/data/items/technique_model.js'

import LegendsExchange from './module/exchange/exchange.js'
import LegendsExchangeTracker from './module/exchange/tracker.js'
import LegendsCombatant from './module/exchange/combatant.js'

const { Actors, Items } = foundry.documents.collections
const { ActorSheet } = foundry.appv1.sheets

Hooks.once('init', function () {
  console.info('legends | Initialising Avatar Legends RPG (Unofficial) system...')

  // Config
  CONFIG.legends = legends
  CONFIG.Actor.documentClass = LegendsActorV2
  CONFIG.Item.documentClass = LegendsItemV2

  CONFIG.Item.typeIcons = legends.typeIcons.item
  CONFIG.Actor.typeIcons = legends.typeIcons.actor

  CONFIG.Actor.dataModels.player = LegendsPlayerDataModel
  CONFIG.Actor.dataModels.npc = LegendsNpcDataModel
  CONFIG.Actor.dataModels.campaign = LegendsCampaignDataModel

  CONFIG.Item.dataModels.condition = LegendsConditionItemDataModel
  CONFIG.Item.dataModels.feature = LegendsCommonItemDataModel
  CONFIG.Item.dataModels['growth-question'] = LegendsCommonItemDataModel
  CONFIG.Item.dataModels['moment-of-balance'] = LegendsCommonItemDataModel
  CONFIG.Item.dataModels.move = LegendsMoveItemDataModel
  CONFIG.Item.dataModels['npc-principle'] = LegendsNpcPrincipleItemDataModel
  CONFIG.Item.dataModels.playbook = LegendsPlaybookItemDataModel
  CONFIG.Item.dataModels.status = LegendsStatusItemDataModel
  CONFIG.Item.dataModels.technique = LegendsTechniqueItemDataModel

  // Item sheets
  Items.registerSheet('legends', LegendsItemSheetV2, { makeDefault: true })
  Items.registerSheet('legends', LegendsPlaybookSheetV2, {
    makeDefault: true,
    types: ['playbook'],
  })

  // Actor sheets
  Actors.unregisterSheet('core', ActorSheet)
  Actors.registerSheet('legends', LegendsPlayerActorSheetV2, {
    types: ['player'],
    makeDefault: true,
  })
  Actors.registerSheet('legends', LegendsNpcActorSheetV2, {
    types: ['npc'],
    makeDefault: true,
  })
  Actors.registerSheet('legends', LegendsCampaignActorSheetV2, {
    types: ['campaign'],
    makeDefault: true,
  })

  preloadHandlebarsTemplates()
  registerSystemSettings()
  registerHandlebarsHelpers()
  setupEnrichers()

  if (game.settings.get('legends', 'exchangeTracker')) {
    CONFIG.Combat.documentClass = LegendsExchange
    CONFIG.Combatant.documentClass = LegendsCombatant
    CONFIG.ui.combat = LegendsExchangeTracker
  }
})

// Allow buttons in chat messages
Hooks.on('renderChatLog', (_app, html, _data) => {
  Chat.addChatListeners(html)
})

Hooks.once('ready', () => {
  if (!game.user.isGM) return

  const currentVersion = game.settings.get('legends', 'systemMigrationVersion')
  const NEEDS_MIGRATION_VERSION = '1.0.10'

  const needsMigration = !currentVersion || foundry.utils.isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion)

  if (needsMigration) {
    Migrations.migrateWorld()
    game.settings.set('legends', 'systemMigrationVersion', NEEDS_MIGRATION_VERSION)
  }

  const archiveMessageDisplayed = game.settings.get('legends', 'archiveMessageDisplayed')
  if (!archiveMessageDisplayed) {
    if (game.user.isGM) {
      Chat.showArchiveMessage()
      game.settings.set('legends', 'archiveMessageDisplayed', true)
    }
  }
})

Hooks.on('renderSettings', (_app, html) => {
  const url = 'https://gitlab.com/pacosgrove1/legends/-/wikis/home'
  const label = game.i18n.localize('legends.common.documentation')

  let helpButton = $(
    `<button id="legends-help-btn" data-action="legends-help"><i class="fas fa-question-circle"></i> ${label}</button>`,
  )
  html = $(html)
  html.find('button[data-action="support"]').before(helpButton)

  helpButton.on('click', (e) => {
    e.preventDefault()
    window.open(url, 'legends-help', 'width=1032,height=720')
  })
})

Hooks.once('diceSoNiceReady', (dice3d) => {
  registerDiceSoNice(dice3d)
})
