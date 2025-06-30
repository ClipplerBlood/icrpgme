import ICRPGBaseActorSheetV2 from '../actor-sheet-v2.js';

export default class ICRPGMonsterSheet extends ICRPGBaseActorSheetV2 {
  static PARTS = {
    header: { template: 'systems/icrpgme/templates/actor-v2/monster/monster-header.hbs' },
  };
}
