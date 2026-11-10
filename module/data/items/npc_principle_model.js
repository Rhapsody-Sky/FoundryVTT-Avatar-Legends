import { legends } from '../../config.js'
const { StringField, NumberField, SchemaField, ArrayField, BooleanField, HTMLField } = foundry.data.fields

export default class LegendsNpcPrincipleItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField(),
      track: new SchemaField({
        max: new NumberField({ integer: true, initial: 1, min: 1 }),
        value: new NumberField({ integer: true, initial: 0, min: 0 }),
      }),
    }
  }
}
