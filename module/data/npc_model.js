import { legends } from '../config.js'
const { StringField, NumberField, SchemaField, ArrayField, BooleanField, HTMLField } = foundry.data.fields

export default class LegendsNpcDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      fatigue: new SchemaField({
        value: new NumberField({ integer: true, initial: 0 }),
        max: new NumberField({ integer: true, initial: 5 }),
      }),
      description: new HTMLField(),
      drive: new StringField(),
      level: new StringField(),
      group: new BooleanField({ initial: false }),
    }
  }
}
