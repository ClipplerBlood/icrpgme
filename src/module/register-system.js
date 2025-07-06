import ICRPGActorSheet from './applications/actor/actor-sheet.js';
import {
  ICRPGCharacterDataModel,
  ICRPGHardSuitDataModel,
  ICRPGMonsterDataModel,
  ICRPGObstacleDataModel,
  ICRPGVehicleDataModel,
} from './documents/data-models/actor-data-model.js';
import { ICRPGActor } from './documents/actor.js';
import {
  ICRPGItemBaseDataModel,
  ICRPGItemLootDataModel,
  ICRPGItemPowerDataModel,
  ICRPGItemSpellDataModel,
  ICRPGPartDataModel,
  ICRPGPropertyDataModel,
} from './documents/data-models/item-data-model.js';
import { ICRPGRollMessage } from './chat/chat-message.js';
import { ICRPGItemSheet } from './applications/item/item-sheet.js';
import { ICRPGItem } from './documents/item.js';
import { ICRPGCombatTracker } from './applications/combat/combat-tracker.js';
import { ICRPGCombat } from './documents/combat.js';
import { ICRPGToken } from './applications/combat/token.js';
import ICRPGSpellSheet from './applications/item/spell-sheet.js';
import ICRPGItemSheetV2 from './applications/item/item-sheet-v2.js';
import ICRPGPowerSheet from './applications/item/power-sheet.js';
import ICRPGMonsterSheet from './applications/actor/monster-sheet.js';
import ICRPGVehicleSheet from './applications/actor/vehicle-sheet.js';
import ICRPGObstacleSheet from './applications/actor/obstacle-sheet.js';
import ICRPGCharacterSheet from './applications/actor/character-sheet.js';

const { Actors, Items } = foundry.documents.collections;
const { ActorSheet } = foundry.appv1.sheets;
const registerItemSheet = (types, SheetClass) =>
  Items.registerSheet('icrpgme', SheetClass, {
    makeDefault: true,
    types,
    label: 'icrpgme.ICRPGSheetV2',
  });

const registerActorSheet = (types, SheetClass) =>
  Actors.registerSheet('icrpgme', SheetClass, {
    makeDefault: true,
    types,
    label: 'icrpgme.ICRPGSheetV2',
  });

export function registerSystem() {
  // Actor registration
  CONFIG.Actor.dataModels['character'] = ICRPGCharacterDataModel;
  CONFIG.Actor.dataModels['monster'] = ICRPGMonsterDataModel;
  CONFIG.Actor.dataModels['obstacle'] = ICRPGObstacleDataModel;
  CONFIG.Actor.dataModels['vehicle'] = ICRPGVehicleDataModel;
  CONFIG.Actor.dataModels['hardSuit'] = ICRPGHardSuitDataModel;
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('icrpgme', ICRPGActorSheet, { makeDefault: true });
  registerActorSheet(['character'], ICRPGCharacterSheet);
  registerActorSheet(['monster'], ICRPGMonsterSheet);
  registerActorSheet(['vehicle'], ICRPGVehicleSheet);
  registerActorSheet(['obstacle'], ICRPGObstacleSheet);
  CONFIG.Actor.documentClass = ICRPGActor;

  // Item registration
  CONFIG.Item.dataModels['loot'] = ICRPGItemLootDataModel;
  CONFIG.Item.dataModels['ability'] = ICRPGItemBaseDataModel;
  CONFIG.Item.dataModels['power'] = ICRPGItemPowerDataModel;
  CONFIG.Item.dataModels['augment'] = ICRPGItemBaseDataModel;
  CONFIG.Item.dataModels['spell'] = ICRPGItemSpellDataModel;
  CONFIG.Item.dataModels['property'] = ICRPGPropertyDataModel;
  CONFIG.Item.dataModels['part'] = ICRPGPartDataModel;
  Items.unregisterSheet('core', ActorSheet);
  Items.registerSheet('icrpgme', ICRPGItemSheet, { makeDefault: true });
  CONFIG.Item.documentClass = ICRPGItem;

  registerItemSheet(['loot', 'ability', 'augment'], ICRPGItemSheetV2);
  registerItemSheet(['spell'], ICRPGSpellSheet);
  registerItemSheet(['power'], ICRPGPowerSheet);

  // ChatMessage registration
  CONFIG.ChatMessage.documentClass = ICRPGRollMessage;

  // Combat registration
  CONFIG.ui.combat = ICRPGCombatTracker;
  CONFIG.Combat.documentClass = ICRPGCombat;

  // Token
  CONFIG.Token.objectClass = ICRPGToken;
}
