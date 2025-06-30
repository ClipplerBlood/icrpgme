import ICRPGSheetMixin from '../icrpg-sheet-mixin.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export default class ICRPGItemSheetV2 extends ICRPGSheetMixin(HandlebarsApplicationMixin(ItemSheetV2)) {
  static DEFAULT_OPTIONS = {
    classes: ['icrpg-sheet-v2', 'item'],
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

  static PARTS_NON_EDITABLE = ['bonuses', 'tabNavigation'];
  static PARTS_NON_VISIBLE = ['description'];

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
