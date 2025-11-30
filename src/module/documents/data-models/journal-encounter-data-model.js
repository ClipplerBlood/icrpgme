const { StringField, NumberField } = foundry.data.fields;

export default class ICRPGJournalEncounterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      danger: new StringField({ initial: '' }),
      energy: new StringField({ initial: '' }),
      wonder: new StringField({ initial: '' }),
      timers: new StringField({ initial: '' }),
      threats: new StringField({ initial: '' }),
      treats: new StringField({ initial: '' }),
      damage: new StringField({ initial: '' }),
      disruption: new StringField({ initial: '' }),
      duration: new StringField({ initial: '' }),
      encounterType: new StringField({ initial: '' }),
      encounterTarget: new NumberField({ initial: 12, integer: true, min: 0, max: 30 }),
    };
  }
}
