export const legends = {}

legends.stats = {
  creativity: 'legends.stats.creativity',
  focus: 'legends.stats.focus',
  harmony: 'legends.stats.harmony',
  passion: 'legends.stats.passion',
}

legends.approaches = {
  'defend-maneuver': 'legends.techniques.approaches.defend-maneuver',
  'advance-attack': 'legends.techniques.approaches.advance-attack',
  'evade-observe': 'legends.techniques.approaches.evade-observe',
}

legends.training = {
  air: 'legends.training.air',
  earth: 'legends.training.earth',
  fire: 'legends.training.fire',
  technology: 'legends.training.technology',
  water: 'legends.training.water',
  weapons: 'legends.training.weapons',
}

legends.npcLevels = {
  minor: 'legends.actor-sheet.npc.levels.minor',
  moderate: 'legends.actor-sheet.npc.levels.major',
  major: 'legends.actor-sheet.npc.levels.master',
  legendary: 'legends.actor-sheet.npc.levels.legendary',
  group: 'legends.actor-sheet.npc.levels.group',
}

legends.campaignEras = {
  custom: 'legends.actor-sheet.campaign.eras.custom',
  kyoshi: 'legends.actor-sheet.campaign.eras.kyoshi',
  roku: 'legends.actor-sheet.campaign.eras.roku',
  '100years': 'legends.actor-sheet.campaign.eras.100years',
  aang: 'legends.actor-sheet.campaign.eras.aang',
  korra: 'legends.actor-sheet.campaign.eras.korra',
}

legends.campaignFocus = {
  defeat: 'legends.actor-sheet.campaign.focus.defeat',
  protect: 'legends.actor-sheet.campaign.focus.protect',
  change: 'legends.actor-sheet.campaign.focus.change',
  deliver: 'legends.actor-sheet.campaign.focus.deliver',
  rescue: 'legends.actor-sheet.campaign.focus.rescue',
  learn: 'legends.actor-sheet.campaign.focus.learn',
  custom: 'legends.actor-sheet.campaign.focus.custom',
}

legends.defaultTokens = {
  campaign: 'systems/legends/images/tokens/campaign.webp',
  condition: 'systems/legends/images/tokens/condition.webp',
  'moment-of-balance': 'systems/legends/images/tokens/moment-of-balance.webp',
  move: 'systems/legends/images/tokens/move.webp',
  npc: 'systems/legends/images/tokens/npc.webp',
  player: 'systems/legends/images/tokens/player.webp',
  status: 'systems/legends/images/tokens/condition.webp',
  technique: 'systems/legends/images/tokens/technique.webp',
  feature: 'systems/legends/images/tokens/feature.webp',
  'npc-principle': 'systems/legends/images/tokens/npc-principle.webp',
  'growth-question': 'systems/legends/images/tokens/growth-question.webp',
  playbook: 'systems/legends/images/tokens/playbook.webp',
}

legends.moveCategories = {
  basic: 'legends.moves.category.basic',
  balance: 'legends.moves.category.balance',
  playbook: 'legends.moves.category.playbook',
}

legends.typeIcons = {
  actor: {
    player: 'fas fa-person-simple',
    npc: 'fas fa-people-group',
    campaign: 'fas fa-earth-asia',
  },
  item: {
    move: 'fas fa-arrows-maximize',
    technique: 'fas fa-person-running fa-rotate-180 fa-flip-vertical',
    condition: 'fas fa-cloud-xmark',
    feature: 'fas fa-heart',
    'moment-of-balance': 'fas fa-yin-yang',
    'npc-principle': 'fas fa-compass',
    status: 'fas fa-cloud-xmark',
    'growth-question': 'fas fa-question',
    playbook: 'fas fa-scroll-old',
  },
}

export const registerSystemSettings = () => {
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
}