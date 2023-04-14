import LegendsItemSheet from './LegendsItemSheet.js'

export default class LegendsNpcPrincipleSheet extends LegendsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 500,
      height: 190,
    })
  }
}
