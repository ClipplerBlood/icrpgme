import ICRPGActorSheet from './actor/actor-sheet.js';
import { ICRPGActorDataModel } from './data-models/actor-data-model.js';
import { ICRPGActor } from './actor/actor.js';
import { ICRPGItemLootDataModel } from './data-models/item-data-model.js';
import { ICRPGRollMessage } from './chat/chat-message.js';

export function registerSystem() {
  // Actor registration
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('demonlord', ICRPGActorSheet, { makeDefault: true });
  CONFIG.Actor.documentClass = ICRPGActor;
  CONFIG.Actor.systemDataModels['character'] = ICRPGActorDataModel;

  // Item registration
  CONFIG.Item.systemDataModels['loot'] = ICRPGItemLootDataModel;

  // ChatMessage registration
  CONFIG.ChatMessage.documentClass = ICRPGRollMessage;
}
