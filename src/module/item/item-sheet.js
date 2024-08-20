import { i18n, onArrayEdit } from '../utils/utils.js';

export class ICRPGItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['icrpg-sheet item'],
      width: 700,
      height: 420,
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
    return 'systems/icrpgme/templates/item/generic-item.html';
  }

  async getData() {
    let content = super.getData();
    content.system = this.item.system;
    content.isLocked = this.isLocked ?? true;
    return content;
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    if (game.settings.get('icrpgme', 'hideSheetButton')) buttons = buttons.filter((b) => b.class !== 'configure-sheet');
    if (this.item.isOwner) buttons = this._addLockedButton(buttons);
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
        ct.removeClass('c-red');
        ev.currentTarget.innerHTML = `<i class="fas fa-lock"></i>${i18n('ICRPG.locked')}`;
      } else {
        ct.addClass('c-red');
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

  activateListeners(html) {
    super.activateListeners(html);
    if (this.item.type === 'power') this._activatePowerListeners(html);

    // Discrete selector
    html.find('.icrpg-discrete-selector').click((ev) => {
      const index = $(ev.currentTarget).closest('[data-index]').data('index');
      const target = $(ev.currentTarget).closest('[data-target]').data('target');
      let value = index + 1;
      if (getProperty(this.document, target) === value) value -= 1;
      this.document.update({ [target]: value });
    });
  }

  _activatePowerListeners(html) {
    html.find('.power-cost.edit input, .power-cost.edit textarea').on('change', (ev) => {
      const ct = $(ev.currentTarget);
      const index = ct.closest('[data-entry-index]').data('entryIndex');
      const defaultEntryConstructor = (val) => ({
        cost: val,
        description: '',
      });
      const update = onArrayEdit(this.document.system.spCosts, ev, index, defaultEntryConstructor, 'cost');
      this.document.update({ 'system.spCosts': update });
    });
  }

  _onToggleMinimize(ev) {
    if (ev.target.matches('.sheet-lock')) return;
    super._onToggleMinimize(ev);
  }
}
