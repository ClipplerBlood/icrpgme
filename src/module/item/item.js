import { innerNumericalOperation } from '../utils/utils.js';

export class ICRPGItem extends Item {
  // Note: pre update operations occur only for the client who requested
  async _preUpdate(changes, options, user) {
    await super._preUpdate(changes, options, user);

    if (!this.parent) return;
    let bonusesDiff = innerNumericalOperation(changes?.system?.bonuses, this.system.bonuses);
    if (!bonusesDiff) return;

    let bonusesDiffLoot = {};
    bonusesDiff = flattenObject(bonusesDiff);
    for (let [key, value] of Object.entries(bonusesDiff)) {
      if (key.includes('attributes') || key.includes('effects')) key += '.loot';
      else if (key.includes('weight')) key += '.max';
      bonusesDiffLoot[key] = value;
    }

    bonusesDiffLoot = expandObject(bonusesDiffLoot);
    const sysUpdateData = innerNumericalOperation(bonusesDiffLoot, this.parent.system, (x, y) => x + y);
    this.parent.update({ system: sysUpdateData });
  }
}
