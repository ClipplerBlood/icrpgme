export async function preloadTemplates() {
  const templatePaths = [
    // Add paths to "systems/icrpgme/templates"
    'systems/icrpgme/templates/actor/actor-sheet.html',
  ];

  return loadTemplates(templatePaths);
}
