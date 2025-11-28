import { i18n, i18ns, plusify } from './utils/utils.js';

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

Hooks.on('tokenActionHudCoreApiReady', async (coreModule) => {
  let RollHandler = class RollHandler extends coreModule.api.RollHandler {
    /**
     * Handle action click
     * Called by Token Action HUD Core when an action is left or right-clicked
     * @override
     * @param {object} event        The event
     * @param {string} encodedValue The encoded value
     */
    async handleActionClick(event, encodedValue) {
      const [actionTypeId, actionId] = encodedValue.split('|');

      const renderable = ['item'];

      if (renderable.includes(actionTypeId) && this.isRenderItem()) {
        return this.doRenderItem(this.actor, actionId);
      }

      const knownCharacters = ['character', 'monster'];

      // If single actor is selected
      if (this.actor) {
        await this.#handleAction(event, this.actor, this.token, actionTypeId, actionId);
        return;
      }

      const controlledTokens = canvas.tokens.controlled.filter((token) => knownCharacters.includes(token.actor?.type));

      // If multiple actors are selected
      for (const token of controlledTokens) {
        const actor = token.actor;
        await this.#handleAction(event, actor, token, actionTypeId, actionId);
      }
    }

    /**
     * Handle action hover
     * Called by Token Action HUD Core when an action is hovered on or off
     * @override
     * @param {object} _event        The event
     * @param {string} _encodedValue The encoded value
     */
    async handleActionHover(_event, _encodedValue) {}

    /**
     * Handle group click
     * Called by Token Action HUD Core when a group is right-clicked while the HUD is locked
     * @override
     * @param {object} event The event
     * @param {object} group The group
     */
    async handleGroupClick(_event, _group) {}

    /**
     * Handle action
     * @private
     * @param {object} event        The event
     * @param {object} actor        The actor
     * @param {object} token        The token
     * @param {string} actionTypeId The action type id
     * @param {string} actionId     The actionId
     */
    async #handleAction(event, actor, token, actionTypeId, actionId) {
      switch (actionTypeId) {
        case 'attribute':
          await actor.roll(actionId, 'attributes');
          break;
        case 'effort':
          await actor.roll(actionId, 'efforts');
          break;
        case 'item':
          await actor.useItem(actionId);
          break;
        case 'monsterAction':
          await actor.useAction(actionId);
          break;
      }
    }
  };

  /**
   * Return the SystemManager and requiredCoreModuleVersion to Token Action HUD Core
   */
  let SystemManager = class SystemManager extends coreModule.api.SystemManager {
    /**
     * Returns an instance of the ActionHandler to Token Action HUD Core
     * Called by Token Action HUD Core
     * @override
     * @returns {class} The ActionHandler instance
     */
    getActionHandler() {
      console.log('Getting action handler for ICRPGME.');
      // return new ActionHandler();
      const ActionHandler = class ActionHandler extends coreModule.api.ActionHandler {
        /**
         * Build system actions
         * Called by Token Action HUD Core
         * @override
         * @param {array} groupIds
         */ a;
        async buildSystemActions(_groupIds) {
          // Set actor and token variables
          this.actorType = this.actor?.type;

          // Settings

          // Set items variable
          if (this.actor) {
            let items = this.actor.items;
            items = coreModule.api.Utils.sortItemsByName(items);
            this.items = items;
          }

          if (this.actorType === 'character') {
            await this.#buildRolls();
            await this.#buildInventory();
          } else if (this.actorType === 'monster') {
            await this.#buildRolls();
            await this.#buildMonsterActions();
          } else if (!this.actor) {
            await this.#buildMultipleTokenActions();
          }
        }

        /**
         * Build multiple token actions
         * @private
         * @returns {object}
         */
        async #buildMultipleTokenActions() {
          await this.#buildRolls();
        }

        async #buildRolls() {
          const actor = this.actor ?? this.actors[0];
          const attributes = actor.system.attributes;
          const diemap = {
            basic: 'd4',
            weapons: 'd6',
            guns: 'd8',
            energy: 'd10',
            ultimate: 'd12',
            strength: 'str',
            dexterity: 'dex',
            constitution: 'cons',
            intelligence: 'int',
            wisdom: 'wis',
            charisma: 'cha',
            defense: 'def',
          };

          let groupData = { id: 'attribute', type: 'system' };
          const attrs = Object.entries(attributes)
            .filter(([effId, _]) => effId !== 'all')
            .map(([attributeId, attributeData]) => {
              let mod = attributeData.total;
              if (mod == null) {
                mod = actor.system.allRollsMod + actor.system.attributes.all + attributeData;
              }
              return {
                id: attributeId,
                name: plusify(mod),
                listName: i18n(attributeId),
                encodedValue: ['attribute', attributeId].join(this.delimiter),
                img: `systems/icrpgme/assets/icons/macro/${diemap[attributeId]}.webp`,
              };
            });
          this.addActions(attrs, groupData);

          const efforts = actor.system.efforts;
          groupData = { id: 'effort', type: 'system' };
          const effs = Object.entries(efforts)
            .filter(([effId, _]) => effId !== 'all')
            .map(([effId, effData]) => {
              let mod = effData.total;
              if (mod == null) {
                mod = actor.system.allRollsMod + actor.system.efforts.all + effData;
              }

              return {
                id: effId,
                name: plusify(mod),
                listName: i18ns('effortsLong.' + effId),
                encodedValue: ['effort', effId].join(this.delimiter),
                img: `systems/icrpgme/assets/icons/macro/${diemap[effId]}.webp`,
              };
            });
          this.addActions(effs, groupData);
        }

        /**
         * Build inventory
         * @private
         */
        async #buildInventory() {
          if (this.items.size === 0) return;

          const actionTypeId = 'item';
          const inventoryMap = new Map();

          for (const [itemId, itemData] of this.items) {
            const type = itemData.type;
            let equipped = itemData.system.equipped;
            if (equipped === undefined) equipped = true;
            if (equipped || this.displayUnequipped) {
              const typeMap = inventoryMap.get(type) ?? new Map();
              typeMap.set(itemId, itemData);
              inventoryMap.set(type, typeMap);
            }
          }

          for (const [type, typeMap] of inventoryMap) {
            const groupId = type;

            if (!groupId) continue;

            const groupData = { id: groupId, type: 'system' };

            // Get actions
            const actions = [...typeMap].map(([itemId, itemData]) => {
              const id = itemId;
              const name = itemData.name;
              const actionTypeName = i18n('item');
              const listName = `${actionTypeName ? `${actionTypeName}: ` : ''}${name}`;
              const encodedValue = [actionTypeId, id].join(this.delimiter);
              const tooltip = { content: itemData.system.description };
              return {
                id,
                name,
                listName,
                encodedValue,
                tooltip,
              };
            });

            // TAH Core method to add actions to the action list
            this.addActions(actions, groupData);
          }
        }

        async #buildMonsterActions() {
          const monsterActions = this.actor.system.monsterActions;
          const groupData = { id: 'monsterAction', type: 'system' };
          const actions = Object.entries(monsterActions).map(([actionId, actionData]) => {
            const name = actionData.name;
            const encodedValue = ['monsterAction', actionId].join(this.delimiter);
            const tooltip = { content: actionData.description };
            return { id: actionId, name, encodedValue, tooltip };
          });
          this.addActions(actions, groupData);
        }
      };

      return new ActionHandler();
    }

    /**
     * Returns a list of roll handlers to Token Action HUD Core
     * Used to populate the Roll Handler module setting choices
     * Called by Token Action HUD Core
     * @override
     * @returns {object} The available roll handlers
     */
    getAvailableRollHandlers() {
      const coreTitle = 'ICRPGME';
      const choices = { core: coreTitle };
      return choices;
    }

    /**
     * Returns an instance of the RollHandler to Token Action HUD Core
     * Called by Token Action HUD Core
     * @override
     * @param {string} rollHandlerId The roll handler ID
     * @returns {class}              The RollHandler instance
     */
    getRollHandler(rollHandlerId) {
      let rollHandler;
      switch (rollHandlerId) {
        case 'core':
        default:
          rollHandler = new RollHandler();
          console.log('Using Core Roll Handler');
          break;
      }
      return rollHandler;
    }

    /**
     * Returns the default layout and groups to Token Action HUD Core
     * Called by Token Action HUD Core
     * @returns {object} The default layout and groups
     */
    async registerDefaults() {
      let groups = {
        loot: { id: 'loot', name: 'TYPES.Item.loot', type: 'system' },
        spell: { id: 'spell', name: 'TYPES.Item.spell', type: 'system' },
        ability: { id: 'ability', name: 'TYPES.Item.ability', type: 'system' },
        power: { id: 'power', name: 'TYPES.Item.power', type: 'system' },
        augment: { id: 'augment', name: 'TYPES.Item.augment', type: 'system' },
        attribute: { id: 'attribute', name: 'ICRPG.attributes', type: 'system' },
        effort: { id: 'effort', name: 'ICRPG.efforts', type: 'system' },
        monsterAction: { id: 'monsterAction', name: 'Monster Action', type: 'system' },
      };
      Object.values(groups).forEach((group) => {
        group.name = i18n(group.name);
        group.listName = `Group: ${i18n(group.listName ?? group.name)}`;
      });
      const groupsArray = Object.values(groups);
      return {
        layout: [
          {
            nestId: 'rolls',
            id: 'rolls',
            name: i18n('Rolls'),
            groups: [
              { ...groups.attribute, nestId: 'rolls_attribute' },
              { ...groups.effort, nestId: 'rolls_effort' },
            ],
          },
          {
            nestId: 'inventory',
            id: 'inventory',
            name: i18n('Inventory'),
            groups: [
              { ...groups.loot, nestId: 'inventory_loot' },
              { ...groups.spell, nestId: 'inventory_spell' },
            ],
          },
          {
            nestId: 'abilities',
            id: 'abilities',
            name: i18n('Abilities'),
            groups: [
              { ...groups.ability, nestId: 'abilities_ability' },
              { ...groups.power, nestId: 'abilities_power' },
              { ...groups.augment, nestId: 'abilities_augment' },
            ],
          },
          {
            nestId: 'monsterActions',
            id: 'monsterActions',
            name: i18n('Monster Actions'),
            groups: [{ ...groups.monsterAction, nestId: 'monsterActions_monsterAction' }],
          },
        ],
        groups: groupsArray,
      };
    }

    /**
     * Register Token Action HUD system module settings
     * Called by Token Action HUD Core
     * @override
     * @param {function} _coreUpdate The Token Action HUD Core update function
     */
    registerSettings(_coreUpdate) {}

    /**
     * Returns styles to Token Action HUD Core
     * Called by Token Action HUD Core
     * @override
     * @returns {object} The TAH system styles
     */
    registerStyles() {}
  };
  let module = {};
  module.api = {
    requiredCoreModuleVersion: '2.0',
    SystemManager,
  };
  Hooks.call('tokenActionHudSystemReady', module);
});
