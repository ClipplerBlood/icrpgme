export class ICRPGItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
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
    if (this.item.isOwner) buttons = this._addLockedButton(buttons);
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
