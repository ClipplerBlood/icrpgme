const { loadTemplates } = foundry.applications.handlebars;

export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "systems/icrpgme/templates"
    // Character sheet
    'systems/icrpgme/templates/actor/character-sheet.html',
    'systems/icrpgme/templates/actor/tabs/character-primary-tab.html',
    'systems/icrpgme/templates/actor/tabs/character-loot-tab.html',
    'systems/icrpgme/templates/actor/tabs/character-resources-tab.html',

    // Monster sheet
    'systems/icrpgme/templates/actor/monster-sheet.html',
    'systems/icrpgme/templates/actor/tabs/monster-edit.html',
    'systems/icrpgme/templates/actor/tabs/monster-view.html',

    // Obstacle sheet
    'systems/icrpgme/templates/actor/obstacle-sheet.html',

    // Vehicle
    'systems/icrpgme/templates/actor/vehicle-sheet.html',
    'systems/icrpgme/templates/actor/tabs/vehicle-edit.html',
    'systems/icrpgme/templates/actor/tabs/vehicle-view.html',

    // Hard Suit
    'systems/icrpgme/templates/actor/hardsuit-sheet.html',
    'systems/icrpgme/templates/actor/tabs/hardsuit-primary.html',
    'systems/icrpgme/templates/actor/tabs/hardsuit-stats.html',

    // Item sheet
    'systems/icrpgme/templates/item/generic-item.html',

    // Chat messages
    'systems/icrpgme/templates/chat/roll.html',
    'systems/icrpgme/templates/chat/item.html',
    'systems/icrpgme/templates/chat/action.html',

    // Apps
    'systems/icrpgme/templates/app/timer-target-container.html',

    // Dialog
    'systems/icrpgme/templates/dialog/roll-all-dialog.html',

    // Combat tracker
    'systems/icrpgme/templates/combat/combat-tracker.html',
  ];

  Roll.CHAT_TEMPLATE = 'systems/icrpgme/templates/chat/roll.html';
  return loadTemplates(templatePaths);
}
