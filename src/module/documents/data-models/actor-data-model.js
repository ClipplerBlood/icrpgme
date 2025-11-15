import * as f from './data-model.js';
import { i18n } from '../../utils/utils.js';

const initialNote = () =>
  `<h1><span style="font-family: FlatBread, Modesto Condensed, sans-serif">${i18n('ICRPG.tabs.notes')}</span></h1>`;

export class ICRPGCharacterDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      type: f.string(),
      world: f.string(),
      lifeform: f.string(),
      story: f.string(),
      notes: f.html({ initial: initialNote() }),
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
        hearts: f.number({ min: 0, max: 5, initial: 1, integer: false }),
        max: f.number({ min: 0, max: 50 }),
        damage: f.number({ min: 0 }),
        value: f.number({ min: 0 }),
      }),
      dyingRounds: f.number({ min: 0, max: 9 }),
      heroCoin: f.boolean(),
      mastery: f.number({ min: 0, max: 20 }),
      sp: f.schema({
        value: f.number(),
        max: f.number({ initial: 10 }),
      }),
      coins: f.number({ min: 0, initial: 0 }),
      resources: f.array(
        f.schema({
          name: f.string(),
          value: f.number(),
          max: f.number({ initial: 1 }),
        }),
      ),
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
        hearts: f.number({ min: 0, max: 10, initial: 0, integer: false }),
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
      sp: f.schema({
        value: f.number(),
        max: f.number({ initial: 10 }),
      }),
    };
  }
}

export class ICRPGObstacleDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: f.string(),
      health: f.schema({
        hearts: f.number({ min: 0, max: 10, initial: 1 }),
        max: f.number({ min: 0, max: 100 }),
        damage: f.number({ min: 0 }),
        value: f.number({ min: 0 }),
      }),
    };
  }
}

export class ICRPGVehicleDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      description: f.string(),
      chunks: f.array(
        f.schema({
          health: f.schema({
            hearts: f.number({ min: 0, max: 5, initial: 1, integer: false }),
            max: f.number({ min: 0, max: 50 }),
            damage: f.number({ min: 0 }),
            value: f.number({ min: 0 }),
          }),
          name: f.string(),
          description: f.string(),
        }),
      ),
      maneuvers: f.array(
        f.schema({
          name: f.string(),
          description: f.string(),
        }),
      ),
      health: f.schema({
        hearts: f.number({ min: 0, integer: false }),
        max: f.number({ min: 0 }),
        damage: f.number({ min: 0 }),
        value: f.number({ min: 0 }),
      }),
    };
  }
}

export class ICRPGHardSuitDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      pilotId: f.string(),
      quality: f.string(),
      power: f.schema({
        value: f.number({ min: 0, max: 100, initial: 100 }),
        max: f.number({ initial: 100 }),
      }),
      notes: f.html({ initial: initialNote() }),
      attributes: f.schema({
        strength: f.hsAttribute(10),
        dexterity: f.hsAttribute(10),
        constitution: f.hsAttribute(10),
        intelligence: f.hsAttribute(10),
        wisdom: f.hsAttribute(10),
        charisma: f.hsAttribute(10),
        defense: f.hsAttribute(20),
      }),
      efforts: f.schema({
        basic: f.hsAttribute(10),
        weapons: f.hsAttribute(10),
        guns: f.hsAttribute(10),
        energy: f.hsAttribute(10),
        ultimate: f.hsAttribute(10),
      }),
      health: f.schema({
        hearts: f.number({ min: 0, max: 5, initial: 1, integer: false }),
        max: f.number({ min: 0, max: 50 }),
        damage: f.number({ min: 0 }),
        value: f.number({ min: 0 }),
      }),
    };
  }
}
