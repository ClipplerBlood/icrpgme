import { i18n, onArrayEdit, trimNewLineWhitespace } from '../utils/utils.js';
import { isQuickInsertOn, prepareQuickInsertSheet } from '../modules-integration.js';
const { ActorSheet } = foundry.appv1.sheets;
const ContextMenu = foundry.applications.ux.ContextMenu.implementation;

export default class ICRPGActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
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
    const t = this.actor.type;
    if (t === 'character') return 'systems/icrpgme/templates/actor/character-sheet.html';
    else if (t === 'monster') return 'systems/icrpgme/templates/actor/monster-sheet.html';
    else if (t === 'obstacle') return 'systems/icrpgme/templates/actor/obstacle-sheet.html';
    else if (t === 'vehicle') return 'systems/icrpgme/templates/actor/vehicle-sheet.html';
    else if (t === 'hardSuit') return 'systems/icrpgme/templates/actor/hardsuit-sheet.html';
    return '';
  }

  async getData() {
    let content = super.getData();
    content.spellbookViewMode = this.actor.getFlag('icrpgme', 'spellbookViewMode') ?? 'all';
    content.system = this.actor.system;
    content = this.prepareItems(content);
    content.isLocked = this.isLocked ?? true;
    content.isQuickInsertOn = isQuickInsertOn();

    content.system.enrichedNotes = await TextEditor.enrichHTML(this.actor.system.notes, { async: true });
    content.trackDamage = game.settings.get('icrpgme', 'trackDamage');
    if (this.actor.type === 'hardSuit') content = this.prepareHardSuit(content);
    return content;
  }

  prepareItems(content) {
    // Store each item in a map by type
    const itemsByType = new Map();
    for (const item of this.actor.items) {
      const type = item.type;
      itemsByType.has(type) ? itemsByType.get(type).push(item) : itemsByType.set(type, [item]);
    }

    // Then for each type construct the items list, sorting it
    const sort = (list) => {
      list?.sort((a, b) => a.sort - b.sort);
      return list;
    };

    if (content.spellbookViewMode === 'spells') content.loots = itemsByType.get('spell') ?? [];
    else if (content.spellbookViewMode === 'items') content.loots = itemsByType.get('loot') ?? [];
    else content.loots = [...(itemsByType.get('loot') ?? []), ...(itemsByType.get('spell') ?? [])];

    content.loots = sort(content.loots);
    content.abilities = sort(itemsByType.get('ability'));
    content.powers = sort(itemsByType.get('power'));
    content.augments = sort(itemsByType.get('augment'));
    content.properties = sort(itemsByType.get('property'));
    content.parts = sort(itemsByType.get('part'));
    return content;
  }

  prepareHardSuit(content) {
    content.availablePilots = game.actors
      .filter((a) => a.type === 'character' && a.isOwner)
      .map((a) => ({
        id: a.id,
        name: a.name,
      }));
    const parts = content.parts ?? [];
    content.parts = {
      core: parts.filter((p) => p.system.partType === 'core'),
      leftArm: parts.filter((p) => p.system.partType === 'leftArm'),
      rightArm: parts.filter((p) => p.system.partType === 'rightArm'),
      legs: parts.filter((p) => p.system.partType === 'legs'),
    };
    return content;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.clickable-action').click((ev) => this._onUse(ev));

    if (this.actor.type === 'character') this._activateCharacterListeners(html);
    else if (this.actor.type === 'monster') this._activateMonsterListeners(html);
    else if (this.actor.type === 'vehicle') return this._activateVehicleListeners(html);
    else if (this.actor.type === 'hardSuit') {
      this._activateCharacterListeners(html);
      this._activateHardSuitListeners(html);
    }

    // Hearts selector
    html.find('.icrpg-selectable-heart').click((ev) => {
      const heartIndex = $(ev.currentTarget).closest('[data-index]').data('index');
      const currentHearts = this.actor.system.health.hearts;
      const newHearts = heartIndex + 1;

      let finalHearts;
      if (newHearts !== currentHearts) finalHearts = newHearts;
      else finalHearts = currentHearts - 0.5;

      this.actor.update({ 'system.health.hearts': finalHearts });
    });

    // Rolls
    html.find('[data-roll]').click((ev) => {
      const rollName = $(ev.currentTarget).closest('[data-roll]').data('roll');
      const rollGroup = $(ev.currentTarget).closest('[data-group]').data('group');
      // if (ev.altKey) requestRollDialog(this.actor, rollName, rollGroup);
      // else this.actor.roll(rollName, rollGroup);
      this.actor.roll(rollName, rollGroup);
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
        const item = this.actor.items.get(itemId);
        if (target === 'system.carried' && value) {
          const current = this.actor.system.weight.carried;
          if (current.value + item.system.weight > current.max) {
            ui.notifications.warn(i18n('ICRPG.notifications.maxCarried'));
            return;
          }
        }
        if (target === 'system.equipped' && value) {
          const current = this.actor.system.weight.equipped;
          if (current.value + item.system.weight > current.max) {
            ui.notifications.warn(i18n('ICRPG.notifications.maxEquipped'));
            return;
          }
        }
        item.update({ [target]: value });
      } else {
        if (typeof value === 'boolean' || !itemType) return;
        const system = {};
        const hardShellPartType = ct.closest('[data-part-type]').data('partType');
        if (hardShellPartType) system.partType = hardShellPartType;
        this.actor.createEmbeddedDocuments('Item', [{ type: itemType, [target]: value, system }]);
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
      {
        name: i18n('Delete'),
        icon: '<i class="fas fa-times"></i>',
        condition: this.actor.isOwner,
        callback: (header) => {
          const itemId = header.closest('[data-item-id]').data('itemId');
          this.actor.items.get(itemId)?.delete();
        },
      },
    ];

    ContextMenu.create(this, html, '.icrpg-actor-item-loot[data-item-id]', itemContextMenu);

    // Item click
    html.find('.item-clickable input[data-target="name"]').click((ev) => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      this.actor.useItem(itemId);
    });

    // Discrete selector (Mastery)
    html.find('[data-tab="resources"] .icrpg-discrete-selector').click((ev) => {
      const index = $(ev.currentTarget).closest('[data-index]').data('index');
      const target = $(ev.currentTarget).closest('[data-target]').data('target');
      let value = index + 1;
      if (foundry.utils.getProperty(this.actor, target) === value) value -= 1;
      this.actor.update({ [target]: value });
    });

    // Item discrete selector
    html.find('[data-item-id] .icrpg-discrete-selector').click((ev) => {
      const index = $(ev.currentTarget).closest('[data-index]').data('index');
      const target = $(ev.currentTarget).closest('[data-target]').data('target');
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      const item = this.actor.items.get(itemId);
      if (!item) return;

      let value = index + 1;
      if (foundry.utils.getProperty(item, target) === value) value -= 1;
      item.update({ [target]: value });
    });

    // Resource tracker edit
    html.find('.icrpg-resource-tracker input').on('change', (ev) => {
      const ct = $(ev.currentTarget);
      const resourceIndex = ct.closest('[data-resource-index]').data('resourceIndex');
      if (resourceIndex == null) return;
      const resources = this.actor.system.resources;
      const target = ct.closest('[data-target]').data('target');
      const value = ct.val();
      if (resourceIndex < 0) {
        console.assert(target === 'name');
        resources.push({
          name: value,
          value: 0,
          max: 1,
        });
      } else {
        if ((target === 'max' && parseInt(value) <= 0) || String(value).length === 0)
          resources.splice(resourceIndex, 1);
        else resources[resourceIndex][target] = value;
      }
      this.actor.update({ 'system.resources': resources }, { updateResourceIndex: resourceIndex });
    });

    // Locked input animation
    html.find('[data-tab="primary"] input[readonly]').click(() => {
      const lock = this.element.find('.fa-lock');
      lock.addClass('shake');
      setTimeout(() => lock.removeClass('shake'), 500);
    });

    // QuickInsert
    prepareQuickInsertSheet(this, html);

    // Spellbook view toggle
    html.find('.spellbook-view-toggle').click(() => {
      let mode = this.actor.getFlag('icrpgme', 'spellbookViewMode') ?? 'all';
      if (mode === 'all') mode = 'spells';
      else if (mode === 'spells') mode = 'items';
      else mode = 'all';
      ui.notifications.info('ICRPG.notifications.spellbookViewMode.' + mode, { localize: true });
      this.actor.setFlag('icrpgme', 'spellbookViewMode', mode);
    });
  }

  _activateMonsterListeners(html) {
    // Monster Actions edit
    html.find('.monster-action.edit input, .monster-action.edit textarea').on('change', (ev) => {
      const ct = $(ev.currentTarget);
      const index = ct.closest('[data-action-index]').data('actionIndex');
      const update = onArrayEdit(this.actor.system.monsterActions, ev, index);
      this.actor.update({ 'system.monsterActions': update });
    });
  }

  _activateVehicleListeners(html) {
    // Vehicle Chunk edit
    html.find('.vehicle-chunk.edit input, .vehicle-chunk.edit textarea').on('change', (ev) => {
      const ct = $(ev.currentTarget);
      const index = ct.closest('[data-chunk-index]').data('chunkIndex');
      const defaultEntryConstructor = (val) => ({
        name: val,
        description: '',
        health: { hearts: 1, max: 10, damage: 0, value: 10 },
      });
      const update = onArrayEdit(this.actor.system.chunks, ev, index, defaultEntryConstructor);
      this.actor.update({ 'system.chunks': update });
    });

    // Chunk Hearts selector
    // Toggles between 1 heart and half
    html.find('.icrpg-selectable-heart').click((ev) => {
      const chunkIndex = $(ev.currentTarget).closest('[data-chunk-index]').data('chunkIndex');
      const chunks = this.actor.system.chunks;
      const currentHearts = chunks[chunkIndex].health.hearts;
      chunks[chunkIndex].health.hearts = currentHearts === 1 ? 0.5 : 1;
      this.actor.update({ 'system.chunks': chunks });
    });

    // Vehicle Maneuvers edit
    html.find('.vehicle-maneuver.edit input, .vehicle-maneuver textarea').on('change', (ev) => {
      const ct = $(ev.currentTarget);
      const index = ct.closest('[data-maneuver-index]').data('maneuverIndex');
      const update = onArrayEdit(this.actor.system.maneuvers, ev, index);
      this.actor.update({ 'system.maneuvers': update });
    });
  }

  _activateHardSuitListeners(html) {
    // Item use
    html.find('.item-clickable strong').click((ev) => {
      const itemId = $(ev.currentTarget).closest('[data-item-id]').data('itemId');
      this.actor.useItem(itemId);
    });
  }

  // --------------------------------------------------------------------------
  _getHeaderButtons() {
    // Get default buttons, removing the sheet configuration
    let buttons = super._getHeaderButtons();
    if (game.settings.get('icrpgme', 'hideSheetButton')) buttons = buttons.filter((b) => b.class !== 'configure-sheet');
    if (this.actor.isOwner && this.actor.type !== 'obstacle') buttons = this._addLockedButton(buttons);
    return buttons;
  }

  _addLockedButton(buttons) {
    if (!this.isEditable) return buttons;
    // Callback
    const lockCb = (ev) => {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      const ct = $(ev.currentTarget);
      const _isLocked = ct.prop('value') ?? false;
      this.isLocked = _isLocked;
      ct.prop('value', !_isLocked);
      if (_isLocked) {
        ev.currentTarget.innerHTML = `<i class="fas fa-lock"></i>${i18n('ICRPG.locked')}`;
      } else {
        ev.currentTarget.innerHTML = `<i class="fas fa-unlock"></i><strong>${i18n('ICRPG.unlocked')}</strong>`;
      }
      this.render();
      const notification = _isLocked ? 'ICRPG.notifications.lockedSheet' : 'ICRPG.notifications.unlockedSheet';
      ui.notifications.info(notification, { localize: true });
    };

    // Add the button
    const isLocked = this.isLocked ?? true;
    buttons.unshift({
      label: isLocked ? 'ICRPG.locked' : 'ICRPG.unlocked',
      class: isLocked ? 'sheet-lock' : 'sheet-unlock',
      icon: isLocked ? 'fas fa-lock' : 'fas fa-lock-open c-red',
      onclick: lockCb,
    });

    return buttons;
  }

  async _render(force = false, options = {}) {
    const t = this.actor.type;
    if (t === 'obstacle') options = foundry.utils.mergeObject(options, { width: 420, height: 700 });
    return super._render(force, options);
  }

  _onUse(ev) {
    if (!(this.isLocked ?? true)) return;
    const ct = $(ev.currentTarget);
    const itemId = ct.closest('[data-item-id]').data('itemId');
    const entryIndex = ct.closest('[data-entry-index]').data('entryIndex');
    const actionIndex = ct.closest('[data-action-index]').data('actionIndex');
    if (itemId) return this.actor.useItem(itemId, { index: entryIndex });
    if (actionIndex != null) return this.actor.useAction(actionIndex);
  }

  _onToggleMinimize(ev) {
    if (ev.target.matches('.sheet-lock')) return;
    super._onToggleMinimize(ev);
  }
}
