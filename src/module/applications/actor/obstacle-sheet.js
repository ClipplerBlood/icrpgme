import ICRPGBaseActorSheetV2 from './actor-sheet-v2.js';

export default class ICRPGObstacleSheet extends ICRPGBaseActorSheetV2 {
  static PARTS = {
    header: {
      template: 'systems/icrpgme/templates/actor-v2/obstacle/obstacle-sheet.hbs',
      scrollable: [''],
    },
  };

  static DEFAULT_OPTIONS = {
    position: {
      width: 440,
      height: 240,
    },
  };
}
