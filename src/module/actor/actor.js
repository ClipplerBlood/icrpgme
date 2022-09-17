import { diceMap, plusifyMod } from '../utils/utils.js';
import { postRollMessage } from '../chat/chat-roll.js';

export class ICRPGActor extends Actor {
  prepareDerivedData() {
    const system = this.system;

    // Sum all the bonuses from attributes and effects
    for (let k of Object.keys(system.attributes)) {
      const att = system.attributes[k];
      att.total = att.base + att.lifeform + att.loot;
      att.total = Math.clamped(att.total, -6, 6);
    }

    for (let k of Object.keys(system.effects)) {
      const eff = system.effects[k];
      eff.total = eff.base + eff.lifeform + eff.loot;
      eff.total = Math.clamped(eff.total, -9, 9);
    }

    // Set defense
    const defense = system.attributes.defense;
    defense.total = 10 + defense.loot + system.attributes.constitution.total;

    // Set health
    system.health.total = system.health.hearts * 10;
  }

  /*
  ROLLS
   */

  async roll(name, options = { mod: 0, targetOffset: 0 }) {
    // Get the attribute, either in attributes or effects
    const attribute = this.system.attributes[name] || this.system.effects[name];
    if (!attribute) throw `Attribute ${name} not found in actor`;
    const dice = diceMap[name];
    let mod = attribute.total + parseInt(options.mod);

    // Only exception to mod: defense
    if (name === 'defense') mod -= 10;

    // Do the roll
    let formula = `@dice ${plusifyMod(mod)}`;
    const roll = new Roll(formula, { dice: dice, mod: mod, name: name });
    postRollMessage(this, roll);
  }
}
