const { StringField, SchemaField, ArrayField, BooleanField, HTMLField } = foundry.data.fields

export default class LegendsConditionItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField(),
      visible: new BooleanField({ initial: true }),
      checked: new BooleanField({ initial: false }),
      affectedMoves: new ArrayField(
        new SchemaField({
          name: new StringField(),
          penalty: new StringField(),
        }),
      ),
    }
  }
}
