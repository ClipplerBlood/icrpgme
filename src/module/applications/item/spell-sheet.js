import ICRPGItemSheetV2 from './item-sheet-v2.js';

export default class ICRPGSpellSheet extends ICRPGItemSheetV2 {
  static PARTS = {
    header: {
      template: 'systems/icrpgme/templates/item/parts/item-header.hbs',
    },
    description: {
      template: 'systems/icrpgme/templates/item/parts/spell-description.hbs',
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
}
