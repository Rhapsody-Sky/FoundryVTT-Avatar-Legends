const { StringField, NumberField, SchemaField, ArrayField, BooleanField, HTMLField } = foundry.data.fields

export default class LegendsTechniqueItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField(),
      visible: new BooleanField({ initial: true }),
      approach: new StringField({ initial: 'defend-maneuver' }),
      basic: new BooleanField({ initial: false }),
      learned: new BooleanField({ initial: true }),
      practiced: new BooleanField({ initial: false }),
      mastered: new BooleanField({ initial: false }),
      training: new StringField(),
      specialty: new StringField(),
    }
  }
}
