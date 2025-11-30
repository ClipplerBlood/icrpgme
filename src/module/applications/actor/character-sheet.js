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
      scrollable: [''],
    },
    resources: {
      template: 'systems/icrpgme/templates/actor-v2/character/resources-tab.hbs',
      scrollable: [''],
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
      selectorClick: ICRPGCharacterSheet.selectorClick,
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

    // In place item creation
    this.element.querySelectorAll('.loot-tab input[data-type]').forEach((input) => {
      input.addEventListener('change', (e) => this.createItemInPlace(e));
    });

    // Resource edit
    this.element.querySelectorAll('[data-resource-index] input').forEach((input) => {
      input.addEventListener('change', (e) => this.onResourceEdit(e));
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
    context.noItems = items.size === 0;

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
    this.actor.items.get(itemId).update({ 'system.equipped': true, 'system.carried': false });
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

  static selectorClick(_event, target) {
    let index = target.closest('[data-index]').dataset.index;
    if (index == null) return;
    index = Number(index);

    const t = target.closest('[data-target]').dataset.target;
    let oldValue = foundry.utils.getProperty(this.actor, t);
    let newValue = index + 1;
    if (oldValue === newValue) newValue = 0;
    this.actor.update({ [t]: newValue });
  }

  async createItemInPlace(event) {
    const itemType = event.currentTarget.dataset.type;
    const value = event.currentTarget.value;

    console.log(event, itemType, value);
    const docs = await this.actor.createEmbeddedDocuments('Item', [{ type: itemType, name: value }]);
    await docs[0].sheet.render({ force: true, locked: false });
  }

  async onResourceEdit(e) {
    let index = e.currentTarget.closest('[data-resource-index]').dataset.resourceIndex;
    if (index == null) return;
    index = Number(index);

    const value = e.currentTarget.value;
    const target = e.currentTarget.dataset.target;
    const resources = this.actor.system.resources;
    const options = {};
    if (index < 0) {
      console.assert(target === 'name');
      resources.push({ name: value, value: 0, max: 1 });
      options.updateResourceIndex = resources.length - 1;
    } else {
      if ((target === 'max' && parseInt(value) <= 0) || String(value).length === 0) {
        resources.splice(index, 1);
      } else {
        resources[index][target] = value;
        options.updateResourceIndex = index;
      }
    }
    this.actor.update({ 'system.resources': resources }, options);
  }
}
