import { registerSettings } from './settings.js';
import { preloadTemplates } from './preload-templates.js';
import { registerSystem } from './register-system.js';
import registerHandlebarsHelpers from './utils/handlebars.js';
import { integrateExternalModules } from './modules-integration.js';
import { registerICRPGTools } from './register-tools.js';
import * as playerMacros from './macros/player-macros.js';
import * as importMacros from './macros/import-macros.js';
import { registerFonts } from './register-fonts.js';
import { sendDevMessages } from './utils/dev-messages.js';
import { importDocuments } from './utils/import-documents.js';
import { handleMigrations } from './migration.js';

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

  // Register custom sheets (if any)
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
});

// Add any additional hooks if necessary
integrateExternalModules();
registerFonts();

// Register the custom apps
registerICRPGTools();
