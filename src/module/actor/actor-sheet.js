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
    return content;
  }
}
