import { registerSettings } from './settings.js';
import { preloadTemplates } from './preload-templates.js';
import { registerSystem } from './register-system.js';
import registerHandlebarsHelpers from './utils/handlebars.js';
import { integrateExternalModules } from './modules-integration.js';
import * as playerMacros from './macros/player-macros.js';
import * as importMacros from './macros/import-macros.js';
import { registerFonts } from './register-fonts.js';
import { sendDevMessages } from './utils/dev-messages.js';
import { importDocuments } from './utils/import-documents.js';
import { handleMigrations } from './migration.js';
import { TimerTargetContainer } from './app/timer-target-app.js';

// Initialize system
Hooks.once('init', async () => {
  console.log('icrpgme | Initializing icrpgme');
  game.icrpgme = {
    apps: new Map(),
    macros: { ...playerMacros, ...importMacros },
  };

  // Assign custom classes and constants here
  registerSystem();

  // Register custom system settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();
  registerHandlebarsHelpers();
});

// Setup system
Hooks.once('setup', async () => {
  // Do anything after initialization but before ready
});

// When ready
Hooks.once('ready', async () => {
  await handleMigrations();
  sendDevMessages();
  await importDocuments();

  // Set the combat tracker icon
  const combatSettings = game.settings.get('core', 'combatTrackerConfig');
  if (game.user.isGM && combatSettings?.turnMarker?.src === '') {
    combatSettings.turnMarker.src = 'modules/icrpg-premium-content/assets/icons/icrpgme.webp';
    await game.settings.set('core', 'combatTrackerConfig', combatSettings);
  }
});

// Add any additional hooks if necessary
integrateExternalModules();
registerFonts();

// Register the custom apps
Hooks.once('ready', () => {
  const app = TimerTargetContainer.create();
  if (app.targets.length === 0 && game.user.isGM) app.addTarget();
});

Hooks.on('collapseSidebar', () => {
  foundry.utils.debounce(() => game.icrpgme.timerTargetContainer?.render(), 250)();
  // game.icrpgme.timerTargetContainer?.render();
});

Hooks.once('ready', async () => {
  await game.actors.get('x5n6lahEB90RGKzn').sheet.render(true);
  await game.actors.get('V4WwwqrRcqUnweHq').sheet.render(true);
});
