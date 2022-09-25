import { requestRollDialog } from '../dialog/roll-dialogs.js';
import { postItemMessage } from '../chat/chat-item.js';
import { i18n, trimNewLineWhitespace } from '../utils/utils.js';

export default class ICRPGActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['icrpg-sheet actor'],
      width: 920,
      height: 620,
      tabs: [
        {
          group: 'primary-tabs',
          navSelector: '.icrpg-sheet-nav',
          contentSelector: '.icrpg-tab-container',
          initial: 'primary',
        },
      ],
      scrollY: ['.icrpg-tab-container'],
      resizable: false,
    });
  }

  get template() {
    if (this.actor.type === 'character') return 'systems/icrpgme/templates/actor/character-sheet.html';
    else return 'systems/icrpgme/templates/actor/monster-sheet.html';
  }

  async getData() {
    let content = super.getData();
    content.system = this.actor.system;
    content = this.prepareItems(content);
    content.isLocked = this.isLocked ?? true;
    content.system.enrichedNotes = await TextEditor.enrichHTML(this.actor.system.notes, { async: true });
    return content;
  }

  prepareItems(content) {
    // Store each item in a map by type
    const itemsByType = new Map();
    for (const item of this.actor.items) {
      const type = item.type;
      itemsByType.has(type) ? itemsByType.get(type).push(item) : itemsByType.set(type, [item]);
    }

    // Then for each type construct the items list
    content.loots = itemsByType.get('loot');
    content.abilities = itemsByType.get('ability');
    content.powers = itemsByType.get('power');
    content.augments = itemsByType.get('augment');
    return content;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (this.actor.type === 'character') this._activateCharacterListeners(html);
    else if (this.actor.type === 'monster') this._activateMonsterListeners(html);

    // Hearts selector
    html.find('.icrpg-selectable-heart').click((ev) => {
      const heartIndex = $(ev.currentTarget).closest('[data-index]').data('index');
      this.actor.update({ 'system.health.hearts': heartIndex + 1 });
    });

    // Rolls
    html.find('[data-roll]').click((ev) => {
      const rollName = $(ev.currentTarget).closest('[data-roll]').data('roll');
      const rollGroup = $(ev.currentTarget).closest('[data-group]').data('group');
      if (ev.altKey) requestRollDialog(this.actor, rollName, rollGroup);
      else this.actor.roll(rollName, rollGroup);
    });
  }

  _activateCharacterListeners(html) {
    // Items editor
    html.find('.item-editable input, .item-editable textarea, input[type="checkbox"]').change((ev) => {
      const ct = $(ev.currentTarget);
      const itemId = ct.closest('[data-item-id]').data('itemId');
      const itemType = ct.closest('[data-item-type]').data('itemType');
      const target = ct.closest('[data-target]').data('target');
      let value = ct.prop('type') === 'checkbox' ? ct.prop('checked') : ct.val();

      // Trim starting whitespace
      if (typeof value === 'string') value = trimNewLineWhitespace(value);

      if (itemId) {
        this.actor.items.get(itemId).update({ [target]: value });
      } else {
        if (typeof value === 'boolean' || !itemType) return;
        this.actor.createEmbeddedDocuments('Item', [{ type: itemType, [target]: value }]);
      }
    });

    // Items context menu
    let itemContextMenu = [
      {
        name: i18n('ICRPG.contextMenu.openItem'),
        icon: '<i class="fas fa-scroll"></i>',
        callback: (header) => {
          const itemId = header.closest('[data-item-id]').data('itemId');
          this.actor.items.get(itemId)?.sheet.render(true);
        },
      },
    ];

    if (!(this.isLocked ?? true))
      itemContextMenu.push({
        name: i18n('Delete'),
        icon: '<i class="fas fa-times"></i>',
        condition: this.actor.isOwner,
        callback: (header) => {
          const itemId = header.closest('[data-item-id]').data('itemId');
          this.actor.items.get(itemId)?.delete();
        },
      });
    ContextMenu.create(this, html, '.icrpg-actor-item-loot', itemContextMenu);

    // Item click
    html.find('.item-clickable input[data-target="name"]').click((ev) => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      postItemMessage(this.actor, itemId);
    });

    // Discrete selector (Mastery, resources, ecc)
    html.find('.icrpg-discrete-selector').click((ev) => {
      const index = $(ev.currentTarget).closest('[data-index]').data('index');
      const target = $(ev.currentTarget).closest('[data-target]').data('target');
      let value = index + 1;
      if (getProperty(this.actor, target) === value) value -= 1;
      this.actor.update({ [target]: value });
    });
  }

  _activateMonsterListeners(html) {
    // Monster Actions edit
    html.find('.monster-action.edit input, .monster-action.edit textarea').on('change', (ev) => {
      const ct = $(ev.currentTarget);
      const actionIndex = ct.closest('[data-action-index]').data('actionIndex');
      const target = ct.closest('[data-target]').data('target');
      const value = ct.val();

      let monsterActions = this.actor.system.monsterActions;
      if (actionIndex < 0) {
        // Create
        monsterActions.push({
          name: target === 'name' ? value : '',
          description: '',
        });
      } else {
        // Update
        const action = monsterActions[actionIndex];
        action.name = target === 'name' ? value : action.name;
        action.description = target === 'description' ? value : action.description;

        // Delete
        if (!action.name.length) monsterActions.splice(actionIndex, 1);
      }
      this.actor.update({ 'system.monsterActions': monsterActions });
    });
  }

  // --------------------------------------------------------------------------
  _getHeaderButtons() {
    // Get default buttons, removing the sheet configuration
    let buttons = super._getHeaderButtons();
    buttons = buttons.filter((b) => b.class !== 'configure-sheet');
    buttons = this._addLockedButton(buttons);
    return buttons;
  }

  _addLockedButton(buttons) {
    // Callback
    const lockCb = (ev) => {
      ev.stopPropagation();
      ev.stopImmediatePropagation();

      const ct = $(ev.currentTarget);
      const _isLocked = ct.prop('value') ?? false;
      this.isLocked = _isLocked;
      ct.prop('value', !_isLocked);

      const fas = $(ev.currentTarget).find('i.fas');
      fas.toggleClass('fa-lock');
      fas.toggleClass('fa-unlock');
      fas.toggleClass('c-red');
      this.render();

      const notification = _isLocked ? 'ICRPG.notifications.lockedSheet' : 'ICRPG.notifications.unlockedSheet';
      ui.notifications.info(notification, { localize: true });
    };

    // Add the button
    const isLocked = this.isLocked ?? true;
    buttons.unshift({
      label: '',
      class: isLocked ? 'sheet-lock' : 'sheet-unlock',
      icon: isLocked ? 'fas fa-lock' : 'fas fa-lock-open c-red',
      onclick: lockCb,
    });

    return buttons;
  }
}
