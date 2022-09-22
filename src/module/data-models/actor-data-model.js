import * as f from './data-model.js';

export class ICRPGCharacterDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      type: f.string(),
      world: f.string(),
      lifeform: f.string(),
      story: f.string(),
      description: f.string(),
      attributes: f.schema({
        strength: f.attributef(10),
        dexterity: f.attributef(10),
        constitution: f.attributef(10),
        intelligence: f.attributef(10),
        wisdom: f.attributef(10),
        charisma: f.attributef(10),
        defense: f.attributef(20),
      }),
      efforts: f.schema({
        basic: f.attributef(10),
        weapons: f.attributef(10),
        guns: f.attributef(10),
        energy: f.attributef(10),
        ultimate: f.attributef(10),
      }),
      health: f.schema({
        hearts: f.number({ min: 0, max: 5, initial: 1 }),
        max: f.number({ min: 0, max: 50 }),
        damage: f.number({ min: 0 }),
        value: f.number({ min: 0 }),
      }),
      dyingRounds: f.number({ min: 0, max: 9 }),
      heroCoin: f.boolean(),
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

export class ICRPGMonsterDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      // Attributes / efforts are plain numbers instead of mods.
      // !!Underscore!!
      description: f.string(),
      attributes: f.schema({
        all: f.bnf(10),
        strength: f.bnf(10),
        dexterity: f.bnf(10),
        constitution: f.bnf(10),
        intelligence: f.bnf(10),
        wisdom: f.bnf(10),
        charisma: f.bnf(10),
        // defense: f.bnf(20),
      }),
      efforts: f.schema({
        all: f.bnf(10),
        basic: f.bnf(10),
        weapons: f.bnf(10),
        guns: f.bnf(10),
        energy: f.bnf(10),
        ultimate: f.bnf(10),
      }),
      allRollsMod: f.bnf(10),

      // Health goes up to 100 (10 hearts)
      health: f.schema({
        hearts: f.number({ min: 0, max: 10, initial: 0 }),
        max: f.number({ min: 0, max: 100 }),
        damage: f.number({ min: 0 }),
        value: f.number({ min: 0 }),
      }),

      extraAction: f.string(),
      extraHealth: f.string(),
      monsterActions: f.array(
        f.schema({
          name: f.string(),
          description: f.string(),
        }),
      ),
    };
  }
}
