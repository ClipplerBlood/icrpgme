export async function importDocuments() {
  if (game.user.isGM) {
    await importMacros();
    await importGuide();
  }
  await macrosToHotbar();
}

/**
 * Imports all macros from the compendium
 */
async function importMacros() {
  const packMacros = game.packs.get('icrpgme.icrpg-macros');
  const importPromises = [];

  for (const macro of packMacros.index) {
    // Find if the macro is already present
    const match = game.macros.find((m) => m.flags?.icrpgme?.compendiumSourceId === macro._id);
    if (match) continue;

    const updateData = { 'flags.icrpgme.compendiumSourceId': macro._id };
    const p = game.macros.importFromCompendium(packMacros, macro._id, updateData);
    importPromises.push(p);
  }

  return Promise.all(importPromises);
}

/**
 * Adds the imported macros in the hotbar, following a default configuration
 * @returns {Promise<void>}
 */
async function macrosToHotbar() {
  const isUserSetup = game.user.getFlag('icrpgme', 'macrosToHotbar');
  if (isUserSetup) return;

  const importedMacros = game.macros.filter((m) => m.flags?.icrpgme?.compendiumSourceId != null);
  for (const m of importedMacros) {
    const slot = macroSlots[m.name];
    if (!slot) continue;
    await game.user.assignHotbarMacro(m, slot);
  }

  game.user.setFlag('icrpgme', 'macrosToHotbar', true);
  return Promise.resolve(true);
}

const macroSlots = {
  'Roll Selector': 1,
  'Attempt Strength': 2,
  'Attempt Dexterity': 3,
  'Attempt Constitution': 4,
  'Attempt Intelligence': 5,
  'Attempt Wisdom': 6,
  'Attempt Charisma': 7,
  'Effort Basic': 11,
  'Effort Weapons': 12,
  'Effort Guns': 13,
  'Effort Magic': 14,
  'Effort Ultimate': 15,
};

/**
 * Imports the guide
 */
async function importGuide() {
  const packGuide = game.packs.get('icrpgme.icrpg-guide');
  // Same mechanism as import macros. TODO: move this to function?
  for (const guide of packGuide.index) {
    const match = game.journal.find((j) => j.flags?.icrpgme?.compendiumSourceId === guide._id);
    if (match) continue;

    const updateData = { 'flags.icrpgme.compendiumSourceId': guide._id };
    await game.journal.importFromCompendium(packGuide, guide._id, updateData);
  }
  return Promise.resolve(true);
}
