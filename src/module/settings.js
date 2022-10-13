export function registerSettings() {
  // Register any custom system settings here
  game.settings.register('icrpgme', 'trackDamage', {
    name: 'ICRPG.settings.trackDamageName',
    hint: 'ICRPG.settings.trackDamageHint',
    scope: 'world',
    config: true,
    requiresReload: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('icrpgme', 'showMonsterHP', {
    name: 'ICRPG.settings.showMonsterHPName',
    hint: 'ICRPG.settings.showMonsterHPHint',
    scope: 'world',
    config: true,
    requiresReload: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('icrpgme', 'useTokenHearts', {
    name: 'ICRPG.settings.useTokenHeartsName',
    hint: 'ICRPG.settings.useTokenHeartsHint',
    scope: 'world',
    config: true,
    requiresReload: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('icrpgme', 'appData', {
    name: 'apps',
    hint: 'Object [id -> appData] of stored apps. Appdata: {position: {top: <>, left: <>}}',
    scope: 'world',
    config: false,
    requiresReload: false,
    type: Object,
    default: {},
    onChange: (value) => console.log(value),
  });
}
