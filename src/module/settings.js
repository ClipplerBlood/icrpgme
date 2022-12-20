import { TimerTargetContainer } from './app/timer-target-app.js';

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

  game.settings.register('icrpgme', 'useBackground', {
    name: 'ICRPG.settings.useBackgroundName',
    hint: 'ICRPG.settings.useBackgroundHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
    onChange: () => TimerTargetContainer._onUpdate(),
  });

  game.settings.register('icrpgme', 'hideSheetButton', {
    name: 'ICRPG.settings.hideSheetButtonName',
    hint: 'ICRPG.settings.hideSheetButtonHint',
    scope: 'world',
    config: true,
    requiresReload: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('icrpgme', 'hideCombatMastery', {
    name: 'ICRPG.settings.hideCombatMasteryName',
    hint: 'ICRPG.settings.hideCombatMasteryHint',
    scope: 'world',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
    onChange: () => ui.combat?._render(),
  });

  game.settings.register('icrpgme', 'hideCombatSP', {
    name: 'ICRPG.settings.hideCombatSPName',
    hint: 'ICRPG.settings.hideCombatSPHint',
    scope: 'world',
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false,
    onChange: () => ui.combat?._render(),
  });

  // === === === === HIDDEN
  game.settings.register('icrpgme', 'timers', {
    name: 'icrpg-timers',
    hint: 'ICRPG Timers',
    scope: 'world',
    config: false,
    requiresReload: false,
    type: Array,
    default: [],
    onChange: () => TimerTargetContainer._onUpdate(),
  });

  game.settings.register('icrpgme', 'targets', {
    name: 'icrpg-targets',
    hint: 'ICRPG Targets',
    scope: 'world',
    config: false,
    requiresReload: false,
    type: Array,
    default: [],
    onChange: () => TimerTargetContainer._onUpdate(),
  });

  game.settings.register('icrpgme', 'lastVersion', {
    name: 'lastVersion',
    hint: 'lastVersion',
    scope: 'world',
    config: false,
    requiresReload: false,
    type: String,
    default: '0.1',
  });
}
