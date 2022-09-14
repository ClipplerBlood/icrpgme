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
  }
}
