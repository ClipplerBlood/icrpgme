import { innerNumericalOperation } from '../utils/utils.js';

export class ICRPGItem extends Item {
  async _preUpdate(changes, options, user) {
    await super._preUpdate(changes, options, user);

    // Handle equipping/unequipping
    if (changes?.system?.equipped != null) {
      const sign = changes.system.equipped ? +1 : -1;
      this._applyParentChanges(this.system.bonuses, sign, changes.system?.bonuses);
    }

    // Handle plain bonus update
    else if (this._isActive) this._applyParentChanges(this.system.bonuses, +1, changes.system?.bonuses);
  }

  async _preCreate(data, options, userId) {
    await super._preCreate(data, options, userId);
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
    return this.parent.update({
      system: innerNumericalOperation(sysDiff, this.parent.system, (x, y) => sign * x + y),
    });
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
}
