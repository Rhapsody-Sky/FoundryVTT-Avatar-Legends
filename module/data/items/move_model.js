const { StringField, BooleanField, HTMLField } = foundry.data.fields

export default class LegendsMoveItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField(),
      rollable: new BooleanField({ initial: false }),
      rollStat: new StringField(),
      category: new StringField(),
    }
  }
}
