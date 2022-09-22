import { diceMap, plusifyMod } from '../utils/utils.js';
import { postRollMessage } from '../chat/chat-roll.js';

export class ICRPGActor extends Actor {
  prepareDerivedData() {
    const system = this.system;
    switch (this.type) {
      case 'character':
        this.prepareCharacter();
        break;
      case 'monster':
        this.prepareMonster();
        break;
    }

    // Set health
    system.health.max = system.health.hearts * 10;
    system.health.value = system.health.max - system.health.damage;
  }

  prepareCharacter() {
    const system = this.system;
    // Sum all the bonuses from attributes and efforts
    for (const k of Object.keys(system.attributes)) {
      const att = system.attributes[k];
      att.total = att.base + att.lifeform + att.loot;
      att.total = Math.clamped(att.total, -10, 10);
    }

    for (const k of Object.keys(system.efforts)) {
      const eff = system.efforts[k];
      eff.total = eff.base + eff.lifeform + eff.loot;
      eff.total = Math.clamped(eff.total, -10, 10);
    }

    // Set defense
    const defense = system.attributes.defense;
    defense.total = 10 + defense.loot + system.attributes.constitution.total;
  }

  prepareMonster() {}

  /*
  ROLLS
   */

  async roll(name, group, options = { mod: 0, targetOffset: 0 }) {
    // TODO refactor
    // Get the attribute, either in attributes or efforts
    const attribute = this.system[group][name];
    if (!attribute) throw `Attribute ${group}.${name} not found in actor`;
    const dice = diceMap[name];

    // Determine the modifier, depending on if actor or monster
    let mod = parseInt(options.mod);
    if (this.type === 'character') mod += attribute.total;
    else if (this.type === 'monster') mod = attribute + this.system[group].all + this.system.allRollsMod;

    // Only exception to mod: defense
    if (name === 'defense') mod -= 10;

    // Do the roll
    let formula = `@dice ${plusifyMod(mod)}`;
    const roll = new Roll(formula, { dice: dice, mod: mod, name: name });
    postRollMessage(this, roll);
  }
}
