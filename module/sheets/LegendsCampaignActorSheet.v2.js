import { legends } from '../config.js'
import LegendsActorSheetV2 from './LegendsActorSheet.v2.js'
import { editImage, enrich } from '../helpers.js'

export default class LegendsCampaignActorSheetV2 extends LegendsActorSheetV2 {
  static PARTS = {
    header: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/campaign/header.hbs`,
    },
    tabs: {
      template: `${legends.rootPath}/templates/partials/v2/tabs.hbs`,
    },
    main: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/campaign/main.hbs`,
      scrollable: [''],
    },
    relationships: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/campaign/relationships.hbs`,
      scrollable: [''],
    },
    acts: {
      template: `${legends.rootPath}/templates/sheets/actors/v2/campaign/acts.hbs`,
      scrollable: [''],
    },
  }

  static TABS = {
    sheet: {
      tabs: [
        { id: 'main', group: 'sheet', label: 'legends.actor-sheet.campaign.main' },
        { id: 'relationships', group: 'sheet', label: 'legends.actor-sheet.campaign.relationships.title' },
        { id: 'acts', group: 'sheet', label: 'legends.actor-sheet.campaign.acts' },
      ],
      initial: 'main',
    },
  }

  static DEFAULT_OPTIONS = {
    classes: ['legends', 'sheet', 'actor', 'campaign'],
    position: {
      width: 650,
      height: 615,
    },
    window: {
      resizable: true,
    },
    tag: 'form',
    form: {
      handler: LegendsCampaignActorSheetV2.#onSubmitForm,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      editImage: this.#editImage,
    },
  }

  async prepareActorContext(context) {
    context.campaignEras = {}
    for (const key of Object.keys(legends.campaignEras)) {
      context.campaignEras[key] = game.i18n.format('legends.actor-sheet.campaign.eras.eraDisplayName', {
        name: game.i18n.localize(legends.campaignEras[key]),
        era: game.i18n.localize('legends.actor-sheet.campaign.eras.era'),
      })
    }
    context.system.enrichedScope = await enrich(context.system.scope)
    context.system.enrichedFocusDesc = await enrich(context.system.focusDesc)
    context.system.enrichedAllies = await enrich(context.system.allies)
    context.system.enrichedEnemies = await enrich(context.system.enemies)

    for (const key of Object.keys(context.system.acts)) {
      let act = context.system.acts[key]
      act.enrichedDescription = await enrich(act.description)
    }

    return context
  }

  static async #onSubmitForm(event, _form, formData) {
    event.preventDefault()
    this.document.update(formData.object)
  }

  // #region Actions
  static async #editImage(event, target) {
    editImage(event, target, this.document)
  }
  // #endregion
}
