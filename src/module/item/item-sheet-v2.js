import { ICRPGBaseSheet } from '../app/base-sheet.js';

export default class ICRPGItemSheetV2 extends ICRPGBaseSheet {
  static DEFAULT_OPTIONS = {
    classes: ['icrpg-sheet-v2'],
    window: {
      resizable: true,
    },
    position: {
      width: 400,
    },
  };

  static PARTS = {
    header: {
      template: 'systems/icrpgme/templates/item/parts/item-header.hbs',
    },
    description: {
      template: 'systems/icrpgme/templates/item/parts/item-description.hbs',
    },
    bonuses: {
      template: 'systems/icrpgme/templates/item/parts/item-bonuses.hbs',
    },

    tabNavigation: {
      template: 'systems/icrpgme/templates/generic/tab-navigation.hbs',
    },
  };

  static TABS = {
    primary: {
      tabs: [
        {
          id: 'description',
          label: 'ICRPG.tabs.item',
        },
        {
          id: 'bonuses',
          label: 'ICRPG.tabs.bonuses',
        },
      ],
      initial: 'description',
    },
  };
}
