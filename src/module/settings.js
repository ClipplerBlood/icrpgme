// SPDX-FileCopyrightText: 2022 Johannes Loher
//
// SPDX-License-Identifier: MIT

export function registerSettings() {
  // Register any custom system settings here
  game.settings.register('icrpgme', 'targets', {
    name: 'Targets',
    hint: 'Object storing information relative to targets',
    scope: 'world',
    config: false,
    requiresReload: false,

    type: Object,
    default: {},
    onChange: (value) => console.log(value),
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
