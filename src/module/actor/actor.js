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
    if (game.settings.get('icrpgme', 'trackDamage')) {
      system.health.value = system.health.max - system.health.damage;
    } else {
      system.health.damage = system.health.max - system.health.value;
    }
    system.health.value = Math.clamped(system.health.value, 0, system.health.max);
    system.health.damage = Math.clamped(system.health.damage, 0, system.health.max);
  }

  prepareCharacter() {
    const system = this.system;
    // Sum all the bonuses from attributes and efforts
    for (const group of ['attributes', 'efforts']) {
      for (const k of Object.keys(system[group])) {
        const att = system[group][k];
        att.total = att.base + att.lifeform + att.loot;
        system[group][k].total = Math.clamped(att.total, -10, 10);
      }
    }
    // Set defense
    const defense = system.attributes.defense;
    defense.total = 10 + defense.loot + system.attributes.constitution.total;
    // Set weights
    const sum = (acc, i) => acc + i.system.weight;
    system.weight.carried.value = this.items.filter((i) => i.system.carried).reduce(sum, 0);
    system.weight.equipped.value = this.items.filter((i) => i.system.equipped).reduce(sum, 0);
  }

  prepareMonster() {
    this.system.attributes.defense = 0;
  }

  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);
    if (this.type === 'character') {
      data.img = 'systems/icrpgme/assets/cards/character/trigo.webp';
    } else if (this.type === 'monster') {
      data.img = 'systems/icrpgme/assets/cards/monster/skeleton.webp';
    }
  }

  _applyDefaultTokenSettings(data, { _fromCompendium = false } = {}) {
    const prototypeToken = {
      bar1: { attribute: 'health' },
    };
    if (this.type === 'character') {
      prototypeToken.actorLink = true;
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
      prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.HOVER;
      prototypeToken.displayBars = CONST.TOKEN_DISPLAY_MODES.HOVER;
      prototypeToken.texture = { src: 'systems/icrpgme/assets/tokens/character/trigo.webp' };
    } else if (this.type === 'monster') {
      prototypeToken.actorLink = false;
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
      prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.CONTROL;
      prototypeToken.displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER;
      prototypeToken.texture = { src: 'systems/icrpgme/assets/tokens/monster/skeleton.webp' };
    }

    return this.updateSource({ prototypeToken });
  }

  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user);

    // If changing health, recalculate everything in it
    const newHealth = changed.system?.health;
    if (newHealth != null) {
      // If only hearts (or maxHP) return
      if ((newHealth.hearts != null || newHealth.max != null) && newHealth.damage == null && newHealth.value == null)
        return;

      // Compute the values
      const oldHealth = this.system.health;
      const hearts = newHealth.hearts ?? oldHealth.hearts;
      const maxHP = newHealth.max ?? oldHealth.max;
      let value, damage;

      // If VALUE, then compute damage
      if (newHealth.value != null && newHealth.damage == null) {
        value = newHealth.value;
        damage = maxHP - value;
      }
      // If DAMAGE, then compute value
      else if (newHealth.damage != null && newHealth.value == null) {
        damage = newHealth.damage;
        value = maxHP - value;
      }
      // If BOTH, idk
      else throw `Updating both hp damage and value ${newHealth}`;
      changed.system.health = {
        max: maxHP,
        hearts: hearts,
        damage: damage,
        value: value,
      };
    }
  }

  /*
  ROLLS
   */

  async roll(name, group, options = { mod: 0, targetOffset: 0 }) {
    // TODO refactor
    // Get the attribute, either in attributes or efforts
    const attribute = this.system[group][name];
    if (attribute == null) throw `Attribute ${group}.${name} not found in actor`;
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
