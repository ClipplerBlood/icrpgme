import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';
import { registerSystem } from './register.js';
import registerHandlebarsHelpers from './utils/handlebars.js';
import { integrateExternalModules } from './modules-integration.js';
import { ICRPGToolsLayer } from './canvas/tools-layer.js';

// Initialize system
Hooks.once('init', async () => {
  console.log('icrpgme | Initializing icrpgme');
  game.icrpgme = {
    apps: new Map(),
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
  // Do anything once the system is ready
});

// Add any additional hooks if necessary
integrateExternalModules();

// Register the custom apps
ICRPGToolsLayer.register();
