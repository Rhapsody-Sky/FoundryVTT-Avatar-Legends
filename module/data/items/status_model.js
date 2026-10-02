import { legends } from '../../config.js'
const { StringField, NumberField, SchemaField, ArrayField, BooleanField, HTMLField } = foundry.data.fields

export default class LegendsStatusItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField(),
      visible: new BooleanField({ initial: true }),
      checked: new BooleanField({ initial: false }),
      type: new StringField({ initial: 'positive' }),
    }
  }
}
