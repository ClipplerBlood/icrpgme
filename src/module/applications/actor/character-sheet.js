import ICRPGBaseActorSheetV2 from './actor-sheet-v2.js';
import { onArrayEdit } from '../../utils/utils.js';

export default class ICRPGCharacterSheet extends ICRPGBaseActorSheetV2 {
  static PARTS = {
    header: {
      template: 'systems/icrpgme/templates/actor-v2/character/character-header.hbs',
    },
    character: {
      template: 'systems/icrpgme/templates/actor-v2/character/main-character-tab.hbs',
    },
    tabNavigation: {
      template: 'systems/icrpgme/templates/generic/tab-navigation.hbs',
    },
  };

  static DEFAULT_OPTIONS = {
    position: {
      width: 920,
      height: 'auto',
    },
    window: {
      resizable: false,
    },
  };

  static TABS = {
    primary: {
      tabs: [
        {
          id: 'character',
          label: 'ICRPG.tabs.character',
        },
        {
          id: 'lootAbilities',
          label: 'ICRPG.tabs.lootAbilities',
        },
        {
          id: 'resources',
          label: 'ICRPG.tabs.resources',
        },
        {
          id: 'notes',
          label: 'ICRPG.tabs.notes',
        },
      ],
      initial: 'character',
    },
  };

  async _onRender(context, options) {
    super._onRender(context, options);

    // Monster Actions edit
    const html = $(this.element);
    html.find('.actions-container.edit input, .actions-container.edit textarea').on('change', (ev) => {
      const ct = $(ev.currentTarget);
      const index = ct.closest('[data-action-index]').data('actionIndex');
      const update = onArrayEdit(this.actor.system.monsterActions, ev, index);
      this.actor.update({ 'system.monsterActions': update });
    });
    console.log(context);
  }
}
