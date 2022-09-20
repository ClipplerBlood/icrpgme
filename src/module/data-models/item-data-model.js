import * as f from './data-model.js';

export class ICRPGItemBaseDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: f.string(),
      bonuses: f.schema({
        attributes: f.schema({
          strength: f.bnf(10),
          dexterity: f.bnf(10),
          constitution: f.bnf(10),
          intelligence: f.bnf(10),
          wisdom: f.bnf(10),
          charisma: f.bnf(10),
          defense: f.bnf(10),
        }),
        effects: f.schema({
          basic: f.bnf(10),
          weapons: f.bnf(10),
          guns: f.bnf(10),
          energy: f.bnf(10),
          ultimate: f.bnf(10),
        }),
        weight: f.schema({
          carried: f.number(),
          equipped: f.number(),
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
