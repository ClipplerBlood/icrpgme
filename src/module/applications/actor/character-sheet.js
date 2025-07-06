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
    loot: {
      template: 'systems/icrpgme/templates/actor-v2/character/loot-tab.hbs',
    },
    resources: {
      template: 'systems/icrpgme/templates/actor-v2/character/resources-tab.hbs',
    },
    notes: {
      template: 'systems/icrpgme/templates/actor-v2/character/notes-tab.hbs',
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
          id: 'loot',
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

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system.enrichedNotes = await TextEditor.enrichHTML(this.document.system.notes, { async: true });
    return context;
  }
}
