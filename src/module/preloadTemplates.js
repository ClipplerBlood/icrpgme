export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "systems/icrpgme/templates"
    // Character sheet
    'systems/icrpgme/templates/actor/character-sheet.html',
    'systems/icrpgme/templates/actor/tabs/character-primary-tab.html',
  ];

  return loadTemplates(templatePaths);
}
