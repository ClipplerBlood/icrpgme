import { importGuide } from './utils/import-documents.js';

export async function handleMigrations() {
  const lastMigratedVersion = game.settings.get('icrpgme', 'lastVersion') ?? '0.1';
  const currentVersion = game.system.version;
  if (isNewerVersion(currentVersion, lastMigratedVersion) || currentVersion === 'This is auto replaced') {
    await importGuide(true);
  }
  await game.settings.set('icrpgme', 'lastVersion', currentVersion);
}
