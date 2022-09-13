export default class ICRPGActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['icrpg-actor-sheet'],
      width: 875,
      height: 700,
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
