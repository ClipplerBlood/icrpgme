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
      roll: ICRPGActorSheetV2.roll,
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

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor ??= context.document;
    context.trackDamage = game.settings.get('icrpgme', 'trackDamage');
    return context;
  }

  static async roll(_event, target) {
    const rollName = target.closest('[data-roll]')?.dataset.roll;
    const rollGroup = target.closest('[data-group]')?.dataset.group;
    await this.actor.roll(rollName, rollGroup);
  }

  async _onRender(context, options) {
    super._onRender(context, options);

    const lock = this.window.editSlider.querySelector('.slide-toggle-thumb');
    if (lock) {
      this.element.querySelectorAll('input[readonly]').forEach((input) => {
        input.addEventListener('click', () => {
          lock.classList.add('shake-animation');
          setTimeout(() => lock.classList.remove('shake-animation'), 500);
        });
      });
    }
  }

  _getHeaderControls() {
    const controls = super._getHeaderControls();
    controls.push({
      action: 'configurePrototypeToken',
      icon: 'fa-solid fa-hand-sparkles',
      label: 'DOCUMENT.ActiveEffects',
      ownership: 'OWNER',
    });
    return controls;
  }
}
