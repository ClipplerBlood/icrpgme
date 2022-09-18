import * as f from './data-model.js';

export class ICRPGItemBaseDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: f.string(),
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
