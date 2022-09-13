import ICRPGActorSheet from './actor/actor-sheet.js';

export function registerSystem() {
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('demonlord', ICRPGActorSheet, { makeDefault: true });
}
