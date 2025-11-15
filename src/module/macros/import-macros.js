import * as TOML from '@ltd/j-toml';
import { ICRPGItem } from '../documents/item.js';
import { ICRPGActor } from '../documents/actor.js';

const ITEM_DN = ICRPGItem.documentName;
const ACTOR_DN = ICRPGActor.documentName;

export async function importTOML(tomlString) {
  const data = TOML.parse(tomlString, { joiner: '\n', bigint: false });
  console.log(data);

  for (const k of Object.keys(data)) {
    if (k === 'type') {
      importTypes(data[k]);
      continue;
    }
    if (k === 'monster') {
      importMonster(data[k]);
      continue;
    }

    let cls = Item;
    let type = 'loot';
    if (['power', 'ability', 'spell'].includes(k)) type = k;

    importList(cls, data[k], type, k, ITEM_DN);
  }
}

async function importList(cls, list, type, folderName, folderType, folderParent = undefined) {
  if (list == null || list.length === 0) return;
  const folder = await Folder.create({ name: folderName, type: folderType, parent: folderParent, sorting: 'm' });
  for (const [index, entry] of list.entries()) {
    if (entry.name == null || entry.name.length === 0) continue;
    const t = entry.type ?? type;
    cls.create({
      type: t,
      folder: folder.id,
      name: entry.name,
      system: entry.system,
      sort: index,
    });
  }
}

async function importTypes(datum) {
  console.log(datum);
  for (const type of datum) {
    const baseFolder = await Folder.create({ name: type.name, type: ITEM_DN, sorting: 'm' });
    importList(Item, type['starting_ability'], 'ability', 'Starting Abilities', ITEM_DN, baseFolder.id);
    importList(Item, type['starting_loot'], 'loot', 'Starting Loot', ITEM_DN, baseFolder.id);
    importList(Item, type['milestone_ability'], 'ability', 'Milestone Abilities', ITEM_DN, baseFolder.id);
    importList(Item, type['milestone_spell'], 'spell', 'Milestone Abilities', ITEM_DN, baseFolder.id);
    importList(Item, type['milestone_loot'], 'loot', 'Milestone Rewards', ITEM_DN, baseFolder.id);
    importList(Item, type['mastery_ability'], 'ability', 'Mastery', ITEM_DN, baseFolder.id);
  }
}

async function importMonster(datum) {
  console.log(datum);
  const folder = await Folder.create({ name: 'MONSTERS', type: ACTOR_DN, sorting: 'm' });
  for (const monster of datum) {
    Actor.create({
      type: 'monster',
      folder: folder.id,
      name: monster.name,
      system: monster.system,
    });
  }
}
