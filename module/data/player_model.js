import { legends } from '../config.js'
const { StringField, NumberField, SchemaField, ArrayField, BooleanField, HTMLField } = foundry.data.fields

export default class LegendsPlayerDataModel extends foundry.abstract.TypeDataModel {
  static migrateData(source, options) {
    source = super.migrateData(source, options)
    // Our V14 1.4.0 sheet wrote this HTML to description; upstream V2 uses look.
    // Preserve both fields when both contain text. Never refill an intentionally
    // cleared look field after this migration has already been saved.
    if (!source.legacyDescriptionMigrated && typeof source.description === 'string' && source.description.trim()) {
      if (source.look == null || (typeof source.look === 'string' && !source.look.trim())) {
        source.look = source.description
      }
      source.legacyDescriptionMigrated = true
    }
    return source
  }

  static defineSchema() {
    return {
      fatigue: new SchemaField({
        value: new NumberField({ integer: true, initial: 0 }),
        max: new NumberField({ integer: true, initial: 5 }),
      }),
      playbook: new StringField(),
      background: new StringField(),
      demeanor: new StringField(),
      look: new HTMLField(),
      description: new HTMLField(), // Retain the original text for recovery/export.
      legacyDescriptionMigrated: new BooleanField({ initial: false }),
      hometown: new StringField(),
      training: new SchemaField({
        water: new BooleanField({ initial: false }),
        earth: new BooleanField({ initial: false }),
        fire: new BooleanField({ initial: false }),
        air: new BooleanField({ initial: false }),
        weapons: new BooleanField({ initial: false }),
        technology: new BooleanField({ initial: false }),
      }),
      fighting_style: new StringField(),
      stats: new SchemaField({
        creativity: new NumberField({ integer: true, initial: 0 }),
        focus: new NumberField({ integer: true, initial: 0 }),
        harmony: new NumberField({ integer: true, initial: 0 }),
        passion: new NumberField({ integer: true, initial: 0 }),
      }),
      balance: new SchemaField({
        topTrack: new StringField(),
        bottomTrack: new StringField(),
        center: new NumberField({ initial: 0, integer: true }),
        value: new NumberField({ initial: 0, integer: true }),
      }),
      growth: new SchemaField({
        max: new NumberField({ integer: true, initial: 4 }),
        value: new NumberField({ integer: true, initial: 0 }),
        advancements: new SchemaField({
          'playbook-move': new SchemaField({
            max: new NumberField({ integer: true, initial: 2 }),
            value: new NumberField({ integer: true, initial: 0 }),
          }),
          'other-move': new SchemaField({
            max: new NumberField({ integer: true, initial: 2 }),
            value: new NumberField({ integer: true, initial: 0 }),
          }),
          'raise-stat': new SchemaField({
            max: new NumberField({ integer: true, initial: 0 }),
          }),
          'shift-center': new SchemaField({
            max: new NumberField({ integer: true, initial: 2 }),
            value: new NumberField({ integer: true, initial: 0 }),
          }),
          moment: new SchemaField({
            max: new NumberField({ integer: true, initial: 2 }),
            value: new NumberField({ integer: true, initial: 0 }),
          }),
        }),
      }),
      notes: new HTMLField(),
    }
  }
}
