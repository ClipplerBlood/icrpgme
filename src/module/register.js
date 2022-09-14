import ICRPGActorSheet from './actor/actor-sheet.js';
import { ICRPGActorDataModel } from './actor/data-model.js';
import { ICRPGActor } from './actor/actor.js';

export function registerSystem() {
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('demonlord', ICRPGActorSheet, { makeDefault: true });
  CONFIG.Actor.documentClass = ICRPGActor;
  CONFIG.Actor.systemDataModels['character'] = ICRPGActorDataModel;
}
