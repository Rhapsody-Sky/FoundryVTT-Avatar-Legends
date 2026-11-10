export const legends = {
  rootPath: 'systems/avatar-legends',
}

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
legends.approachStats = {
  'defend-maneuver': ['focus'],
  'advance-attack': ['passion'],
  'evade-observe': ['creativity', 'harmony'],
}
legends.exchangePhases = ['choose', 'defend-maneuver', 'advance-attack', 'evade-observe']
legends.exchangePhaseOptions = {
  choose: 'legends.exchange.choose',
  'defend-maneuver': 'legends.techniques.approaches.defend-maneuver',
  'advance-attack': 'legends.techniques.approaches.advance-attack',
  'evade-observe': 'legends.techniques.approaches.evade-observe',
}

legends.statusTypeOptions = {
  positive: 'legends.status.positive',
  negative: 'legends.status.negative',
}

legends.training = {
  air: 'legends.training.air',
  earth: 'legends.training.earth',
  fire: 'legends.training.fire',
  technology: 'legends.training.technology',
  water: 'legends.training.water',
  weapons: 'legends.training.weapons',
}
legends.trainingIcons = {
  air: 'fas fa-wind',
  earth: 'fas fa-mountain',
  fire: 'fas fa-fire-flame-curved',
  group: 'fas fa-users',
  technology: 'fas fa-gear',
  water: 'fas fa-water',
  weapons: 'fas fa-swords',
}
legends.trainingOptions = {
  air: 'legends.training.air',
  earth: 'legends.training.earth',
  fire: 'legends.training.fire',
  group: 'legends.training.group',
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
  campaign: 'systems/avatar-legends/images/tokens/campaign.webp',
  condition: 'systems/avatar-legends/images/tokens/condition.webp',
  'moment-of-balance': 'systems/avatar-legends/images/tokens/moment-of-balance.webp',
  move: 'systems/avatar-legends/images/tokens/move.webp',
  npc: 'systems/avatar-legends/images/tokens/npc.webp',
  player: 'systems/avatar-legends/images/tokens/player.webp',
  status: 'systems/avatar-legends/images/tokens/condition.webp',
  technique: 'systems/avatar-legends/images/tokens/technique.webp',
  feature: 'systems/avatar-legends/images/tokens/feature.webp',
  'npc-principle': 'systems/avatar-legends/images/tokens/npc-principle.webp',
  'growth-question': 'systems/avatar-legends/images/tokens/growth-question.webp',
  playbook: 'systems/avatar-legends/images/tokens/playbook.webp',
}

legends.moveCategories = {
  basic: 'legends.moves.category.basic',
  balance: 'legends.moves.category.balance',
  playbook: 'legends.moves.category.playbook',
}

legends.penaltyOptions = {
  '-2': '-2',
  1: '+1',
  2: '+2',
}

legends.moveStatOptions = {
  principle: 'legends.principle.title',
  ...legends.stats,
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
  game.settings.register('avatar-legends', 'systemMigrationVersion', {
    config: false,
    scope: 'world',
    type: String,
    default: '',
  })

  game.settings.register('avatar-legends', 'archiveMessageDisplayed', {
    config: false,
    scope: 'client',
    type: Boolean,
    default: false,
  })

  game.settings.register('avatar-legends', 'sheetColour', {
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
    requiresReload: true,
  })

  game.settings.register('avatar-legends', 'playerNotes', {
    config: true,
    scope: 'client',
    name: 'SETTINGS.playerNotes.label',
    hint: 'SETTINGS.playerNotes.hint',
    type: Boolean,
    default: false,
    requiresReload: true,
  })

  game.settings.register('avatar-legends', 'trainingIconsEnabled', {
    config: true,
    scope: 'world',
    name: 'Training Icons',
    hint: 'Enabled: use FontAwesome icons',
    type: Boolean,
    default: true,
    requiresReload: true,
  })

  game.settings.register('avatar-legends', 'exchangeTracker', {
    config: true,
    scope: 'world',
    name: 'SETTINGS.exchangeTracker.label',
    hint: 'SETTINGS.exchangeTracker.hint',
    type: Boolean,
    default: false,
    requiresReload: true,
  })
}
