import { diceMap, plusifyMod } from '../utils/utils.js';
import { postRollMessage } from '../chat/chat-roll.js';
import { postArrayActionMessage, postItemMessage } from '../chat/chat-item.js';

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
      case 'vehicle':
        this.prepareVehicle();
        break;
      case 'hardSuit':
        return this.prepareHardSuit();
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
    defense.total = Math.clamped(defense.total, 0, 20);
    // Set weights
    const sum = (acc, i) => acc + i.system.weight;
    system.weight.carried.value = this.items.filter((i) => i.system.carried).reduce(sum, 0);
    system.weight.equipped.value = this.items.filter((i) => i.system.equipped).reduce(sum, 0);
  }

  prepareMonster() {
    this.system.attributes.defense = 0;
  }

  prepareVehicle() {
    this.system.health = { hearts: 0, max: 0, damage: 0, value: 0 };
    this.system.chunks.forEach((chunk) => {
      chunk.health.max = 10 * chunk.health.hearts;
      if (game.settings.get('icrpgme', 'trackDamage')) {
        chunk.health.value = chunk.health.max - (chunk.health.damage ?? 0);
      } else {
        chunk.health.damage = chunk.health.max - (chunk.health.value ?? 0);
      }
      chunk.health.value = Math.clamped(chunk.health.value, 0, chunk.health.max);
      chunk.health.damage = Math.clamped(chunk.health.damage, 0, chunk.health.max);

      for (const [k, v] of Object.entries(chunk.health)) this.system.health[k] += v;
    });
  }

  prepareHardSuit() {
    const system = this.system;
    // Set pilot derived attributes
    const pilot = game.actors.get(system.pilotId);
    if (pilot) {
      for (const attr of ['constitution', 'intelligence', 'wisdom', 'charisma']) {
        system.attributes[attr].base = pilot.system.attributes[attr].base;
      }
    }
    // Sum all the bonuses from attributes and efforts
    for (const group of ['attributes', 'efforts']) {
      for (const k of Object.keys(system[group])) {
        const att = system[group][k];
        att.total = att.base + att.loot;
        system[group][k].total = Math.clamped(att.total, -10, 10);
      }
    }
    // Set defense
    const defense = system.attributes.defense;
    defense.total = 10 + defense.loot;
    defense.total = Math.clamped(defense.total, 0, 20);

    // Set hp from parts
    system.health.max = 0;
    system.health.damage = 0;
    for (const part of this.items.filter((i) => i.type === 'part')) {
      const hits = part.system.hits;
      system.health.max += hits.max;
      system.health.damage += Math.clamped(hits.value, 0, hits.max);
    }
    system.health.value = system.health.max - system.health.damage;
    system.health.hearts = Math.ceil(system.health.max / 5) * 0.5;
  }

  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);
    if (data?.img != null) return; // Avoid update if image already is set, like when importing or converting to compendium
    let img, tokenImg;
    if (this.type === 'character') {
      img = 'systems/icrpgme/assets/cards/character/trigo.webp';
      tokenImg = 'systems/icrpgme/assets/tokens/character/trigo.webp';
    } else if (this.type === 'monster') {
      img = 'systems/icrpgme/assets/cards/monster/flaming%20skull.webp';
      tokenImg = 'systems/icrpgme/assets/tokens/monster/flaming%20skull.webp';
    } else if (this.type === 'obstacle') {
      img = 'systems/icrpgme/assets/bases/offline%20glyph.webp';
      tokenImg = 'systems/icrpgme/assets/bases/offline%20glyph.webp';
    } else if (this.type === 'hardSuit') {
      img = 'systems/icrpgme/assets/cards/hard-suit/hard-suit.webp';
      tokenImg = 'systems/icrpgme/assets/tokens/hard-suit/hard-suit.webp';
    }
    if (img) this.updateSource({ img: img, 'prototypeToken.texture.src': tokenImg });
  }

  _applyDefaultTokenSettings(data, { _fromCompendium = false } = {}) {
    const prototypeToken = {
      bar1: { attribute: 'health' },
    };
    if (this.type === 'character') {
      prototypeToken.actorLink = true;
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
      prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.HOVER;
      prototypeToken.displayBars = CONST.TOKEN_DISPLAY_MODES.ALWAYS;
    } else if (this.type === 'monster') {
      prototypeToken.actorLink = false;
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
      prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER;
      prototypeToken.displayBars = CONST.TOKEN_DISPLAY_MODES.OWNER;
    } else if (this.type === 'obstacle') {
      prototypeToken.actorLink = false;
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.NEUTRAL;
      prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.HOVER;
      prototypeToken.displayBars = CONST.TOKEN_DISPLAY_MODES.ALWAYS;
    } else if (this.type === 'vehicle') {
      prototypeToken.actorLink = true;
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.NEUTRAL;
      prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.HOVER;
      prototypeToken.displayBars = CONST.TOKEN_DISPLAY_MODES.ALWAYS;
    } else if (this.type === 'hardSuit') {
      prototypeToken.actorLink = true;
      prototypeToken.disposition = CONST.TOKEN_DISPOSITIONS.NEUTRAL;
      prototypeToken.displayName = CONST.TOKEN_DISPLAY_MODES.HOVER;
      prototypeToken.displayBars = CONST.TOKEN_DISPLAY_MODES.HOVER;
      prototypeToken.bar2 = { attribute: 'power' };
    }
    return this.updateSource({ prototypeToken });
  }

  /**
   * Handles the changing of damage and hp value
   * + the changing of the actor image
   * + the changing of actor name
   * @param changed
   * @param options
   * @param user
   * @returns {Promise<void>}
   * @private
   */
  async _preUpdate(changed, options, user) {
    await super._preUpdate(changed, options, user);

    // If changing health, recalculate everything in it
    const newHealth = changed.system?.health;
    if (newHealth != null) {
      const healthUpdate = this.handleHealthUpdate(newHealth, this.system.health);
      if (healthUpdate) changed.system.health = healthUpdate;
    }

    // Handle changing the actor image with the included art
    if (changed.img != null) {
      const isSystemImage = (img) =>
        img?.startsWith('systems/icrpgme/assets/cards') || img?.startsWith('systems/icrpgme/assets/tokens');
      // If the changed image is a default one, change the prototype token with the corresponding
      if (isSystemImage(changed.img) && isSystemImage(this.prototypeToken?.texture?.src)) {
        const tokenImg = changed.img.replace('systems/icrpgme/assets/cards/', 'systems/icrpgme/assets/tokens/');
        changed.prototypeToken = { texture: { src: tokenImg } };
      }
      // If the changed image is not a default one and the prototype is a default, override the prototype with the new
      // else if (!isSystemImage(changed.img) && isSystemImage(this.prototypeToken?.texture.src)) {
      //   changed.prototypeToken = { texture: { src: changed.img } };
      // }
    }

    // Actor name and prototype token
    if (changed.name != null) {
      changed.prototypeToken = changed.prototypeToken ?? {};
      changed.prototypeToken.name = changed.name;
    }
  }

  /**
   * Handles the updating between DAMAGE and HP VALUE
   * @param newHealth
   * @param oldHealth
   * @return the new health object, correctly calculated
   */
  handleHealthUpdate(newHealth, oldHealth) {
    if (!newHealth) return;
    // If only hearts (or maxHP) return
    if ((newHealth.hearts != null || newHealth.max != null) && newHealth.damage == null && newHealth.value == null)
      return newHealth;

    // Compute the values
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
    else console.warn(`Updating both hp damage and value ${newHealth}`);
    return { hearts: hearts, max: maxHP, damage, value };
  }

  async setChunkHealth(chunkIndex, newHealth) {
    if (this.type !== 'vehicle') return;
    const chunks = this.system.chunks;
    chunks[chunkIndex].health = this.handleHealthUpdate(newHealth, chunks[chunkIndex].health);
    return this.update({ 'system.chunks': chunks });
  }

  /*
  ROLLS
   */

  async roll(name, group, options = { mod: 0, targetOffset: 0 }) {
    // If this is an obstacle, return
    if (this.type === 'obstacle') {
      console.warn('ICRPGME | Making a roll with an Obstacle is not valid');
      return;
    }

    // Get the attribute, either in attributes or efforts
    const attribute = this.system[group][name];
    if (attribute == null) throw `Attribute ${group}.${name} not found in actor`;
    let dice = diceMap[name];

    // Hard suits roll 1d100 for str and dex
    const isHardSuitRoll = this.type === 'hardSuit' && ['strength', 'dexterity'].includes(name);
    if (isHardSuitRoll) dice = '1d100';

    // Determine the modifier, depending on if actor or monster
    let mod = parseInt(options.mod);
    if (this.type === 'character') mod += attribute.total;
    else if (this.type === 'monster') mod += attribute + this.system[group].all + this.system.allRollsMod;

    // Only exception to mod: defense
    if (name === 'defense' && mod >= 10) mod -= 10;

    // Do the roll
    let formula = `@dice ${plusifyMod(mod)}`;
    const roll = new Roll(formula, { dice: dice, mod: mod, name: name });
    postRollMessage(this, roll, undefined, { isHardSuitRoll });
  }

  async useItem(itemId, options = {}) {
    // If the item is a string, then treat it as an ID
    const item = this.items.get(itemId);
    if (!item) throw 'Item not found in actor';

    postItemMessage(this, item, options);
  }

  useAction(actionIndex, _options = {}) {
    let array;
    if (this.type === 'monster') array = this.system.monsterActions;
    if (this.type === 'vehicle') array = this.system.maneuvers;

    let entry = array?.[actionIndex];
    if (!entry) return;

    postArrayActionMessage(this, entry);
  }
}
