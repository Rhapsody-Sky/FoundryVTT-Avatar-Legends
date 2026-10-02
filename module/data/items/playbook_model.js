const { StringField, NumberField, SchemaField, ArrayField } = foundry.data.fields

export default class LegendsPlaybookItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      stats: new SchemaField({
        creativity: new NumberField({ integer: true, initial: 0 }),
        focus: new NumberField({ integer: true, initial: 0 }),
        harmony: new NumberField({ integer: true, initial: 0 }),
        passion: new NumberField({ integer: true, initial: 0 }),
      }),
      balance: new SchemaField({
        topTrack: new StringField({ initial: 'Principle A' }),
        bottomTrack: new StringField({ initial: 'Principle B' }),
      }),
      attachedItems: new ArrayField(new StringField(), { initial: [] }),
    }
  }
}
