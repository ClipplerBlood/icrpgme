import ICRPGActorSheet from './actor/actor-sheet.js';
import { ICRPGActorDataModel } from './actor/actor-data-model.js';
import { ICRPGActor } from './actor/actor.js';
import { ICRPGItemLootDataModel } from './item/item-data-model.js';

export function registerSystem() {
  // Actor registration
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('demonlord', ICRPGActorSheet, { makeDefault: true });
  CONFIG.Actor.documentClass = ICRPGActor;
  CONFIG.Actor.systemDataModels['character'] = ICRPGActorDataModel;

  // Item registration
  CONFIG.Item.systemDataModels['loot'] = ICRPGItemLootDataModel;
}
