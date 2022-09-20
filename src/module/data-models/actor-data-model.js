import * as f from './data-model.js';

export class ICRPGActorDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: f.string(),
      type: f.string(),
      lifeform: f.string(),
      world: f.string(),
      story: f.string(),
      attributes: f.schema({
        strength: f.attributef(10),
        dexterity: f.attributef(10),
        constitution: f.attributef(10),
        intelligence: f.attributef(10),
        wisdom: f.attributef(10),
        charisma: f.attributef(10),
        defense: f.attributef(20),
      }),
      effects: f.schema({
        basic: f.attributef(10),
        weapons: f.attributef(10),
        guns: f.attributef(10),
        energy: f.attributef(10),
        ultimate: f.attributef(10),
      }),
      dyingRounds: f.number({ min: 0, max: 9 }),
      heroCoin: f.boolean(),
      health: f.schema({
        hearts: f.number({ min: 1, max: 5 }),
        max: f.number({ min: 0, max: 50 }),
        damage: f.number({ min: 0 }),
        value: f.number({ min: 0 }),
      }),
      weight: f.schema({
        carried: f.schema({
          max: f.number({ initial: 10 }),
          value: f.number(),
        }),
        equipped: f.schema({
          max: f.number({ initial: 10 }),
          value: f.number(),
        }),
      }),
    };
  }
}
