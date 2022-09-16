export default class ICRPGActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['icrpg-actor-sheet'],
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
      scrollY: [],
    });
  }

  get template() {
    return 'systems/icrpgme/templates/actor/character-sheet.html';
  }

  async getData() {
    let content = super.getData();
    content.system = this.actor.system;
    console.log(content);
    content = this.prepareItems(content);
    return content;
  }

  prepareItems(content) {
    const itemsByType = new Map();
    for (const item of this.actor.items) {
      const type = item.type;
      itemsByType.has(type) ? itemsByType.get(type).push(item) : itemsByType.set(type, [item]);
    }
    content.loots = itemsByType.get('loot');
    content.abilities = itemsByType.get('ability');
    content.powers = itemsByType.get('power');
    content.augments = itemsByType.get('augment');
    return content;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Hearts selector
    html.find('.icrpg-selectable-heart').click((ev) => {
      const heartIndex = $(ev.currentTarget).closest('[data-index]').data('index');
      this.actor.update({ 'system.health.hearts': heartIndex + 1 });
    });

    // Items editor
    html.find('.item-editable input, .item-editable textarea').change((ev) => {
      const ct = $(ev.currentTarget);
      const itemId = ct.closest('[data-item-id]').data('itemId');
      const itemType = ct.closest('[data-item-type]').data('itemType');
      const target = ct.closest('[data-target]').data('target');
      const value = ct.prop('type') === 'checkbox' ? ct.prop('checked') : ct.val();

      if (itemId) {
        this.actor.items.get(itemId).update({ [target]: value });
      } else {
        if (typeof value === 'boolean' || !itemType) return;
        this.actor.createEmbeddedDocuments('Item', [{ type: itemType, [target]: value }]);
      }
    });
  }
}
