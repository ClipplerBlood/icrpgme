import ICRPGBaseActorSheetV2 from './actor-sheet-v2.js';
import { onArrayEdit } from '../../utils/utils.js';

export default class ICRPGMonsterSheet extends ICRPGBaseActorSheetV2 {
  static PARTS = {
    header: {
      template: 'systems/icrpgme/templates/actor-v2/monster/monster-sheet.hbs',
      scrollable: [''],
    },
  };

  static DEFAULT_OPTIONS = {
    position: {
      width: 640,
    },
  };

  async _onRender(context, options) {
    super._onRender(context, options);

    // Monster Actions edit
    const html = $(this.element);
    html
      .find('.icrpg-monster-actions-container.edit input, .icrpg-monster-actions-container.edit textarea')
      .on('change', (ev) => {
        const ct = $(ev.currentTarget);
        const index = ct.closest('[data-action-index]').data('actionIndex');
        const update = onArrayEdit(this.actor.system.monsterActions, ev, index);
        this.actor.update({ 'system.monsterActions': update });
      });
  }
}
