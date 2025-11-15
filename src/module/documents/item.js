import { innerNumericalOperation } from '../utils/utils.js';

const { expandObject, flattenObject } = foundry.utils;

export class ICRPGItem extends Item {
  async _preUpdate(changes, options, user) {
    await super._preUpdate(changes, options, user);

    // Handle equipping/unequipping
    if (changes?.system?.equipped != null) {
      const sign = changes.system.equipped ? +1 : -1;
      this._applyParentChanges(this.system.bonuses, sign, changes.system?.bonuses);
    }

    // Handle plain bonus update
    else if (this._isActive && changes?.system?.bonuses)
      this._applyParentChanges(this.system.bonuses, +1, changes.system.bonuses);
  }

  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);
    this.autoEquip();
    if (this._isActive) this._applyParentChanges(this.system.bonuses, +1);
  }

  async _preDelete(options, user) {
    await super._preDelete(options, user);
    if (this._isActive) this._applyParentChanges(this.system.bonuses, -1);
  }

  async _applyParentChanges(bonusData, sign, bonusChanges = undefined) {
    // If changes are provided, calculate the inner difference between the changes and the bonus data (used in _preUpdate)
    if (!this.parent) return;
    if (bonusChanges) bonusData = innerNumericalOperation(bonusChanges, bonusData, (x, y) => x - y);
    if (!bonusData) return;

    // Add the correct suffixes to the bonuses keys, then calculate the inner sum between the bonus data and the parent data
    let sysDiff = this._applySuffix(bonusData);
    const system = innerNumericalOperation(sysDiff, this.parent.system, (x, y) => sign * x + y);
    return this.parent.update({ system });
  }

  get _isActive() {
    return this.system.equipped || this.type !== 'loot';
  }

  _applySuffix(bonusData) {
    let bonuses = flattenObject(bonusData);
    let result = {};
    for (let [key, value] of Object.entries(bonuses)) {
      if (key.includes('attributes') || key.includes('efforts')) key += '.loot';
      else if (key.includes('weight')) key += '.max';
      result[key] = value;
    }
    return expandObject(result);
  }

  /**
   * Automatically sets the item as carried or equipped before creation, depending on the setting.
   */
  autoEquip() {
    const setting = game.settings.get('icrpgme', 'autoEquip');
    if (!['loot', 'spell'].includes(this.type)) return;
    if (setting === 'none' || !this.parent || this.parent?.type !== 'character') return;

    let system = {};
    let parentWeight = this.parent.system.weight;
    const canCarry = this.system.weight + parentWeight.carried.value <= parentWeight.carried.max;
    const canEquip = this.system.weight + parentWeight.equipped.value <= parentWeight.equipped.max;

    if ((setting === 'carried' || setting === 'both') && canCarry) system.carried = true;
    if ((setting === 'equipped' || setting === 'both') && canEquip) system.equipped = true;
    this.updateSource({ system });
  }
}

Hooks.on('preCreateItem', (doc) => {
  if (!doc.actor) return;
  if (doc.actor.type === 'character') {
    return ['loot', 'ability', 'power', 'augment', 'spell'].includes(doc.type);
  }
  if (doc.actor.type === 'hardSuit') {
    return ['part', 'property'].includes(doc.type);
  }
  return false;
});
