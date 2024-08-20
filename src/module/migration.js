import { importGuide } from './utils/import-documents.js';

export async function handleMigrations() {
  if (!game.user.isGM) return;
  const lastMigratedVersion = game.settings.get('icrpgme', 'lastVersion') ?? '0.1';
  const currentVersion = game.system.version;
  if (foundry.utils.isNewerVersion(currentVersion, lastMigratedVersion) || currentVersion === 'This is auto replaced') {
    await importGuide(true);
  }
  await game.settings.set('icrpgme', 'lastVersion', currentVersion);
}
