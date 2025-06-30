import ICRPGBaseItemSheetV2 from '../item-sheet-v2.js';

export default class ICRPGSpellSheet extends ICRPGBaseItemSheetV2 {
  static PARTS = {
    header: {
      template: 'systems/icrpgme/templates/item/parts/item-header.hbs',
    },
    description: {
      template: 'systems/icrpgme/templates/item/parts/spell-description.hbs',
    },
    bonuses: {
      template: 'systems/icrpgme/templates/item/parts/item-bonuses.hbs',
    },

    tabNavigation: {
      template: 'systems/icrpgme/templates/generic/tab-navigation.hbs',
    },
  };
}
