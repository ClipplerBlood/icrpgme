import ICRPGSheetMixin from '../icrpg-sheet-mixin.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export default class ICRPGActorSheetV2 extends ICRPGSheetMixin(HandlebarsApplicationMixin(ActorSheetV2)) {
  static DEFAULT_OPTIONS = {
    classes: ['icrpg-sheet-v2', 'actor'],
    window: {
      resizable: true,
    },
    position: {
      width: 400,
    },
    actions: {
      setHearts: ICRPGActorSheetV2.setHearts,
      useAction: ICRPGActorSheetV2.useAction,
    },
  };

  /**
   * Set the number of hearts after a click event
   * @param _event
   * @param target
   */
  static setHearts(_event, target) {
    const heartIndex = Number(target.dataset['index']);
    const currentHearts = this.document.system.health.hearts;
    const newHearts = heartIndex + 1;

    let finalHearts;
    if (newHearts !== currentHearts) finalHearts = newHearts;
    else finalHearts = currentHearts - 0.5;

    this.document.update({ 'system.health.hearts': finalHearts });
  }

  static useAction(_event, target) {
    const { actionIndex } = target.dataset;
    this.actor.useAction(actionIndex);
  }
}
