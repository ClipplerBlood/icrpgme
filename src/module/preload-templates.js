const { loadTemplates } = foundry.applications.handlebars;

export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "systems/icrpgme/templates"
    // Character sheet
    'systems/icrpgme/templates/actor/character-sheet.hbs',
    'systems/icrpgme/templates/actor/tabs/character-primary-tab.hbs',
    'systems/icrpgme/templates/actor/tabs/character-loot-tab.hbs',
    'systems/icrpgme/templates/actor/tabs/character-resources-tab.hbs',

    // Monster sheet
    'systems/icrpgme/templates/actor/monster-sheet.hbs',
    'systems/icrpgme/templates/actor/tabs/monster-edit.hbs',
    'systems/icrpgme/templates/actor/tabs/monster-view.hbs',

    // Obstacle sheet
    'systems/icrpgme/templates/actor/obstacle-sheet.hbs',

    // Vehicle
    'systems/icrpgme/templates/actor/vehicle-sheet.hbs',
    'systems/icrpgme/templates/actor/tabs/vehicle-edit.hbs',
    'systems/icrpgme/templates/actor/tabs/vehicle-view.hbs',

    // Hard Suit
    'systems/icrpgme/templates/actor/hardsuit-sheet.hbs',
    'systems/icrpgme/templates/actor/tabs/hardsuit-primary.hbs',
    'systems/icrpgme/templates/actor/tabs/hardsuit-stats.hbs',

    // Item sheet
    'systems/icrpgme/templates/item/generic-item.hbs',

    // Chat messages
    'systems/icrpgme/templates/chat/roll.hbs',
    'systems/icrpgme/templates/chat/item.hbs',
    'systems/icrpgme/templates/chat/action.hbs',

    // Apps
    'systems/icrpgme/templates/app/timer-target-container.hbs',

    // Dialog
    'systems/icrpgme/templates/dialog/roll-all-dialog.hbs',

    // Combat tracker
    'systems/icrpgme/templates/combat/combat-tracker.hbs',
    'systems/icrpgme/templates/combat/combat-header.hbs',
  ];

  Roll.CHAT_TEMPLATE = 'systems/icrpgme/templates/chat/roll.hbs';
  return loadTemplates(templatePaths);
}
