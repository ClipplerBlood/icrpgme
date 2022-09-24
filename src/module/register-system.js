import ICRPGActorSheet from './actor/actor-sheet.js';
import { ICRPGCharacterDataModel, ICRPGMonsterDataModel } from './data-models/actor-data-model.js';
import { ICRPGActor } from './actor/actor.js';
import { ICRPGItemBaseDataModel, ICRPGItemLootDataModel } from './data-models/item-data-model.js';
import { ICRPGRollMessage } from './chat/chat-message.js';
import { ICRPGItemSheet } from './item/item-sheet.js';
import { ICRPGItem } from './item/item.js';
import { ICRPGCombatTracker } from './combat/combat-tracker.js';
import { ICRPGCombat } from './combat/combat.js';

export function registerSystem() {
  // Actor registration
  CONFIG.Actor.systemDataModels['character'] = ICRPGCharacterDataModel;
  CONFIG.Actor.systemDataModels['monster'] = ICRPGMonsterDataModel;
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

  // Combat registration
  CONFIG.ui.combat = ICRPGCombatTracker;
  CONFIG.Combat.documentClass = ICRPGCombat;
}
