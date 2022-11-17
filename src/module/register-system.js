import ICRPGActorSheet from './actor/actor-sheet.js';
import {
  ICRPGCharacterDataModel,
  ICRPGMonsterDataModel,
  ICRPGObstacleDataModel,
  ICRPGVehicleDataModel,
} from './data-models/actor-data-model.js';
import { ICRPGActor } from './actor/actor.js';
import {
  ICRPGItemBaseDataModel,
  ICRPGItemLootDataModel,
  ICRPGItemPowerDataModel,
  ICRPGItemSpellDataModel,
} from './data-models/item-data-model.js';
import { ICRPGRollMessage } from './chat/chat-message.js';
import { ICRPGItemSheet } from './item/item-sheet.js';
import { ICRPGItem } from './item/item.js';
import { ICRPGCombatTracker } from './combat/combat-tracker.js';
import { ICRPGCombat } from './combat/combat.js';
import { ICRPGToken } from './combat/token.js';

export function registerSystem() {
  // Actor registration
  CONFIG.Actor.systemDataModels['character'] = ICRPGCharacterDataModel;
  CONFIG.Actor.systemDataModels['monster'] = ICRPGMonsterDataModel;
  CONFIG.Actor.systemDataModels['obstacle'] = ICRPGObstacleDataModel;
  CONFIG.Actor.systemDataModels['vehicle'] = ICRPGVehicleDataModel;
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('icrpgme', ICRPGActorSheet, { makeDefault: true });
  CONFIG.Actor.documentClass = ICRPGActor;

  // Item registration
  CONFIG.Item.systemDataModels['loot'] = ICRPGItemLootDataModel;
  CONFIG.Item.systemDataModels['ability'] = ICRPGItemBaseDataModel;
  CONFIG.Item.systemDataModels['power'] = ICRPGItemPowerDataModel;
  CONFIG.Item.systemDataModels['augment'] = ICRPGItemBaseDataModel;
  CONFIG.Item.systemDataModels['spell'] = ICRPGItemSpellDataModel;
  Items.unregisterSheet('core', ActorSheet);
  Items.registerSheet('icrpgme', ICRPGItemSheet, { makeDefault: true });
  CONFIG.Item.documentClass = ICRPGItem;

  // ChatMessage registration
  CONFIG.ChatMessage.documentClass = ICRPGRollMessage;

  // Combat registration
  CONFIG.ui.combat = ICRPGCombatTracker;
  CONFIG.Combat.documentClass = ICRPGCombat;

  // Token
  CONFIG.Token.objectClass = ICRPGToken;
}
