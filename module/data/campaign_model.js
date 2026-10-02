import { legends } from '../config.js'
const { StringField, NumberField, SchemaField, ArrayField, BooleanField, HTMLField } = foundry.data.fields

export default class LegendsCampaignDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      era: new StringField({ initial: 'custom' }),
      scope: new HTMLField(),
      focus: new StringField({ initial: 'defeat' }),
      focusDesc: new HTMLField(),
      customFocus: new StringField({ initial: 'To...' }),
      allies: new HTMLField(),
      enemies: new HTMLField(),
      incitingIncident: new StringField(),
      location: new StringField(),
      acts: new SchemaField({
        1: new SchemaField({
          name: new StringField({ initial: 'Act I' }),
          description: new HTMLField(),
        }),
        2: new SchemaField({
          name: new StringField({ initial: 'Act II' }),
          description: new HTMLField(),
        }),
        3: new SchemaField({
          name: new StringField({ initial: 'Act III' }),
          description: new HTMLField(),
        }),
      }),
    }
  }
}
