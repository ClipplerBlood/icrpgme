export function integrateExternalModules() {
  Hooks.once('diceSoNiceReady', initDiceSoNice);
}

function initDiceSoNice(dice3d) {
  dice3d.addSystem({ id: 'icrpgme', name: 'Index Card RPG: Master Edition' }, 'preferred');
  dice3d.addColorset(
    {
      name: 'Index Card RPG: Master Edition',
      category: 'System',
      description: 'ICRPG',
      foreground: '#ffffff',
      background: '#b22227',
      outline: '#b22227',
      edge: '#b22227',
      material: 'wood',
      font: 'Uberlin',
      default: true,
      fontScale: {
        d2: 2,
        d3: 1.8,
        d4: 1.5,
        d5: 1.2,
        d6: 1.8,
        d8: 1.2,
        d10: 1.2,
        d12: 1.8,
        d20: 1.2,
        d100: 1,
      },
    },
    'preferred',
  );
}

/* globals QuickInsert */
export function isQuickInsertOn() {
  return game.modules.get('quick-insert')?.active && QuickInsert != null;
}

/**
 * Adds the quick insert functionality to the character sheet
 * @param {ICRPGActorSheet} actorSheet
 * @param {JQuery} html
 */
export function prepareQuickInsertSheet(actorSheet, html) {
  html.find('.icrpg-quick-insert').click((ev) => {
    const ct = $(ev.currentTarget);
    const itemType = ct.closest('[data-item-type]').data('itemType');
    quickInsertItem(actorSheet.actor, itemType);
  });
}

/**
 * Calls the QuickInsert module for adding an item a character (from the sheet)
 * @param actor
 * @param _itemType
 */
function quickInsertItem(actor, _itemType) {
  if (!isQuickInsertOn()) return;
  QuickInsert.open({
    // All fields are optional
    // spawnCSS: {
    //   // This entire object is passed to JQuery .css()
    //   // https://api.jquery.com/css/#css-properties
    //   left: 600,
    //   top: 100,
    // },

    classes: ['icrpg-quick-insert'], // A list of classes to be added to the search app
    // filter: "dnd5e.items",   // The name of a filter to pre-fill the search
    // startText: "bla",        // The search input will be pre-filled with this text
    // allowMultiple: true,     // Unless set to `false`, the user can submit multiple times using the shift key
    restrictTypes: ['Item'], // Restrict the output to these document types only
    onSubmit: async (item) => {
      // Do something with the selected item, e.g.
      const document = await fromUuid(item.uuid);
      actor.createEmbeddedDocuments('Item', [document.toObject()]);
    },
    onClose: () => {
      // You can do something when the search app is closed
    },
  });
}
