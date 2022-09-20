import ICRPGActorSheet from './actor/actor-sheet.js';
import { ICRPGActorDataModel } from './data-models/actor-data-model.js';
import { ICRPGActor } from './actor/actor.js';
import { ICRPGItemBaseDataModel, ICRPGItemLootDataModel } from './data-models/item-data-model.js';
import { ICRPGRollMessage } from './chat/chat-message.js';
import { ICRPGItemSheet } from './item/item-sheet.js';
import { ICRPGItem } from './item/item.js';

export function registerSystem() {
  // Actor registration
  CONFIG.Actor.systemDataModels['character'] = ICRPGActorDataModel;
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('icrpgme', ICRPGActorSheet, { makeDefault: true });
  CONFIG.Actor.documentClass = ICRPGActor;

  // Item registration
  CONFIG.Item.systemDataModels['loot'] = ICRPGItemLootDataModel;
  CONFIG.Item.systemDataModels['ability'] = ICRPGItemBaseDataModel;
  CONFIG.Item.systemDataModels['power'] = ICRPGItemBaseDataModel;
  CONFIG.Item.systemDataModels['augment'] = ICRPGItemBaseDataModel;
  Items.unregisterSheet('core', ActorSheet);
  Items.registerSheet('icrpgme', ICRPGItemSheet, { makeDefault: true });
  CONFIG.Item.documentClass = ICRPGItem;

  // ChatMessage registration
  CONFIG.ChatMessage.documentClass = ICRPGRollMessage;
}
