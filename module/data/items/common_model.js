const { HTMLField } = foundry.data.fields

export default class LegendsCommonItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField(),
    }
  }
}
