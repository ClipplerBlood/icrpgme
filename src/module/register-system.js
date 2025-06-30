import ICRPGActorSheet from './actor/actor-sheet.js';
import {
  ICRPGCharacterDataModel,
  ICRPGHardSuitDataModel,
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
  ICRPGPartDataModel,
  ICRPGPropertyDataModel,
} from './data-models/item-data-model.js';
import { ICRPGRollMessage } from './chat/chat-message.js';
import { ICRPGItemSheet } from './item/item-sheet.js';
import { ICRPGItem } from './item/item.js';
import { ICRPGCombatTracker } from './combat/combat-tracker.js';
import { ICRPGCombat } from './combat/combat.js';
import { ICRPGToken } from './combat/token.js';
import ICRPGSpellSheet from './item/sheets/spell-sheet.js';
import ICRPGItemSheetV2 from './item/item-sheet-v2.js';
import ICRPGPowerSheet from './item/sheets/power-sheet.js';
import ICRPGMonsterSheet from './actor/sheets/monster-sheet.js';

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
  registerActorSheet(['monster'], ICRPGMonsterSheet);
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
