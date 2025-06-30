import ICRPGBaseItemSheetV2 from '../item-sheet-v2.js';
import { onArrayEdit } from '../../utils/utils.js';

export default class ICRPGPowerSheet extends ICRPGBaseItemSheetV2 {
  static PARTS = {
    header: {
      template: 'systems/icrpgme/templates/item/parts/item-header.hbs',
    },
    description: {
      template: 'systems/icrpgme/templates/item/parts/power-description.hbs',
      scrollable: [''],
    },
    bonuses: {
      template: 'systems/icrpgme/templates/item/parts/item-bonuses.hbs',
      scrollable: [''],
    },

    tabNavigation: {
      template: 'systems/icrpgme/templates/generic/tab-navigation.hbs',
    },
  };

  async _onRender(context, options) {
    await super._onRender(context, options);

    const html = $(this.element);
    html.find('.power-cost.edit input, .power-cost.edit textarea').on('change', (ev) => {
      const ct = $(ev.currentTarget);
      const index = ct.closest('[data-entry-index]').data('entryIndex');
      const defaultEntryConstructor = (val) => ({
        cost: Number(val),
        description: '',
      });
      const update = onArrayEdit(this.document.system.spCosts, ev, index, defaultEntryConstructor, 'cost');
      this.document.update({ 'system.spCosts': update });
    });
  }
}
