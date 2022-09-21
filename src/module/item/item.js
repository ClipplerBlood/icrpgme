import { innerNumericalOperation } from '../utils/utils.js';

export class ICRPGItem extends Item {
  // Note: pre update operations occur only for the client who requested
  async _preUpdate(changes, options, user) {
    await super._preUpdate(changes, options, user);
    this._applyParentChanges(this.system.bonuses, +1, changes.system?.bonuses);
  }

  _preCreate(data, options, userId) {
    super._preCreate(data, options, userId);
    this._applyParentChanges(this.system.bonuses, +1);
  }

  _preDelete(options, user) {
    super._preDelete(options, user);
    this._applyParentChanges(this.system.bonuses, -1);
  }

  _applyParentChanges(bonusData, sign, bonusChanges = undefined) {
    // If changes are provided, calculate the inner difference between the changes and the bonus data (used in _preUpdate)
    if (!this.parent) return;
    if (bonusChanges) bonusData = innerNumericalOperation(bonusChanges, bonusData, (x, y) => x - y);
    if (!bonusData) return;

    // Add the correct suffixes to the bonuses keys, then calculate the inner sum between the bonus data and the parent data
    let sysDiff = this._applySuffix(bonusData);
    return this.parent.update({
      system: innerNumericalOperation(sysDiff, this.parent.system, (x, y) => x + sign * y),
    });
  }

  _applySuffix(bonusData) {
    let bonuses = flattenObject(bonusData);
    let result = {};
    for (let [key, value] of Object.entries(bonuses)) {
      if (key.includes('attributes') || key.includes('effects')) key += '.loot';
      else if (key.includes('weight')) key += '.max';
      result[key] = value;
    }
    return expandObject(result);
  }
}
