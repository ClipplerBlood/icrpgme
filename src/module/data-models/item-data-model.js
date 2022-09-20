import * as f from './data-model.js';

export class ICRPGItemBaseDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: f.string(),
      bonuses: f.schema({
        attributes: f.schema({
          strength: f.attributef(10),
          dexterity: f.attributef(10),
          constitution: f.attributef(10),
          intelligence: f.attributef(10),
          wisdom: f.attributef(10),
          charisma: f.attributef(10),
          defense: f.attributef(10),
        }),
        effects: f.schema({
          basic: f.attributef(10),
          weapons: f.attributef(10),
          guns: f.attributef(10),
          energy: f.attributef(10),
          ultimate: f.attributef(10),
        }),
      }),
    };
  }
}

export class ICRPGItemLootDataModel extends ICRPGItemBaseDataModel {
  static defineSchema() {
    const baseSchema = super.defineSchema();
    const lootSchema = {
      equipped: f.boolean(),
      carried: f.boolean(),
      weight: f.number({ initial: 1 }),
    };
    return { ...baseSchema, ...lootSchema };
  }
}
