import ICRPGBaseActorSheetV2 from './actor-sheet-v2.js';
import { i18n } from '../../utils/utils.js';
const ContextMenu = foundry.applications.ux.ContextMenu.implementation;
const TextEditor = foundry.applications.ux.TextEditor.implementation;

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
    classes: ['character'],
    actions: {
      useItem: ICRPGCharacterSheet.useItem,
      equipItem: ICRPGCharacterSheet.equipItem,
      carryItem: ICRPGCharacterSheet.carryItem,
      uncarryItem: ICRPGCharacterSheet.uncarryItem,
      setPowerMastery: ICRPGCharacterSheet.setPowerMastery,
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

    // Items context menu
    let itemContextMenu = [
      {
        name: i18n('ICRPG.contextMenu.openItem'),
        icon: '<i class="fas fa-scroll"></i>',
        callback: (header) => {
          const itemId = $(header).closest('[data-item-id]').data('itemId');
          this.actor.items.get(itemId).sheet.render(true);
        },
      },
      {
        name: i18n('Delete'),
        icon: '<i class="fas fa-times"></i>',
        condition: this.actor.isOwner,
        callback: (header) => {
          const itemId = $(header).closest('[data-item-id]').data('itemId');
          this.actor.items.get(itemId)?.delete();
        },
      },
    ];
    new ContextMenu(this.element, '.item[data-item-id]', itemContextMenu, { jQuery: false });

    this.element.querySelectorAll('.loot-tab input[data-type]').forEach((input) => {
      input.addEventListener('change', (e) => this.createItemInPlace(e));
    });
    console.log(context);
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.system.enrichedNotes = await TextEditor.enrichHTML(this.document.system.notes, { async: true });

    let items = context.document.items;

    context.loot = items.filter((i) => i.type === 'loot');
    context.abilities = items.filter((i) => i.type === 'ability');
    context.powers = items.filter((i) => i.type === 'power');
    context.augments = items.filter((i) => i.type === 'augment');
    context.spells = items.filter((i) => i.type === 'spell');

    return context;
  }

  // ====== ACTIONS ======

  static useItem(_event, target) {
    const itemId = target.closest('[data-item-id]').dataset.itemId;
    let entryIndex = target.closest('[data-entry-index]')?.dataset?.entryIndex;
    this.actor.useItem(itemId, { index: entryIndex });
  }

  static equipItem(_event, target) {
    const itemId = target.closest('[data-item-id]').dataset.itemId;
    this.actor.items.get(itemId).update({ 'system.equipped': true, 'system.carried': true });
  }

  static carryItem(_event, target) {
    const itemId = target.closest('[data-item-id]').dataset.itemId;
    this.actor.items.get(itemId).update({ 'system.equipped': false, 'system.carried': true });
  }

  static uncarryItem(_event, target) {
    const itemId = target.closest('[data-item-id]').dataset.itemId;
    this.actor.items.get(itemId).update({ 'system.equipped': false, 'system.carried': false });
  }

  static setPowerMastery(_event, target) {
    const itemId = target.closest('[data-item-id]').dataset.itemId;
    let index = target.closest('[data-index]').dataset.index;
    const power = this.actor.items.get(itemId);
    const currentMastery = power.system.mastery;
    if (currentMastery == index) index = 0;
    power.update({ 'system.mastery': index });
  }

  async createItemInPlace(event) {
    const itemType = event.currentTarget.dataset.type;
    const value = event.currentTarget.value;

    console.log(event, itemType, value);
    const docs = await this.actor.createEmbeddedDocuments('Item', [{ type: itemType, name: value }]);
    await docs[0].sheet.render({ force: true, locked: false });
  }
}
