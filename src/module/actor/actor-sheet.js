export default class ICRPGActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['icrpg-actor-sheet'],
      width: 920,
      height: 620,
      tabs: [],
      scrollY: [],
    });
  }

  get template() {
    return 'systems/icrpgme/templates/actor/actor-sheet.html';
  }

  async getData() {
    const content = super.getData();
    content.system = this.actor.system;

    // Fake data
    const x = {
      base: 1,
      lifeform: 2,
      loot: 3,
      total: 6,
    };
    content.system.attributes = {
      strength: x,
      dexterity: x,
      constitution: x,
      intelligence: x,
      wisdom: x,
      charisma: x,
      defense: x,
    };
    content.system.effects = {
      basic: x,
      weapons: x,
      guns: x,
      energy: x,
      ultimate: x,
    };
    content.system.dyingRounds = 0;
    return content;
  }
}
