import * as f from '../utils/data-model.js';

export class ICRPGActorDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: f.string(),
      type: f.string(),
      lifeform: f.string(),
      world: f.string(),
      story: f.string(),
      attributes: f.schema({
        strength: f.attributef(6),
        dexterity: f.attributef(6),
        constitution: f.attributef(6),
        intelligence: f.attributef(6),
        wisdom: f.attributef(6),
        charisma: f.attributef(6),
        defense: f.attributef(20),
      }),
      effects: f.schema({
        basic: f.attributef(9),
        weapons: f.attributef(9),
        guns: f.attributef(9),
        energy: f.attributef(9),
        ultimate: f.attributef(9),
      }),
      dyingRounds: f.number({ min: 0, max: 9 }),
      heroCoin: f.boolean(),
      health: f.schema({
        hearts: f.number({ min: 1, max: 5 }),
        total: f.number({ min: 0, max: 50 }),
        damage: f.number({ min: 0 }),
        current: f.number({ min: 0 }),
      }),
    };
  }
}
